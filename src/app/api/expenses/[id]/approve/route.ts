import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
})

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

    // Check if this is the last approval in sequence
    const currentSequence = approvalRequest.sequence
    const nextApprovalRequest = approvalRequest.expense.approvalRequests.find(
      ar => ar.sequence === currentSequence + 1
    )

    if (status === 'REJECTED') {
      // If rejected, update expense status
      await prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: comments,
        }
      })
    } else if (status === 'APPROVED' && !nextApprovalRequest) {
      // If approved and no more approvers, mark expense as approved
      await prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
        }
      })
    }

    return NextResponse.json({
      message: "Approval processed successfully",
      status,
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
