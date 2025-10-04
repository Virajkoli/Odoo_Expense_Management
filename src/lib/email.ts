import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME || 'Expense Management'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new Error('Failed to send email')
  }
}

// Welcome email template for new users
export function getWelcomeEmailTemplate(name: string, email: string, password: string) {
  return {
    subject: 'Welcome to Expense Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .credentials { background-color: #fff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Expense Management System</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your account has been created by an administrator. You can now access the Expense Management System to manage and submit your expenses.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 3px;">${password}</code></p>
              </div>

              <div class="warning">
                <p><strong>⚠️ Important Security Notice:</strong></p>
                <p>This is a temporary password. For security reasons, we strongly recommend that you change your password immediately after your first login.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" class="button">Sign In Now</a>

              <h3>Next Steps:</h3>
              <ol>
                <li>Click the "Sign In Now" button above</li>
                <li>Use your email and temporary password to login</li>
                <li>Go to Settings → Change Password</li>
                <li>Set a strong, unique password</li>
              </ol>

              <p>If you have any questions or need assistance, please contact your administrator.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Expense Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

// Password reset request email template
export function getPasswordResetEmailTemplate(name: string, resetLink: string) {
  return {
    subject: 'Reset Your Password - Expense Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .warning { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your Expense Management System account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>

              <p>Or copy and paste this link into your browser:</p>
              <p style="background-color: #e5e7eb; padding: 10px; border-radius: 3px; word-break: break-all;">
                ${resetLink}
              </p>

              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>This password reset link will expire in <strong>1 hour</strong> for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email or contact your administrator if you're concerned about your account security.</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Expense Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

// Password reset confirmation email template
export function getPasswordResetConfirmationTemplate(name: string) {
  return {
    subject: 'Your Password Has Been Changed',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .success { background-color: #d1fae5; border-left: 4px solid: #10b981; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Password Changed Successfully</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <div class="success">
                <p>Your password has been successfully changed.</p>
              </div>

              <p>You can now sign in with your new password.</p>
              
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" class="button">Sign In</a>

              <p>If you didn't make this change, please contact your administrator immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Expense Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}
