import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email"
import bcrypt from "bcryptjs"
import { z } from "zod"

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['EMPLOYEE', 'MANAGER']),
  managerId: z.string().optional(),
  isManagerApprover: z.boolean().optional(),
})

// GET all users in company
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
        { error: "Forbidden - Only admins can view all users" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new user (Admin only)
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
        { error: "Forbidden - Only admins can create users" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = userSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Store plain password for email (before hashing)
    const plainPassword = data.password

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        companyId: session.user.companyId,
        managerId: data.managerId,
        isManagerApprover: data.isManagerApprover || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
      }
    })

    // Send welcome email with credentials
    try {
      const emailTemplate = getWelcomeEmailTemplate(user.name, user.email, plainPassword)
      await sendEmail({
        to: user.email,
        ...emailTemplate,
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail user creation if email fails, but log it
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
