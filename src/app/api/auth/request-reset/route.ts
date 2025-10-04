import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email"
import { randomBytes } from "crypto"
import { z } from "zod"

const requestResetSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = requestResetSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success message (security best practice - don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link shortly."
      })
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = randomBytes(32).toString('hex')
    
    // Set expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    })

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Send email
    const emailTemplate = getPasswordResetEmailTemplate(user.name, resetLink)
    
    try {
      await sendEmail({
        to: user.email,
        ...emailTemplate,
      })
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      // Don't reveal email sending failure to user
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link shortly."
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
