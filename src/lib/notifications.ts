import { prisma } from '@/lib/prisma'

interface CreateNotificationData {
  userId: string
  title: string
  message: string
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  expenseId?: string
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          expenseId: data.expenseId,
          read: false,
        }
      })
      
      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  static async notifyExpenseApproval(expenseId: string, approverId: string) {
    try {
      // Get expense details with user information
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      // Get approver information
      const approver = await prisma.user.findUnique({
        where: { id: approverId },
        select: {
          name: true,
        }
      })

      if (!approver) {
        throw new Error('Approver not found')
      }

      // Create notification for the employee
      await this.createNotification({
        userId: expense.userId,
        title: '✅ Expense Approved',
        message: `Your expense "${expense.category}" for ${expense.originalCurrency} ${expense.amount.toFixed(2)} has been approved by ${approver.name}.`,
        type: 'SUCCESS',
        expenseId: expense.id,
      })

      return true
    } catch (error) {
      console.error('Failed to send approval notification:', error)
      return false
    }
  }

  static async notifyExpenseRejection(expenseId: string, approverId: string, reason?: string) {
    try {
      // Get expense details with user information
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      // Get approver information
      const approver = await prisma.user.findUnique({
        where: { id: approverId },
        select: {
          name: true,
        }
      })

      if (!approver) {
        throw new Error('Approver not found')
      }

      const reasonText = reason ? ` Reason: ${reason}` : ''

      // Create notification for the employee
      await this.createNotification({
        userId: expense.userId,
        title: '❌ Expense Rejected',
        message: `Your expense "${expense.category}" for ${expense.originalCurrency} ${expense.amount.toFixed(2)} has been rejected by ${approver.name}.${reasonText}`,
        type: 'ERROR',
        expenseId: expense.id,
      })

      return true
    } catch (error) {
      console.error('Failed to send rejection notification:', error)
      return false
    }
  }

  static async notifyExpenseSubmitted(expenseId: string) {
    try {
      // Get expense details with user information
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              managerId: true,
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        }
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      // Notify employee about successful submission
      await this.createNotification({
        userId: expense.userId,
        title: '📄 Expense Submitted',
        message: `Your expense "${expense.category}" for ${expense.originalCurrency} ${expense.amount.toFixed(2)} has been submitted for approval.`,
        type: 'INFO',
        expenseId: expense.id,
      })

      // Notify manager if exists
      if (expense.user.manager) {
        await this.createNotification({
          userId: expense.user.manager.id,
          title: '📋 New Expense for Approval',
          message: `${expense.user.name} submitted an expense "${expense.category}" for ${expense.originalCurrency} ${expense.amount.toFixed(2)} requiring your approval.`,
          type: 'INFO',
          expenseId: expense.id,
        })
      }

      return true
    } catch (error) {
      console.error('Failed to send submission notification:', error)
      return false
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        }
      })
      
      return count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }
}