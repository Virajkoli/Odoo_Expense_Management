# Admin Functionality Guide

## Overview

The Admin functionality provides comprehensive control over the Expense Management System. This guide covers all admin-specific features based on the implemented system.

## Admin Access

### Who is an Admin?
- The **first user** who signs up automatically becomes an Admin
- Admins have **full access** to all features
- Only Admins can:
  - Create and manage users
  - Configure approval rules
  - View all company expenses
  - Override approvals (future feature)

### Accessing Admin Features

After signing in as an Admin, you'll see additional menu items:
- **Users** - User management
- **Approval Rules** - Configure approval workflows

---

## 1. User Management

### Overview
Admins can create and manage all users in the organization, assign roles, and establish manager-employee relationships.

### Creating a New User

1. Navigate to **Dashboard → Users**
2. Click **"Add User"** button
3. Fill in the user details:

#### Required Fields:
- **Full Name**: User's complete name
- **Email**: Unique email address (used for login)
- **Password**: Minimum 6 characters
- **Role**: Choose between:
  - **Employee** - Can submit and view own expenses
  - **Manager** - Can approve expenses + all Employee permissions

#### Optional Fields:
- **Assign Manager**: Select from existing Managers/Admins
- **Manager must approve**: Check if the assigned manager should approve this user's expenses

### User Roles & Permissions

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Create Company | ✅ Auto on signup | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Submit Expenses | ✅ | ✅ | ✅ |
| View Own Expenses | ✅ | ✅ | ✅ |
| View Team Expenses | ✅ | ✅ (own team) | ❌ |
| View All Expenses | ✅ | ❌ | ❌ |
| Approve Expenses | ✅ | ✅ (if in workflow) | ❌ |
| Configure Approval Rules | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

### Manager Hierarchy

**Setting up a manager hierarchy:**

1. Create Manager users first
2. When creating Employees, select their Manager
3. Enable "Manager must approve" for manager-based approval workflow

**Example Structure:**
```
Admin (You)
├── Finance Manager
│   ├── Accountant 1 (Employee)
│   └── Accountant 2 (Employee)
└── Operations Manager
    ├── Team Lead (Manager)
    │   ├── Developer 1 (Employee)
    │   └── Developer 2 (Employee)
    └── Support Rep (Employee)
```

### User Dashboard Overview

The Users page shows:
- **Total count** by role (Admins, Managers, Employees)
- **User list** with:
  - Name and email
  - Role badge
  - Assigned manager
  - Team size (for managers)
  - Manager approver status
  - Join date

---

## 2. Approval Rules

### Overview
Approval Rules define **how expenses are approved** in your organization. You can create sophisticated workflows based on different criteria.

### Rule Types

#### 1. **Percentage Rule**
Expense is approved when a certain percentage of selected approvers approve it.

**Example:**
- Name: "Standard Expense Approval"
- Type: Percentage
- Percentage: 60%
- Approvers: 5 managers
- **Result**: Expense approved when 3 out of 5 (60%) approve

**Use Case:** Democratic approval for standard expenses

#### 2. **Specific Approver Rule**
Expense is auto-approved when a designated "special approver" approves it.

**Example:**
- Name: "CFO Auto-Approve"
- Type: Specific Approver
- Approvers: 
  - CFO ⭐ (Special)
  - Finance Manager
  - Operations Manager
- **Result**: If CFO approves, expense is immediately approved regardless of others

**Use Case:** Senior leadership can fast-track important expenses

#### 3. **Hybrid Rule**
Combines both percentage AND specific approver rules.

**Example:**
- Name: "Flexible High-Value Approval"
- Type: Hybrid
- Percentage: 75%
- Approvers:
  - CEO ⭐ (Special)
  - CFO ⭐ (Special)
  - Finance Manager
  - Operations Manager
- **Result**: Expense approved if:
  - 75% of approvers approve (3 out of 4), **OR**
  - CEO or CFO approves (regardless of percentage)

