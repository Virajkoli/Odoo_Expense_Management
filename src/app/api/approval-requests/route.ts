import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET approval requests for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only managers and admins can view approval requests
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json(
        { error: "Forbidden - Only managers and admins can view approval requests" },
        { status: 403 }
      )
    }

    // Fetch approval requests for current user
    const approvalRequests = await prisma.approvalRequest.findMany({
      where: {
        approverId: session.user.id,
      },
      include: {
        expense: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            approvalRequests: {
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              },
              orderBy: {
                sequence: 'asc'
              }
            }
          }
        }
      },
      orderBy: [
        {
          status: 'asc' // PENDING first
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json(approvalRequests)
  } catch (error) {
    console.error("Error fetching approval requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
