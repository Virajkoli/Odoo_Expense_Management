# Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Run development server
npm run dev
```

## 📁 File Structure Quick Reference

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── signup/route.ts         # User registration
│   │   ├── expenses/
│   │   │   ├── route.ts                # List/Create expenses
│   │   │   └── [id]/approve/route.ts   # Approve/Reject
│   │   ├── users/route.ts              # User management
│   │   └── upload/route.ts             # File upload
│   ├── auth/
│   │   ├── signin/page.tsx             # Sign in page
│   │   └── signup/page.tsx             # Sign up page
│   ├── dashboard/
│   │   ├── layout.tsx                  # Dashboard layout
│   │   └── page.tsx                    # Dashboard home
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── providers.tsx                   # Session & Query providers
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── cloudinary.ts                   # Cloudinary helpers
│   ├── prisma.ts                       # Prisma client
│   └── utils.ts                        # Utility functions
└── types/
    └── next-auth.d.ts                  # NextAuth types

prisma/
└── schema.prisma                       # Database schema
```

## 🗄️ Database Models

### User
```typescript
{
  id: string
  email: string
  password: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  companyId: string
  managerId?: string
  isManagerApprover: boolean
}
```

### Company
```typescript
{
  id: string
  name: string
  currency: string
  country: string
}
```

### Expense
```typescript
{
  id: string
  amount: number
  originalCurrency: string
  convertedAmount: number
  category: string
  description: string
  expenseDate: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  receiptUrl?: string
  userId: string
  companyId: string
}
```

### ApprovalRequest
```typescript
{
  id: string
  expenseId: string
  approverId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  sequence: number
  comments?: string
}
```

## 🔐 Authentication

### Sign Up
```typescript
POST /api/auth/signup
{
  email: string
  password: string
  name: string
  country: string
  companyName: string
}
```

### Sign In
```typescript
POST /api/auth/signin
{
  email: string
  password: string
}
```

### Get Session
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
// session.user.role
// session.user.companyId
// session.user.companyCurrency
```

## 💰 Expense Management

### Create Expense
```typescript
POST /api/expenses
{
  amount: number
  originalCurrency: string
  category: string
  description?: string
  expenseDate: string (ISO)
  receiptUrl?: string
  receiptPublicId?: string
}
```

### List Expenses
```typescript
GET /api/expenses?status=PENDING
// Returns filtered expenses based on user role
```

### Approve/Reject Expense
```typescript
PATCH /api/expenses/[id]/approve
{
  status: 'APPROVED' | 'REJECTED'
  comments?: string
}
```

## 👥 User Management (Admin Only)

### Create User
```typescript
POST /api/users
{
  email: string
  password: string
  name: string
  role: 'EMPLOYEE' | 'MANAGER'
  managerId?: string
  isManagerApprover?: boolean
}
```

### List Users
```typescript
GET /api/users
// Returns all users in company
```

## 📤 File Upload

### Upload Receipt
```typescript
POST /api/upload
FormData {
  file: File
  extractOcr?: 'true' | 'false'
}

Response {
  url: string
  publicId: string
  ocrData?: any
}
```

## 🎨 UI Components

### Using React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['expenses'],
  queryFn: async () => {
    const { data } = await axios.get('/api/expenses')
    return data
  }
})
```

### Toast Notifications
```typescript
import toast from 'react-hot-toast'

toast.success('Success message')
toast.error('Error message')
toast.loading('Loading...')
```

### Protected Routes
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session) {
  redirect('/auth/signin')
}
```

## 🌍 External APIs

### Currency Conversion
```typescript
const response = await fetch(
  `https://api.exchangerate-api.com/v4/latest/USD`
)
const data = await response.json()
const rate = data.rates['EUR']
```

### Countries & Currencies
```typescript
const response = await fetch(
  'https://restcountries.com/v3.1/all?fields=name,currencies'
)
const countries = await response.json()
```

## 🔧 Utility Functions

### Format Currency
```typescript
import { formatCurrency } from '@/lib/utils'

formatCurrency(100, 'USD') // "$100.00"
```

### Format Date
```typescript
import { formatDate } from '@/lib/utils'

formatDate(new Date()) // "January 1, 2024"
```

### Class Names
```typescript
import { cn } from '@/lib/utils'

cn('base-class', condition && 'conditional-class')
```

## 📊 Prisma Commands

```bash
# Generate client
npx prisma generate

# Push schema (dev)
npx prisma db push

# Create migration
npx prisma migrate dev --name init

# Apply migrations (prod)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🎯 Role Permissions

| Action | Admin | Manager | Employee |
|--------|-------|---------|----------|
| Create Company | ✅ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Submit Expenses | ✅ | ✅ | ✅ |
| View Own Expenses | ✅ | ✅ | ✅ |
| View Team Expenses | ✅ | ✅ | ❌ |
| View All Expenses | ✅ | ❌ | ❌ |
| Approve Expenses | ✅ | ✅ | ❌ |
| Configure Rules | ✅ | ❌ | ❌ |

## 🐛 Common Issues

### Database Connection
```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Prisma Client
```bash
# Regenerate after schema changes
npm run db:generate
```

### Port in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="cloud-name"
CLOUDINARY_API_KEY="api-key"
CLOUDINARY_API_SECRET="api-secret"
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**