**Use Case:** Flexibility for both democratic process and executive override

### Creating an Approval Rule

1. Navigate to **Dashboard → Approval Rules**
2. Click **"Add Approval Rule"**

#### Step-by-Step:

**1. Basic Information**
```
Rule Name: "Standard Expense Approval"
Description: "For all expenses under $1000"
```

**2. Select Rule Type**
- Choose from: Percentage, Specific Approver, or Hybrid

**3. Configure Percentage** (if applicable)
```
Required Approval Percentage: 60%
```
This means 60% of selected approvers must approve

**4. Set Sequence**
```
Sequence: 1
```
- Lower numbers = processed first
- Use for multi-stage approvals

**5. Select Approvers**
- Check ✅ to include an approver
- Mark ⭐ for special approvers (Specific/Hybrid rules only)

**Example Selection:**
| User | Role | Include | Special |
|------|------|---------|---------|
| John Doe | Manager | ✅ | - |
| Jane Smith | Manager | ✅ | ⭐ |
| CFO Mike | Admin | ✅ | ⭐ |

### Managing Approval Rules

#### Activating/Deactivating Rules
- Click the toggle icon to activate/deactivate
- Active rules: 🟢 Green toggle
- Inactive rules: ⚫ Gray toggle
- Inactive rules are not applied to new expenses

#### Viewing Rule Details
Each rule shows:
- Rule name and status
- Rule type badge
- Required approval percentage
- Number of approvers
- Sequence number
- List of approvers (⭐ indicates special approvers)

### Multi-Level Approval Workflows

You can create **sequential approval workflows** using the sequence field:

**Example: 3-Stage Approval**

**Stage 1 (Sequence: 1)**
```
Name: "Manager Approval"
Type: Specific Approver
Special Approver: Direct Manager ⭐
```

**Stage 2 (Sequence: 2)**
```
Name: "Finance Review"  
Type: Percentage
Percentage: 60%
Approvers: Finance Team (3 people)
```

**Stage 3 (Sequence: 3)**
```
Name: "Executive Sign-off"
Type: Specific Approver
Special Approver: CFO ⭐
```

**How it works:**
1. Expense submitted → Manager must approve first
2. If manager approves → Goes to Finance Team
3. If 60% of Finance approves → Goes to CFO
4. If CFO approves → Expense fully approved

### Best Practices

#### Start Simple
```
Rule: "Basic Manager Approval"
Type: Specific Approver
Special Approver: Any Manager
```

#### Gradually Add Complexity
```
Rule: "High-Value Expense"
Type: Hybrid
Percentage: 75%
Special Approver: CFO
Condition: Amount > $5000 (future feature)
```

#### Use Clear Naming
- ✅ "Standard Expense - Manager Approval"
- ✅ "High Value - CFO Required"
- ❌ "Rule 1"
- ❌ "Approval"

#### Document Your Rules
Use the description field:
```
Description: "Applied to all expenses under $1000. 
Requires 2 out of 3 managers to approve."
```

---

## 3. Expense Overview (Admin View)

### Dashboard Statistics

Admins see company-wide statistics:
- **Total Expenses**: All expenses across company
- **Pending Approvals**: Awaiting approval
- **Approved**: Successfully approved expenses

### Viewing All Expenses

**Admin privileges:**
- View **all expenses** in the company
- See **all approval requests** and their status
- Filter by status (Pending, Approved, Rejected)
- View expenses in **company currency** (auto-converted)

### Expense Details Visible to Admin

For each expense:
- Employee name and email
- Original amount and currency
- Converted amount (in company currency)
- Category and description
- Submission date
- Receipt (if uploaded)
- **Approval workflow progress:**
  - Who approved
  - Who rejected
  - Who's pending
  - Comments from approvers

---

## 4. Company Settings

### Currency Management

