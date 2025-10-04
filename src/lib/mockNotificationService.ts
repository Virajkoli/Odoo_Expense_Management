// Mock notification service for demonstration
export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  createdAt: string;
  userId?: string;
  expenseId?: string;
}

class MockNotificationService {
  private notifications: MockNotification[] = [
    {
      id: "1",
      title: "✅ Expense Approved",
      message:
        'Your expense "Travel to Conference" for USD 150.00 has been approved by John Manager.',
      type: "SUCCESS",
      read: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      expenseId: "exp_1",
    },
    {
      id: "2",
      title: "📄 Expense Submitted",
      message:
        'Your expense "Office Supplies" for USD 75.00 has been submitted for approval.',
      type: "INFO",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expenseId: "exp_2",
    },
    {
      id: "3",
      title: "❌ Expense Rejected",
      message:
        'Your expense "Business Lunch" for USD 45.00 has been rejected. Reason: Missing receipt attachment.',
      type: "ERROR",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      expenseId: "exp_3",
    },
    {
      id: "4",
      title: "⚠️ Expense Requires Attention",
      message:
        'Your expense "Hotel Booking" for USD 280.00 needs additional documentation.',
      type: "WARNING",
      read: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      expenseId: "exp_4",
    },
  ];

  private listeners: Array<(notifications: MockNotification[]) => void> = [];

  // Simulate getting notifications for a user
  getNotifications(userId?: string): MockNotification[] {
    return this.notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Simulate marking a notification as read
  markAsRead(notificationId: string): MockNotification[] {
    this.notifications = this.notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    this.notifyListeners();
    return this.notifications;
  }

  // Simulate marking all notifications as read
  markAllAsRead(): MockNotification[] {
    this.notifications = this.notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    this.notifyListeners();
    return this.notifications;
  }

  // Simulate deleting a notification
  deleteNotification(notificationId: string): MockNotification[] {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== notificationId
    );
    this.notifyListeners();
    return this.notifications;
  }

  // Simulate creating a new notification when expense is approved
  notifyExpenseApproval(
    expenseId: string,
    expenseTitle: string,
    amount: number,
    approverName: string
  ): MockNotification {
    const notification: MockNotification = {
      id: Date.now().toString(),
      title: "✅ Expense Approved",
      message: `Your expense "${expenseTitle}" for USD ${amount.toFixed(
        2
      )} has been approved by ${approverName}.`,
      type: "SUCCESS",
      read: false,
      createdAt: new Date().toISOString(),
      expenseId,
    };

    this.notifications.unshift(notification);
    this.notifyListeners();
    return notification;
  }

  // Simulate creating a new notification when expense is rejected
  notifyExpenseRejection(
    expenseId: string,
    expenseTitle: string,
    amount: number,
    reason: string
  ): MockNotification {
    const notification: MockNotification = {
      id: Date.now().toString(),
      title: "❌ Expense Rejected",
      message: `Your expense "${expenseTitle}" for USD ${amount.toFixed(
        2
      )} has been rejected. Reason: ${reason}`,
      type: "ERROR",
      read: false,
      createdAt: new Date().toISOString(),
      expenseId,
    };

    this.notifications.unshift(notification);
    this.notifyListeners();
    return notification;
  }

  // Simulate creating a new notification when expense needs attention
  notifyExpenseNeedsAttention(
    expenseId: string,
    expenseTitle: string,
    amount: number,
    reason: string
  ): MockNotification {
    const notification: MockNotification = {
      id: Date.now().toString(),
      title: "⚠️ Expense Requires Attention",
      message: `Your expense "${expenseTitle}" for USD ${amount.toFixed(
        2
      )} needs attention. ${reason}`,
      type: "WARNING",
      read: false,
      createdAt: new Date().toISOString(),
      expenseId,
    };

    this.notifications.unshift(notification);
    this.notifyListeners();
    return notification;
  }

  // Subscribe to notification changes
  subscribe(callback: (notifications: MockNotification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications));
  }

  // Simulate real-time updates
  simulateNewNotification() {
    const mockExpenses = [
      { title: "Coffee Meeting", amount: 25 },
      { title: "Taxi Ride", amount: 18 },
      { title: "Office Lunch", amount: 35 },
      { title: "Parking Fee", amount: 15 },
      { title: "Client Dinner", amount: 125 },
    ];

    const mockApprovers = [
      "Sarah Johnson",
      "Mike Wilson",
      "Emma Davis",
      "Alex Chen",
    ];
    const randomExpense =
      mockExpenses[Math.floor(Math.random() * mockExpenses.length)];
    const randomApprover =
      mockApprovers[Math.floor(Math.random() * mockApprovers.length)];

    // Randomly choose between approval, rejection, or attention needed
    const notificationType = Math.random();

    if (notificationType < 0.6) {
      // 60% chance of approval
      this.notifyExpenseApproval(
        `exp_${Date.now()}`,
        randomExpense.title,
        randomExpense.amount,
        randomApprover
      );
    } else if (notificationType < 0.8) {
      // 20% chance of rejection
      const rejectionReasons = [
        "Missing receipt",
        "Exceeds policy limit",
        "Invalid business purpose",
        "Duplicate submission",
      ];
      const randomReason =
        rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
      this.notifyExpenseRejection(
        `exp_${Date.now()}`,
        randomExpense.title,
        randomExpense.amount,
        randomReason
      );
    } else {
      // 20% chance of needs attention
      const attentionReasons = [
        "Please provide additional documentation.",
        "Receipt image is unclear.",
        "Category needs to be updated.",
        "Description requires more details.",
      ];
      const randomReason =
        attentionReasons[Math.floor(Math.random() * attentionReasons.length)];
      this.notifyExpenseNeedsAttention(
        `exp_${Date.now()}`,
        randomExpense.title,
        randomExpense.amount,
        randomReason
      );
    }
  }
}

// Create a singleton instance
export const mockNotificationService = new MockNotificationService();

// Auto-generate new notifications every 30 seconds for demo purposes
if (typeof window !== "undefined") {
  setInterval(() => {
    if (Math.random() < 0.3) {
      // 30% chance every 30 seconds
      mockNotificationService.simulateNewNotification();
    }
  }, 30000);
}
