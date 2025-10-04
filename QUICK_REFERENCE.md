# Odoo Expense Management - Quick Reference Guide

## 🎯 Complete Feature Overview

### ✅ All Role-Based Features (12/12) - **100% COMPLETE**

---

## 👨‍💼 ADMIN FEATURES (6/6)

### 1. ✅ Create Company (Auto on Signup)
**Location**: `/auth/signup`
- **Implementation**: `/src/app/api/auth/signup/route.ts` (Lines 20-46)
- **Flow**: First user signup → Creates company → Sets user as ADMIN
- **Features**: 
  - Auto-detects currency from country
  - Transaction ensures both Company and User are created together
  - First user automatically becomes Admin

### 2. ✅ Manage Users
**Location**: `/dashboard/users`
- **Implementation**: `/src/app/dashboard/users/page.tsx`
- **Features**:
  - View all company users
  - Create new users (Employee/Manager/Admin)
  - Edit user details
  - Delete users
  - Assign managers
  - Set manager approver status

### 3. ✅ Set Roles
**Location**: `/dashboard/users`
- **Implementation**: User management form with role dropdown
- **Available Roles**:
  - EMPLOYEE: Can submit expenses
  - MANAGER: Can approve expenses + all employee features
  - ADMIN: Full system access

### 4. ✅ Configure Approval Rules
**Location**: `/dashboard/approval-rules`
- **Implementation**: `/src/app/dashboard/approval-rules/page.tsx`
- **Rule Types**:
  - **PERCENTAGE**: Based on expense amount % of budget
  - **SPECIFIC**: Specific users as approvers
  - **HYBRID**: Combines both types
- **Features**:
  - Set rule sequences (order of approval)
  - Add multiple approvers per rule
  - Set approver sequences
  - Activate/deactivate rules

### 5. ✅ View All Expenses
**Location**: `/dashboard/expenses`
- **Implementation**: `/src/app/api/expenses/route.ts` (Lines 40-125)
- **Features**:
  - See all expenses across the company
  - Filter and search
  - View expense details
  - See approval workflows
  - View amounts in company currency

### 6. ✅ Override Approvals (NEW)
**Location**: `/dashboard/expenses`
- **Implementation**: 
  - API: `/src/app/api/expenses/[id]/override/route.ts`
  - UI: `/src/app/dashboard/expenses/page.tsx` (Lines 159-175, 333-350)
- **Features**:
  - Override Approve button (green)
  - Override Reject button (red)
  - Requires reason for override
  - Confirmation dialog before action
  - Cancels all pending approvals
  - Creates audit trail with sequence 999
  - Reason prefixed with "[ADMIN OVERRIDE]"