**Set during signup:**
- Country selection automatically sets company currency
- Uses [RestCountries API](https://restcountries.com) for accurate mapping

**Currency Conversion:**
- All expenses auto-convert to company currency
- Uses [ExchangeRate API](https://api.exchangerate-api.com)
- Real-time rates
- Supports 150+ currencies

**Example:**
```
Company Currency: USD
Employee submits: €100 EUR
System converts: $108.50 USD (at current rate)
Admin sees: $108.50 USD
```

---

## 5. Advanced Features (Future Enhancements)

### Conditional Approval Rules
```
IF expense.amount > 5000 THEN
  Apply "High-Value Approval Rule"
ELSE
  Apply "Standard Approval Rule"
```

### Department-Based Rules
```
Rule: "IT Department Expenses"
Condition: Employee.department = "IT"
Approver: IT Manager
```

### Auto-Escalation
```
IF no approval in 48 hours THEN
  Escalate to next level approver
```

### Approval Delegation
```
Manager on vacation:
  Delegate approvals to backup manager
```

---

## 6. Common Admin Tasks

### Task 1: Onboard New Employee

1. **Create User Account**
   - Go to Users → Add User
   - Enter: name, email, password
   - Role: Employee
   - Assign Manager: Select direct manager
   - ✅ Check "Manager must approve"

2. **Verify Setup**
   - User appears in Users list
   - Manager's team size increases
   - Employee can now login

### Task 2: Set Up Approval Workflow

1. **Create Managers** (if not exists)
   - Add Manager users first

2. **Create Approval Rule**
   - Go to Approval Rules → Add Rule
   - Choose rule type based on needs
   - Select approvers
   - Set percentage (if applicable)
   - Mark special approvers (if applicable)

3. **Activate Rule**
   - Ensure toggle is green (active)

### Task 3: Review All Expenses

1. **Dashboard View**
   - See high-level statistics

2. **Detailed View** (future)
   - Go to Expenses → View All
   - Filter by status, date, employee
   - Export reports

---

## 7. Security & Access Control

### Admin Responsibilities

✅ **Protect admin credentials**
✅ **Create users with least privilege** (Employee by default)
✅ **Review approval workflows regularly**
✅ **Monitor expense patterns**
✅ **Update rules as company grows**

### Access Levels

```
Admin → Full System Access
  ↓
Manager → Team Expenses + Approvals
  ↓
Employee → Own Expenses Only
```

---

## 8. Troubleshooting

### Issue: Can't see Admin menu items
**Solution:** Ensure you're logged in as an Admin. First signup becomes admin automatically.

### Issue: Approval rule not working
**Solution:** 
- Check if rule is active (green toggle)
- Verify approvers are selected
- For percentage rules, ensure percentage is set
- For special approver rules, ensure special approver is marked

### Issue: User can't submit expense
**Solution:**
- Verify user has Employee/Manager role
- Check if manager is assigned (if manager approval required)
- Ensure user is active

---

## 9. API Endpoints (For Developers)

### User Management
```typescript
GET /api/users - List all users (Admin only)
POST /api/users - Create user (Admin only)
```

### Approval Rules
```typescript
GET /api/approval-rules - List all rules (Admin only)
POST /api/approval-rules - Create rule (Admin only)
PATCH /api/approval-rules - Update rule (Admin only)
```

### Expenses
```typescript
GET /api/expenses - List expenses (role-based filtering)
POST /api/expenses - Create expense
PATCH /api/expenses/[id]/approve - Approve/Reject
```

---

## Quick Reference Card

| Task | Navigation | Required Role |
|------|-----------|---------------|
| Create User | Users → Add User | Admin |
| Create Approval Rule | Approval Rules → Add Rule | Admin |
| View All Expenses | Dashboard | Admin |
| Assign Manager | Users → Add/Edit User | Admin |
| Activate Rule | Approval Rules → Toggle | Admin |
| View Company Stats | Dashboard | Admin |

---

**Need Help?** Check the [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for technical details.
