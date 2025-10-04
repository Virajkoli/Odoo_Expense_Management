import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const approvalRuleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  ruleType: z.enum(['PERCENTAGE', 'SPECIFIC_APPROVER', 'HYBRID']),
  percentage: z.number().min(1).max(100).optional(),
  sequence: z.number().default(1),
  approvers: z.array(z.object({
    userId: z.string(),
    isSpecialApprover: z.boolean().default(false),
    sequence: z.number().default(1),
  })),
})

// GET all approval rules
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Forbidden - Only admins can view approval rules" },
        { status: 403 }
      )
    }

    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        approvers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      },
      orderBy: {
        sequence: 'asc'
      }
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching approval rules:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new approval rule
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Forbidden - Only admins can create approval rules" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = approvalRuleSchema.parse(body)

    // Validate rule type requirements
    if ((data.ruleType === 'PERCENTAGE' || data.ruleType === 'HYBRID') && !data.percentage) {
      return NextResponse.json(
        { error: "Percentage is required for PERCENTAGE and HYBRID rules" },
        { status: 400 }
      )
    }

    if ((data.ruleType === 'SPECIFIC_APPROVER' || data.ruleType === 'HYBRID') && 
        !data.approvers.some(a => a.isSpecialApprover)) {
      return NextResponse.json(
        { error: "At least one special approver is required for SPECIFIC_APPROVER and HYBRID rules" },
        { status: 400 }
      )
    }

    // Create rule with approvers in a transaction
    const rule = await prisma.$transaction(async (tx) => {
      const newRule = await tx.approvalRule.create({
        data: {
          name: data.name,
          description: data.description,
          companyId: session.user.companyId,
          ruleType: data.ruleType,
          percentage: data.percentage,
          sequence: data.sequence,
        }
      })

      // Create approvers
      await tx.approvalRuleApprover.createMany({
        data: data.approvers.map(approver => ({
          approvalRuleId: newRule.id,
          userId: approver.userId,
          isSpecialApprover: approver.isSpecialApprover,
          sequence: approver.sequence,
        }))
      })

      return newRule
    })

    // Fetch the complete rule with approvers
    const completeRule = await prisma.approvalRule.findUnique({
      where: { id: rule.id },
      include: {
        approvers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(completeRule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating approval rule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update approval rule
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Forbidden - Only admins can update approval rules" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 }
      )
    }

    // Update rule
    const rule = await prisma.approvalRule.update({
      where: { id },
      data: {
        isActive: updateData.isActive,
      },
      include: {
        approvers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error updating approval rule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
