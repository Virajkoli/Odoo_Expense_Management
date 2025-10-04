# Expense Management System

A comprehensive expense management system built with Next.js, PostgreSQL, and Cloudinary that supports multi-level approval workflows, currency conversion, and role-based access control.

## 🎯 Complete Feature Overview

### ✅ All Role-Based Features (12/12) - 100% COMPLETE

---

## 👨‍💼 ADMIN Features (6/6)

### 1. ✅ Create Company (Auto on Signup)
- First user signup automatically creates company
- Auto-detects currency from selected country
- First user becomes Admin automatically

### 2. ✅ Manage Users
- View all company users
- Create new users (Employee/Manager/Admin)
- Edit user details and delete users
- Assign managers to employees

### 3. ✅ Set Roles
- Three roles: EMPLOYEE, MANAGER, ADMIN
- Role-based access control throughout the system
- Manager approver flag for approval workflows

### 4. ✅ Configure Approval Rules
- **PERCENTAGE**: Based on expense amount % threshold
- **SPECIFIC**: Named approvers for specific steps
- **HYBRID**: Combines both types
- Sequential multi-level approvals
- Activate/deactivate rules

### 5. ✅ View All Expenses
- See all expenses across the company
- Filter and search capabilities
- View complete approval history
- Amounts in company currency

### 6. ✅ Override Approvals **NEW!**
- Override approve or reject any pending expense
- Requires mandatory reason for audit trail
- Cancels all pending approvals
- Creates special audit entry (sequence 999)
- Admin-only access with security checks

---

## 👔 MANAGER Features (3/3)

### 1. ✅ Approve/Reject Expenses
- View pending approvals assigned to manager
- Approve with optional comments
- Reject with required reason
- **Currency display in company's default currency**
- Auto-escalates to next approval step

### 2. ✅ View Team Expenses
- See all expenses from direct reports
- Filter by status (Pending, Approved, Rejected)
- Track team spending

### 3. ✅ Escalate Per Rules
- Automatic workflow creation on expense submission
- Multi-step approval chains
- Rule-based escalation (manager → finance → director)
- Workflow tracking and visualization

---

## 👤 EMPLOYEE Features (3/3)

### 1. ✅ Submit Expenses
- Upload receipt (Cloudinary integration)
- Enter amount in any currency (auto-converts)
- Select category and add description
- Pick expense date
- Auto-creates approval workflow

### 2. ✅ View Own Expenses
- List all submitted expenses
- See expense details and receipts
- Filter by status

### 3. ✅ Check Approval Status
- Real-time status updates
- See current step in workflow
- View approver names and comments
- Track rejection reasons
- Visual status indicators

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

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM 5.18
- **Authentication**: NextAuth.js 4.24 with JWT
- **File Storage**: Cloudinary 2.4
- **State Management**: TanStack Query (React Query)
- **Form Validation**: Zod
- **Email**: Resend (for notifications)

## 📦 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Cloudinary account (free tier available)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Virajkoli/Odoo_Expense_Management.git
cd Odoo_Expense_Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_management"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Optional - for notifications)
RESEND_API_KEY="your-resend-api-key"

# Email (Optional - for notifications)
RESEND_API_KEY="your-resend-api-key"

# External APIs (already configured)
EXCHANGE_RATE_API_URL="https://api.exchangerate-api.com/v4/latest"
COUNTRIES_API_URL="https://restcountries.com/v3.1/all?fields=name,currencies"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set up PostgreSQL Database

```bash
# Create database
createdb expense_management

# Or using psql
psql -U postgres
CREATE DATABASE expense_management;
\q
```

### 5. Set up the database schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Create Your First Admin Account

1. Navigate to `http://localhost:3000`
2. Click "create a new account"
3. Fill in the signup form:
   - Email, Password, Name
   - Company Name
   - Country (currency auto-detected)
4. You'll be automatically signed in as Admin

---

## 🔄 Expense Workflow

```
Employee Submits Expense
         ↓
System Creates Approval Workflow
         ↓
┌────────┴────────┐
↓                 ↓
Manager Approval  Admin Override (anytime)
         ↓
Step 2 Approval (if configured)
         ↓
Final Status: APPROVED / REJECTED
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account + company
- `POST /api/auth/signin` - Login (NextAuth)
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users (Admin only)
- `GET /api/users` - List all company users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Expenses
- `GET /api/expenses` - List expenses (role-filtered)
- `POST /api/expenses` - Create expense + workflow
- `PATCH /api/expenses/:id/approve` - Approve/Reject
- `PATCH /api/expenses/:id/override` - Admin override

### Approval Rules (Admin only)
- `GET /api/approval-rules` - List all rules
- `POST /api/approval-rules` - Create rule
- `PUT /api/approval-rules/:id` - Update rule
- `DELETE /api/approval-rules/:id` - Delete rule

### Other
- `GET /api/approval-requests` - Pending approvals
- `POST /api/upload` - Upload receipt to Cloudinary

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication
│   │   │   ├── signup/        # User registration
│   │   │   ├── request-reset/ # Password reset request
│   │   │   └── reset-password/# Password reset
│   │   ├── expenses/          # Expense CRUD
│   │   │   └── [id]/
│   │   │       ├── approve/   # Approve/Reject
│   │   │       └── override/  # Admin override
│   │   ├── users/             # User management
│   │   ├── approval-rules/    # Approval rules
│   │   ├── approval-requests/ # Pending approvals
│   │   └── upload/            # File upload
│   ├── auth/                  # Auth pages
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/             # Protected pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── expenses/         # Expense management
│   │   ├── approvals/        # Pending approvals
│   │   ├── users/            # User management (admin)
│   │   └── approval-rules/   # Rules config (admin)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   └── providers.tsx         # Session & Query providers
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── cloudinary.ts        # File upload
│   ├── email.ts             # Email sending
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Helper functions
└── types/
    └── next-auth.d.ts       # NextAuth types

prisma/
└── schema.prisma            # Database schema
```

