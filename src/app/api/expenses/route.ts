import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const expenseSchema = z.object({
  amount: z.number().positive(),
  originalCurrency: z.string(),
  category: z.string(),
  description: z.string().optional(),
  expenseDate: z.string().datetime(),
  receiptUrl: z.string().optional(),
  receiptPublicId: z.string().optional(),
})

// GET all expenses (filtered by user role)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let expenses

    if (session.user.role === 'ADMIN') {
      // Admin sees all company expenses
      expenses = await prisma.expense.findMany({
        where: {
          companyId: session.user.companyId,
          ...(status && { status: status as any }),
        },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (session.user.role === 'MANAGER') {
      // Manager sees their team's expenses
      const manager = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          employees: true
        }
      })

      const employeeIds = manager?.employees.map(emp => emp.id) || []

      expenses = await prisma.expense.findMany({
        where: {
          OR: [
            { userId: session.user.id }, // Their own expenses
            { userId: { in: employeeIds } }, // Team expenses
          ],
          ...(status && { status: status as any }),
        },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Employee sees only their expenses
      expenses = await prisma.expense.findMany({
        where: {
          userId: session.user.id,
          ...(status && { status: status as any }),
        },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new expense
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = expenseSchema.parse(body)

    // Convert currency if needed
    let convertedAmount = data.amount
    if (data.originalCurrency !== session.user.companyCurrency) {
      const exchangeResponse = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${data.originalCurrency}`
      )
      const exchangeData = await exchangeResponse.json()
      const rate = exchangeData.rates[session.user.companyCurrency]
      convertedAmount = data.amount * rate
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        originalCurrency: data.originalCurrency,
        convertedAmount,
        category: data.category,
        description: data.description,
        expenseDate: new Date(data.expenseDate),
        receiptUrl: data.receiptUrl,
        receiptPublicId: data.receiptPublicId,
        userId: session.user.id,
        companyId: session.user.companyId,
      },
    })

    // Get user's manager to create approval workflow
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        manager: true
      }
    })

    // Create approval request for manager if exists and isManagerApprover is true
    if (user?.manager && user.manager.isManagerApprover) {
      await prisma.approvalRequest.create({
        data: {
          expenseId: expense.id,
          approverId: user.managerId!,
          sequence: 1,
        }
      })
    }

    // TODO: Check for additional approval rules based on amount/category

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
