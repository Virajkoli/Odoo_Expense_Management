import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/notifications"
import { z } from "zod"

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
})

// Helper function to check if conditional approval rules are satisfied
async function checkConditionalApprovalRules(expenseId: string, currentSequence: number) {
  // Get all approval requests at the current sequence level
  const approvalRequests = await prisma.approvalRequest.findMany({
    where: {
      expenseId,
      sequence: currentSequence,
    },
    include: {
      approver: true,
      expense: {
        include: {
          company: {
            include: {
              approvalRules: {
                where: {
                  isActive: true,
                },
                include: {
                  approvers: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (approvalRequests.length === 0) {
    return { shouldApprove: false, shouldReject: false }
  }

  const expense = approvalRequests[0].expense
  const approvalRules = expense.company.approvalRules

  // Find which rule applies to this sequence
  let currentRule = null
  let ruleSequence = 1

  // First check if manager approval was required (sequence 1)
  const hasManagerApproval = await prisma.approvalRequest.findFirst({
    where: {
      expenseId,
      sequence: 1,
      approver: {
        employees: {
          some: {
            id: expense.userId,
          },
        },
      },
    },
  })

  if (hasManagerApproval) {
    ruleSequence = 2 // Rules start from sequence 2 if manager approval exists
  }

  // Map the current sequence to the approval rule
  for (const rule of approvalRules) {
    if (currentSequence === ruleSequence) {
      currentRule = rule
      break
    }
    ruleSequence++
  }

  if (!currentRule) {
    return { shouldApprove: false, shouldReject: false }
  }

  // Count approvals and rejections at this sequence level
  const totalApprovers = approvalRequests.length
  const approvedCount = approvalRequests.filter((ar: any) => ar.status === 'APPROVED').length
  const rejectedCount = approvalRequests.filter((ar: any) => ar.status === 'REJECTED').length
  const pendingCount = approvalRequests.filter((ar: any) => ar.status === 'PENDING').length

  // Check if any rejection should reject the entire expense
  if (rejectedCount > 0) {
    return { shouldApprove: false, shouldReject: true }
  }

  // Apply rule logic based on rule type
  if (currentRule.ruleType === 'PERCENTAGE') {
    const requiredPercentage = currentRule.percentage || 100
    const approvedPercentage = (approvedCount / totalApprovers) * 100

    if (approvedPercentage >= requiredPercentage) {
      return { shouldApprove: true, shouldReject: false }
    }

    // Check if it's impossible to reach the required percentage
    const maxPossiblePercentage = ((approvedCount + pendingCount) / totalApprovers) * 100
    if (maxPossiblePercentage < requiredPercentage) {
      return { shouldApprove: false, shouldReject: true }
    }

    return { shouldApprove: false, shouldReject: false }
  }

  if (currentRule.ruleType === 'SPECIFIC_APPROVER') {
    // Check if any special approver has approved
    const specialApprovers = currentRule.approvers.filter((a: any) => a.isSpecialApprover)
    const specialApproverIds = specialApprovers.map((a: any) => a.userId)

    const hasSpecialApproval = approvalRequests.some(
      (ar: any) => ar.status === 'APPROVED' && specialApproverIds.includes(ar.approverId)
    )

    if (hasSpecialApproval) {
      return { shouldApprove: true, shouldReject: false }
    }

    // Check if all special approvers have responded
    const specialApprovalRequests = approvalRequests.filter((ar: any) => 
      specialApproverIds.includes(ar.approverId)
    )
    const allSpecialApproversResponded = specialApprovalRequests.every(
      (ar: any) => ar.status !== 'PENDING'
    )

    if (allSpecialApproversResponded && !hasSpecialApproval) {
      return { shouldApprove: false, shouldReject: true }
    }

    return { shouldApprove: false, shouldReject: false }
  }

  if (currentRule.ruleType === 'HYBRID') {
    // Hybrid: Percentage OR Special Approver
    const requiredPercentage = currentRule.percentage || 100
    const approvedPercentage = (approvedCount / totalApprovers) * 100

    // Check special approver first
    const specialApprovers = currentRule.approvers.filter((a: any) => a.isSpecialApprover)
    const specialApproverIds = specialApprovers.map((a: any) => a.userId)

    const hasSpecialApproval = approvalRequests.some(
      (ar: any) => ar.status === 'APPROVED' && specialApproverIds.includes(ar.approverId)
    )

    if (hasSpecialApproval) {
      return { shouldApprove: true, shouldReject: false }
    }

    // Check percentage
    if (approvedPercentage >= requiredPercentage) {
      return { shouldApprove: true, shouldReject: false }
    }

    // Check if it's impossible to satisfy either condition
    const maxPossiblePercentage = ((approvedCount + pendingCount) / totalApprovers) * 100
    const specialApprovalRequests = approvalRequests.filter((ar: any) => 
      specialApproverIds.includes(ar.approverId)
    )
    const allSpecialApproversResponded = specialApprovalRequests.every(
      (ar: any) => ar.status !== 'PENDING'
    )

    if (maxPossiblePercentage < requiredPercentage && allSpecialApproversResponded) {
      return { shouldApprove: false, shouldReject: true }
    }

    return { shouldApprove: false, shouldReject: false }
  }

  return { shouldApprove: false, shouldReject: false }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json(
        { error: "Forbidden - Only managers and admins can approve expenses" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { status, comments } = approvalSchema.parse(body)

    // Find the approval request
    const approvalRequest = await prisma.approvalRequest.findFirst({
      where: {
        expenseId: params.id,
        approverId: session.user.id,
        status: 'PENDING'
      },
      include: {
        expense: {
          include: {
            approvalRequests: {
              orderBy: {
                sequence: 'asc'
              }
            }
          }
        }
      }
    })

    if (!approvalRequest) {
      return NextResponse.json(
        { error: "Approval request not found or already processed" },
        { status: 404 }
      )
    }

    // Update approval request
    await prisma.approvalRequest.update({
      where: { id: approvalRequest.id },
      data: {
        status,
        comments,
      }
    })

    const currentSequence = approvalRequest.sequence

    if (status === 'REJECTED') {
      // If rejected, update expense status and reject all pending approvals at this sequence
      await prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: comments,
        }
      })

      // Update all other pending approvals at this sequence to rejected
      await prisma.approvalRequest.updateMany({
        where: {
          expenseId: params.id,
          sequence: currentSequence,
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          comments: 'Auto-rejected due to rejection by another approver',
        }
      })

      // Send rejection notification
      await NotificationService.notifyExpenseRejection(
        params.id,
        session.user.id,
        comments
      )

      return NextResponse.json({
        message: "Expense rejected successfully",
        status: 'REJECTED',
      })
    }

    // If approved, check conditional approval rules
    const { shouldApprove, shouldReject } = await checkConditionalApprovalRules(
      params.id,
      currentSequence
    )

    if (shouldReject) {
      // Conditions not met, reject the expense
      await prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Approval conditions not met',
        }
      })

      // Send rejection notification
      await NotificationService.notifyExpenseRejection(
        params.id,
        session.user.id,
        'Approval conditions not met'
      )

      return NextResponse.json({
        message: "Expense rejected - approval conditions not met",
        status: 'REJECTED',
      })
    }

    if (shouldApprove) {
      // Check if there are more sequences
      const nextSequenceExists = approvalRequest.expense.approvalRequests.some(
        (ar: any) => ar.sequence === currentSequence + 1
      )

      if (nextSequenceExists) {
        // Move to next approval sequence (requests already created)
        return NextResponse.json({
          message: "Approval processed - moved to next approver",
          status: 'PENDING',
        })
      } else {
        // No more sequences, approve the expense
        await prisma.expense.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
          }
        })

        // Send approval notification
        await NotificationService.notifyExpenseApproval(
          params.id,
          session.user.id
        )

        return NextResponse.json({
          message: "Expense approved successfully",
          status: 'APPROVED',
        })
      }
    }

    // Conditions not yet met, waiting for more approvals
    return NextResponse.json({
      message: "Approval recorded - waiting for other approvers",
      status: 'PENDING',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Error processing approval:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