---

## 🗄️ Database Schema

### Key Models

**Company**
- Stores organization details
- Default currency setting
- One-to-many with Users, Expenses, ApprovalRules

**User**
- Email, password (hashed), name, role
- Belongs to Company
- Has optional Manager (for reporting)
- `isManagerApprover` flag for approval workflows

**Expense**
- Amount, currency, category, description, date
- Receipt URL and public ID (Cloudinary)
- Status: PENDING, APPROVED, REJECTED
- Belongs to User and Company
- One-to-many with ApprovalRequests

**ApprovalRule**
- Name, description, sequence
- Rule type: PERCENTAGE, SPECIFIC, HYBRID
- Percentage threshold (for PERCENTAGE/HYBRID)
- Active/Inactive status
- One-to-many with ApprovalRuleApprovers

**ApprovalRuleApprover**
- Links specific Users to ApprovalRules
- Sequence for ordering approvers
- Special approver flag

**ApprovalRequest**
- Links Expense to Approver (User)
- Status: PENDING, APPROVED, REJECTED, CANCELLED
- Sequence (step number in workflow)
- Comments from approver
- Timestamps

---

## 🔐 Security Features

### Authentication & Authorization
- ✅ bcrypt password hashing
- ✅ JWT session tokens (NextAuth)
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Client-side role checks
- ✅ Server-side authorization

### Data Protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (NextAuth)
- ✅ Secure file uploads (Cloudinary)
- ✅ Company-scoped data access

### Admin Override Audit Trail
- ✅ Mandatory reason required
- ✅ Special sequence number (999)
- ✅ Cannot override completed expenses
- ✅ Company verification (no cross-company access)

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## � External APIs

- **Countries API**: Fetch country and currency data
  - `https://restcountries.com/v3.1/all?fields=name,currencies`
  
- **Exchange Rate API**: Real-time currency conversion
  - `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

---

## 🧪 Testing Checklist

### Admin Features
- [ ] Sign up creates company + admin user
- [ ] Can create users (all roles)
- [ ] Can edit user roles
- [ ] Can delete users
- [ ] Can assign managers
- [ ] Can create approval rules (3 types)
- [ ] Can view all company expenses
- [ ] Can override approve/reject pending expenses
- [ ] Override creates audit trail
- [ ] Non-admins cannot override

### Manager Features
- [ ] Can see pending approvals
- [ ] Can approve with comments
- [ ] Can reject with reason
- [ ] Currency displays correctly
- [ ] Can view team expenses
- [ ] Approval escalates to next step

### Employee Features
- [ ] Can submit expense with receipt
- [ ] Currency auto-converts
- [ ] Can view own expenses
- [ ] Can check approval status
- [ ] Status indicators work

---

## 🎨 UI Component Patterns

### Status Badges
- **PENDING**: Yellow background
- **APPROVED**: Green background
- **REJECTED**: Red background
- **CANCELLED**: Gray background (overridden)

### Role Badges
- **ADMIN**: Purple
- **MANAGER**: Blue
- **EMPLOYEE**: Gray

---

## 🚧 Future Enhancements

- [ ] Email notifications for approvals
- [ ] Expense analytics dashboard
- [ ] Bulk upload via CSV
- [ ] Mobile app (React Native)
- [ ] Accounting software integration
- [ ] Advanced OCR with ML
- [ ] Audit logs and compliance reports
- [ ] Export to PDF/Excel

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Ensure PostgreSQL is running
sudo service postgresql status

# Verify DATABASE_URL in .env
# Check database exists
psql -l
```

### Prisma Client Error
```bash
npm run db:generate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Cloudinary Upload Error
- Verify credentials in `.env`
- Check file size limits (default: 10MB)
- Review Cloudinary dashboard for quota

---

## 📚 Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For specific guides:
- First-time setup and testing
- Database configuration
- Cloudinary setup
- Email configuration
- Production deployment

---

## 📄 License

MIT License

## 👥 Contributors

- Viraj Koli - [GitHub](https://github.com/Virajkoli)

## 🐛 Issues & Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/Virajkoli/Odoo_Expense_Management/issues) page.

---

**Made with ❤️ using Next.js 14, PostgreSQL, and TypeScript**

**Version**: 2.0  
**Last Updated**: October 2024  
**Status**: All features complete ✅