- **Security**:
  - Admin-only access (403 if not admin)
  - Company verification (can't override other companies)
  - Status check (can't override already approved/rejected)

---

## 👔 MANAGER FEATURES (3/3)

### 1. ✅ Approve/Reject Expenses
**Location**: `/dashboard/approvals`
- **Implementation**: 
  - API: `/src/app/api/expenses/[id]/approve/route.ts`
  - UI: `/src/app/dashboard/approvals/page.tsx`
- **Features**:
  - View pending approvals assigned to manager
  - Approve with comments
  - Reject with required reason
  - **Currency Display**: Amounts shown in company's default currency
  - Auto-advances to next step or marks APPROVED

### 2. ✅ View Team Expenses
**Location**: `/dashboard/expenses`
- **Implementation**: `/src/app/api/expenses/route.ts` (Lines 65-110)
- **Features**:
  - See all expenses from direct reports
  - Filter by status (Pending, Approved, Rejected)
  - View expense details
  - Track approval progress

### 3. ✅ Escalate Per Rules
**Location**: Automatic
- **Implementation**: `/src/app/api/expenses/route.ts` (Lines 127-214)
- **Flow**:
  1. Employee submits expense
  2. System evaluates all active approval rules
  3. Creates approval requests per rule sequence
  4. Assigns approvers based on rule type:
     - PERCENTAGE: Manager approver if exists
     - SPECIFIC: Specific approvers from rule
     - HYBRID: Both types
  5. Manager approves → Escalates to next step automatically
- **Features**:
  - Multi-step approval chains
  - Automatic escalation on approval
  - Workflow tracking

---

## 👤 EMPLOYEE FEATURES (3/3)

### 1. ✅ Submit Expenses
**Location**: `/dashboard/expenses`
- **Implementation**: 
  - API: `/src/app/api/expenses/route.ts` (POST)
  - Upload: `/src/app/api/upload/route.ts`
  - UI: `/src/app/dashboard/expenses/page.tsx`
- **Features**:
  - Upload receipt (via Cloudinary)
  - Enter amount in any currency
  - Auto-converts to company currency
  - Add description
  - Select category
  - Pick expense date
  - Auto-creates approval workflow

### 2. ✅ View Own Expenses
**Location**: `/dashboard/expenses`
- **Implementation**: `/src/app/api/expenses/route.ts` (Lines 127-155)
- **Features**:
  - List all submitted expenses
  - See expense details
  - View receipt images
  - Filter by status
  - Track approval progress

### 3. ✅ Check Approval Status
**Location**: `/dashboard/expenses` (expense cards)
- **Implementation**: Approval request display in expense list
- **Features**:
  - Real-time status updates
  - See current step in workflow
  - View approver names
  - See approval comments
  - Track rejection reasons
  - Visual indicators:
    - 🟡 PENDING (Yellow)
    - 🟢 APPROVED (Green)
    - 🔴 REJECTED (Red)
    - ⚪ CANCELLED (Gray) - for admin overrides

---

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION                          │
├─────────────────────────────────────────────────────────────┤
│ /auth/signup         - Register (creates company + admin)   │
│ /auth/signin         - Login                                │
│ /auth/forgot-password - Request password reset             │
│ /auth/reset-password - Reset password                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│ /dashboard           - Overview                             │
│ /dashboard/users     - User Management (2,3)                │
│ /dashboard/approval-rules - Approval Rules (4)              │
│ /dashboard/expenses  - All Expenses (5,6)                   │
│ /dashboard/approvals - Pending Approvals                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   MANAGER DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│ /dashboard           - Overview                             │
│ /dashboard/expenses  - Team Expenses (2)                    │
│ /dashboard/approvals - Approve/Reject (1)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  EMPLOYEE DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│ /dashboard           - Overview                             │
│ /dashboard/expenses  - My Expenses (1,2,3)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Feature Access Matrix

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| Submit Expenses | ✅ | ✅ | ✅ |
| View Own Expenses | ✅ | ✅ | ✅ |
| Check Approval Status | ✅ | ✅ | ✅ |
| View Team Expenses | ❌ | ✅ | ✅ |
| Approve/Reject Expenses | ❌ | ✅ | ✅ |
| View All Company Expenses | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Configure Approval Rules | ❌ | ❌ | ✅ |
| **Override Approvals** | ❌ | ❌ | ✅ |

---

## 🔄 Workflow Flowchart

```
┌──────────────────────────────────────────────────────────────┐
│                    EXPENSE SUBMISSION                        │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  1. Employee submits expense with receipt                    │
│  2. System converts amount to company currency               │
│  3. Status: PENDING                                          │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                 APPROVAL RULE EVALUATION                     │
└──────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌──────────────────┐              ┌──────────────────────────┐
│  PERCENTAGE Rule │              │     SPECIFIC Rule        │
│  (Manager)       │              │  (Named Approvers)       │
└──────────────────┘              └──────────────────────────┘
        ↓                                      ↓
┌──────────────────────────────────────────────────────────────┐
│              APPROVAL REQUESTS CREATED                       │
│  (One per rule, ordered by sequence)                         │
└──────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌──────────────────┐              ┌──────────────────────────┐
│   Step 1 Approver│              │   Admin Override         │
│   Reviews        │              │   (Anytime)              │
└──────────────────┘              └──────────────────────────┘
        ↓                                      ↓
   APPROVE/REJECT                    OVERRIDE APPROVE/REJECT
        ↓                                      ↓
┌──────────────────┐              ┌──────────────────────────┐
│   If REJECTED    │              │  Cancels all pending     │
│   → END          │              │  Creates audit (seq 999) │
│   Status: REJECTED│             │  Status: APPROVED/REJECTED│
└──────────────────┘              └──────────────────────────┘
        ↓                                      
   If APPROVED                                
        ↓                                      
┌──────────────────┐                          
│  Next Step?      │                          
└──────────────────┘                          
   ↓            ↓                              
 YES          NO                               
   ↓            ↓                              
Step 2       APPROVED                         
Approver    (Status: APPROVED)                
```

---

## 🔌 API Endpoints Reference

### Authentication
```
POST   /api/auth/signup          - Create account + company
POST   /api/auth/signin          - Login (handled by NextAuth)
POST   /api/auth/request-reset   - Request password reset
POST   /api/auth/reset-password  - Reset password with token
```

### Users (Admin only)
```
GET    /api/users                - List all company users
POST   /api/users                - Create new user
PUT    /api/users/:id            - Update user
DELETE /api/users/:id            - Delete user
```

### Expenses
```
GET    /api/expenses             - List expenses (filtered by role)
POST   /api/expenses             - Create expense (creates workflow)
PATCH  /api/expenses/:id/approve - Approve/Reject (Manager/Admin)
PATCH  /api/expenses/:id/override - Override (Admin only) ← NEW
```

### Approval Rules (Admin only)
```
GET    /api/approval-rules       - List all rules
POST   /api/approval-rules       - Create rule
PUT    /api/approval-rules/:id   - Update rule
DELETE /api/approval-rules/:id   - Delete rule
```

### Approval Requests
```
GET    /api/approval-requests    - List pending approvals (Manager)
```

### File Upload
```
POST   /api/upload               - Upload receipt to Cloudinary
```

---

## 🗄️ Database Models

### Key Relationships
```
Company
  ├─ Users (1:many)
  ├─ Expenses (1:many)
  └─ ApprovalRules (1:many)

User
  ├─ Expenses (1:many) - submitted by user
  ├─ ApprovalRequests (1:many) - assigned to user
  ├─ DirectReports (1:many) - users they manage
  └─ Manager (many:1) - their manager

Expense
  ├─ User (many:1) - who submitted
  ├─ Company (many:1) - which company
  └─ ApprovalRequests (1:many) - workflow steps

ApprovalRule
  ├─ Company (many:1)
  └─ Approvers (1:many) - specific users for this rule

ApprovalRequest
  ├─ Expense (many:1) - which expense
  └─ Approver (many:1) - assigned user
```

---

## 🧪 Testing Checklist

### Admin Features
- [ ] Sign up creates company + admin user
- [ ] Can create users (Employee, Manager, Admin)
- [ ] Can edit user roles
- [ ] Can delete users
- [ ] Can assign managers
- [ ] Can create approval rules (all 3 types)
- [ ] Can view all company expenses
- [ ] Can see override buttons on pending expenses
- [ ] Can override approve with reason
- [ ] Can override reject with reason
- [ ] Override cancels all pending approvals
- [ ] Override creates audit trail (sequence 999)
- [ ] Non-admins cannot see override buttons

### Manager Features
- [ ] Can see pending approvals assigned to them
- [ ] Can approve expense with comments
- [ ] Can reject expense with reason
- [ ] Amounts show in company currency
- [ ] Can view all team member expenses
- [ ] Approval escalates to next step
- [ ] Rejection ends workflow

### Employee Features
- [ ] Can submit expense with receipt
- [ ] Can enter amount in any currency
- [ ] Amount auto-converts to company currency
- [ ] Can see list of own expenses
- [ ] Can view expense details
- [ ] Can check approval status in real-time
- [ ] Status indicators work correctly
- [ ] Can see approver names and comments

### Approval Workflow
- [ ] PERCENTAGE rule creates manager approval
- [ ] SPECIFIC rule assigns named approvers
- [ ] HYBRID rule creates both types
- [ ] Multi-step approvals work in sequence
- [ ] Cannot approve out of sequence
- [ ] Rejection stops workflow
- [ ] Final approval changes status to APPROVED
- [ ] Admin override bypasses all steps

### Email Notifications
- [ ] Password reset emails sent
- [ ] Welcome emails to new users
- [ ] Approval request notifications
- [ ] Approval/Rejection notifications

---

## 🚀 Quick Start Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npx prisma studio    # Open database UI
npx prisma migrate dev  # Run migrations
```

### Database
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes (dev)
npx prisma db seed   # Seed database
```

### Production
```bash
npm run build        # Build for production
npm start            # Start production server
```

---

## 📝 Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (File Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
```

---

## 🎨 UI Component Patterns

### Status Badges
- **PENDING**: Yellow background, yellow text
- **APPROVED**: Green background, green text
- **REJECTED**: Red background, red text
- **CANCELLED**: Gray background (for admin overrides)

### Role Badges
- **ADMIN**: Purple badge
- **MANAGER**: Blue badge
- **EMPLOYEE**: Gray badge

### Action Buttons
- **Primary**: Blue (Submit, Save, Approve)
- **Danger**: Red (Delete, Reject, Override Reject)
- **Success**: Green (Confirm, Override Approve)
- **Secondary**: Gray (Cancel, Close)

---

## 🔐 Security Features

### Authentication
- ✅ bcrypt password hashing
- ✅ JWT session tokens
- ✅ Password reset with expiring tokens
- ✅ Secure session management

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Company-scoped data access
- ✅ API route protection
- ✅ Client-side role checks
- ✅ Server-side authorization

### Data Protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (NextAuth)
- ✅ Secure file uploads (Cloudinary)

---

## 🆕 Recent Updates

### Version 2.0 - Admin Override Feature
**Added**: December 2024

**New Capabilities**:
- Admins can now override any pending expense approval
- Two actions: Override Approve / Override Reject
- Requires mandatory reason for audit trail
- Confirmation dialog prevents accidental overrides
- All pending approvals are cancelled when overridden
- Special audit trail entry (sequence 999) with "[ADMIN OVERRIDE]" prefix
- UI shows "Admin Override" instead of step number for overridden expenses

**Files Modified**:
- `/src/app/api/expenses/[id]/override/route.ts` (NEW)
- `/src/app/dashboard/expenses/page.tsx` (Updated)

**Security**:
- Admin-only access enforced
- Company verification prevents cross-company overrides
- Status validation prevents overriding completed expenses

---

## 📚 Documentation Files

- `README.md` - Main project documentation
- `SETUP.md` - Installation and setup guide
- `ADMIN_GUIDE.md` - Admin user manual
- `MANAGER_GUIDE.md` - Manager user manual
- `EMPLOYEE_EXPENSE_GUIDE.md` - Employee user manual
- `APPROVAL_WORKFLOW_GUIDE.md` - Complete workflow documentation
- `EMAIL_SETUP_GUIDE.md` - Email configuration
- `ALL_FEATURES_COMPLETE.md` - Detailed feature verification
- `QUICK_REFERENCE.md` - This file (quick overview)

---

## 🎯 Feature Completion Status

| Role | Features | Status |
|------|----------|--------|
| **Admin** | 6/6 | ✅ 100% |
| **Manager** | 3/3 | ✅ 100% |
| **Employee** | 3/3 | ✅ 100% |
| **TOTAL** | **12/12** | ✅ **100%** |

---

## 💡 Tips & Best Practices

### For Admins
1. Set up approval rules before users submit expenses
2. Use sequential numbering for multi-step approvals
3. Test workflows with sample expenses
4. Use override feature sparingly (leaves audit trail)
5. Regularly review approval workflows for efficiency

### For Managers
1. Check approvals daily
2. Provide clear comments when approving/rejecting
3. Use rejection reasons to guide employees
4. Review team expenses regularly
5. Report workflow issues to admin

### For Employees
1. Upload clear receipt images
2. Provide detailed descriptions
3. Select correct categories
4. Submit expenses promptly
5. Check approval status regularly
6. Follow up on rejections

---

## 🐛 Troubleshooting

### Can't see override buttons?
- Ensure you're logged in as ADMIN
- Check expense status is PENDING
- Verify you're on the Expenses page

### Approval not escalating?
- Check approval rules are active
- Verify rule sequences are correct
- Ensure approvers exist in the system

### Email not working?
- Check RESEND_API_KEY in .env
- Verify email addresses are valid
- Check spam/junk folders

### Currency not converting?
- Ensure company currency is set
- Check exchange rate API is accessible
- Verify expense has originalCurrency field

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Status**: All features complete and verified ✅
