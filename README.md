# Expense Management System

A comprehensive expense management system built with Next.js, PostgreSQL, and Cloudinary that supports multi-level approval workflows, currency conversion, and OCR-based receipt processing.

## 🚀 Features

### Authentication & User Management
- **Auto-setup on first signup**: Creates a new company with the country's currency and an admin user
- **Role-based access control**: Admin, Manager, and Employee roles
- **User management**: Admins can create employees and managers, assign roles, and define manager relationships

### Expense Submission (Employee Role)
- Submit expense claims with:
  - Amount (supports multiple currencies)
  - Category
  - Description
  - Date
  - Receipt upload
- View expense history (Approved/Rejected)
- Track approval status in real-time

### Approval Workflow (Manager/Admin Role)
- **Manager-based approval**: Expenses first approved by direct manager (if `isManagerApprover` is enabled)
- **Sequential multi-level approvals**: Define approval sequences (Manager → Finance → Director)
- **Conditional approval flows**:
  - Percentage-based: e.g., 60% of approvers must approve
  - Specific approver: e.g., CFO approval auto-approves
  - Hybrid: Combine both (60% OR CFO approves)
- Approve/Reject with comments
- View pending approvals dashboard

### Currency Management
- Automatic currency conversion to company's default currency
- Real-time exchange rates via ExchangeRate API
- Support for 150+ currencies

### OCR for Receipts
- Scan receipts and auto-extract:
  - Amount
  - Date
  - Description
  - Expense type
  - Merchant name

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **State Management**: TanStack Query (React Query)
- **Form Validation**: Zod
- **UI Components**: Custom components with Tailwind CSS

## 📦 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Cloudinary account
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
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

# External APIs (already configured)
EXCHANGE_RATE_API_URL="https://api.exchangerate-api.com/v4/latest"
COUNTRIES_API_URL="https://restcountries.com/v3.1/all?fields=name,currencies"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── expenses/          # Expense CRUD & approval
│   │   └── users/             # User management
│   ├── auth/                  # Auth pages (signin/signup)
│   ├── dashboard/             # Dashboard pages
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                # React components
├── lib/                       # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
└── types/                     # TypeScript type definitions

prisma/
└── schema.prisma             # Database schema

```

## 🗄️ Database Schema

### Main Models

- **Company**: Organization details with currency settings
- **User**: Users with roles (Admin, Manager, Employee)
- **Expense**: Expense records with status tracking
- **ApprovalRule**: Configurable approval workflows
- **ApprovalRuleApprover**: Approvers assigned to rules
- **ApprovalRequest**: Individual approval requests

## 🔒 Permissions

| Role     | Permissions |
|----------|-------------|
| Admin    | Create company, manage users, set roles, configure approval rules, view all expenses, override approvals |
| Manager  | Approve/reject expenses, view team expenses, escalate per rules |
| Employee | Submit expenses, view own expenses, check approval status |

## 🌐 External APIs

- **Countries API**: Fetch country and currency data
  - `https://restcountries.com/v3.1/all?fields=name,currencies`
  
- **Exchange Rate API**: Real-time currency conversion
  - `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

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

## 🎨 UI Mockup

See the design mockup here: [Excalidraw Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control (RBAC)
- Protected API routes
- Secure file uploads with Cloudinary

## 🚧 Future Enhancements

- [ ] Email notifications for approval requests
- [ ] Expense analytics and reporting dashboard
- [ ] Bulk expense upload via CSV
- [ ] Mobile app (React Native)
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Advanced OCR with machine learning
- [ ] Audit logs and compliance reports

## 📄 License

MIT License

## 👥 Contributors

- Your Name

## 🐛 Issues & Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/Virajkoli/Odoo_Expense_Management/issues) page.

---

**Made with ❤️ using Next.js and PostgreSQL**