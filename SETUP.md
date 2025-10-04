# Expense Management System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** 14.x or higher
- **Git**

## Step-by-Step Setup Instructions

### 1. Database Setup

#### Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE expense_management;

# Create user (optional)
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE expense_management TO your_username;

# Exit
\q
```

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Virajkoli/Odoo_Expense_Management.git
cd Odoo_Expense_Management

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/expense_management"

# NextAuth - Generate a random secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-generated-secret>"

# Cloudinary - Get from cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Update the `.env` file with these credentials

**Optional: Enable OCR**
- Go to Add-ons in Cloudinary Dashboard
- Subscribe to "Google Cloud Vision" (free tier available)

### 5. Database Migration

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR create and run migrations (recommended for production)
npm run db:migrate
```

### 6. Verify Setup

```bash
# Open Prisma Studio to view database
npm run db:studio
```

This will open a browser window at `http://localhost:5555` where you can view and manage your database.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First-Time User Setup

### Create Your First Admin Account

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the sign-in page
3. Click "create a new account"
4. Fill in the signup form:
   - **Email**: admin@company.com
   - **Password**: Choose a strong password
   - **Name**: Your name
   - **Company Name**: Your company name
   - **Country**: Select your country (currency will be auto-set)
5. Click "Sign Up"
6. You'll be automatically signed in as an Admin

## Testing the Application

### Create Test Users

As an Admin, you can create test users:

1. Go to Dashboard → Users
2. Click "Add User"
3. Create a Manager:
   - Email: manager@company.com
   - Role: Manager
   - Check "Is Manager Approver"
4. Create an Employee:
   - Email: employee@company.com
   - Role: Employee
   - Manager: Select the manager you just created

### Submit Test Expense

1. Sign in as the employee
2. Go to Dashboard → Expenses
3. Click "Submit Expense"
4. Fill in the form:
   - Amount: 100
   - Currency: USD (or your company currency)
   - Category: Travel
   - Description: Test expense
   - Date: Today
5. Upload a receipt (optional)
6. Submit

### Approve Test Expense

1. Sign out and sign in as the manager
2. Go to Dashboard → Approvals
3. You should see the pending expense
4. Click "Approve" or "Reject"
5. Add comments (optional)
6. Submit

## Common Issues & Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -l`

### Prisma Client Error

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Cloudinary Upload Error

**Error:** `Failed to upload file`

**Solution:**
- Verify Cloudinary credentials in `.env`
- Check your Cloudinary dashboard for API limits
- Ensure file size is within limits (default: 10MB)

## Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Database Migrations for Production

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migration in production
npx prisma migrate deploy
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_URL | Application URL | Yes |
| NEXTAUTH_SECRET | Random secret for JWT | Yes |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Yes |
| CLOUDINARY_API_KEY | Cloudinary API key | Yes |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Yes |
| EXCHANGE_RATE_API_URL | Currency API URL | No (has default) |
| COUNTRIES_API_URL | Countries API URL | No (has default) |

## Available NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (dev)
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## Next Steps

1. **Configure Approval Rules**: Set up multi-level approval workflows
2. **Test Currency Conversion**: Submit expenses in different currencies
3. **Try OCR Feature**: Upload receipts and let OCR extract data
4. **Set Up Email Notifications**: Configure email for approval notifications (future feature)

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/Virajkoli/Odoo_Expense_Management/issues)
- Documentation: See README.md

---

**Happy Expense Managing! 🚀**
