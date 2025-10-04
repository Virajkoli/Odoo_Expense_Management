# Expense Management System - Complete Setup Guide

This comprehensive guide will walk you through setting up the Expense Management System from scratch to production deployment.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Application Setup](#application-setup)
4. [Cloudinary Configuration](#cloudinary-configuration)
5. [Email Configuration (Optional)](#email-configuration)
6. [First-Time User Setup](#first-time-user-setup)
7. [Testing the Application](#testing-the-application)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager (comes with Node.js)
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Cloudinary Account** (Free tier available at [cloudinary.com](https://cloudinary.com))

### Verify Installations

```bash
node --version   # Should be v18.x or higher
npm --version    # Should be 9.x or higher
psql --version   # Should be 14.x or higher
git --version    # Should be 2.x or higher
```

---

## Database Setup

### Install PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows:
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Access PostgreSQL as postgres user
sudo -u postgres psql

# Inside psql terminal, run:
CREATE DATABASE expense_management;

# Create a dedicated user (optional but recommended)
CREATE USER expense_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE expense_management TO expense_user;

# Exit psql
\q
```

### Verify Database

```bash
# List all databases
psql -U postgres -l

# Or create database using command line
createdb -U postgres expense_management
```

---

## Application Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Virajkoli/Odoo_Expense_Management.git
cd Odoo_Expense_Management
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14.2.5
- React 18.3.1
- Prisma 5.18.0
- NextAuth 4.24.7
- Cloudinary 2.4.0
- And more...

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
#==========================================
# DATABASE
#==========================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://expense_user:your_secure_password@localhost:5432/expense_management"

#==========================================
# NEXTAUTH - Authentication
#==========================================
NEXTAUTH_URL="http://localhost:3000"
# Generate this with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"

#==========================================
# CLOUDINARY - File Upload
#==========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

#==========================================
# EMAIL - Notifications (Optional)
#==========================================
RESEND_API_KEY="re_123456789"  # Get from resend.com

#==========================================
# EXTERNAL APIs (Pre-configured)
#==========================================
EXCHANGE_RATE_API_URL="https://api.exchangerate-api.com/v4/latest"
COUNTRIES_API_URL="https://restcountries.com/v3.1/all?fields=name,currencies"
```

### Generate NEXTAUTH_SECRET

```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

---

## Cloudinary Configuration

Cloudinary is used for secure receipt storage and optional OCR functionality.

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### 2. Get API Credentials

1. Log in to Cloudinary Dashboard
2. Go to **Dashboard** (default page after login)
3. Find your credentials:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "👁️ Show" to reveal)

### 3. Update .env File

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
```

### 4. Enable OCR for Smart Receipt Scanning **HIGHLY RECOMMENDED**

The Smart OCR feature automatically extracts expense details from receipt images, saving significant data entry time.

#### Step-by-Step OCR Setup:

1. **In Cloudinary Dashboard**, go to **Add-ons** (left sidebar)
2. Search for **"Google Cloud Vision"**
3. Click on **Google Cloud Vision AI**
4. Select **Free Tier Plan**:
   - ✅ 1,000 requests per month
   - ✅ No credit card required
   - ✅ Perfect for small to medium teams
5. Click **Subscribe**
6. Confirm subscription

#### What OCR Enables:

When employees upload a receipt, the system automatically detects:
- ✅ **Amount**: Total from receipt
- ✅ **Date**: Transaction date
- ✅ **Currency**: USD, EUR, GBP, CAD, AUD, INR, JPY
- ✅ **Merchant Name**: Restaurant, hotel, store name
- ✅ **Category**: Auto-categorized (Travel, Meals, etc.)
- ✅ **Description**: Generated summary

#### Testing OCR:

1. After enabling, restart your development server
2. Go to **Submit Expense** form
3. Upload a receipt image
4. Watch the form auto-fill! 🎉

#### Troubleshooting OCR:

**OCR not working?**
- Verify Google Cloud Vision add-on is subscribed in Cloudinary
- Check Cloudinary console logs for OCR processing
- Receipt should be clear and readable
- Supported formats: JPG, PNG, PDF
- Max file size: 10MB

**No OCR data detected?**
- Receipt text may be unclear or handwritten
- Try a clearer image or different receipt
- System will gracefully fallback to manual entry

**Monthly limit reached?**
- Free tier: 1,000 requests/month
- Upgrade to paid tier if needed
- Or disable OCR temporarily

---

## Email Configuration

Email notifications are optional but recommended for production.

### Using Resend (Recommended)

1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env`:
   ```env
   RESEND_API_KEY="re_your_api_key"
   ```

### Email Features

When configured, the system sends:
- **Welcome emails** to new users created by admin
- **Password reset** emails with secure links
- **Approval notifications** (future feature)

### Testing Without Email

The system works perfectly without email configuration. Email features will:
- Skip sending emails
- Log email content to console (in development)
- Return success messages

---

## Database Migration

### 1. Generate Prisma Client

```bash
npm run db:generate
```

This generates TypeScript types and Prisma Client based on your schema.

### 2. Push Schema to Database

For development (quick setup):
```bash
npm run db:push
```

For production (with migration history):
```bash
npm run db:migrate
```

### 3. Verify with Prisma Studio

```bash
npm run db:studio
```

Opens at `http://localhost:5555` - a visual database browser where you can:
- View all tables
- See relationships
- Manually edit data (useful for testing)

---

## Run the Development Server

```bash
npm run dev
```

The application will start at:
- **URL**: `http://localhost:3000`
- **API**: `http://localhost:3000/api/*`

You should see:
```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

---

## First-Time User Setup

### Create Your First Admin Account

1. Open browser to `http://localhost:3000`
2. You'll see the landing page
3. Click **"Sign In"** or go to `/auth/signin`
4. Click **"create a new account"** at the bottom
5. Fill in the signup form:

```
Email:         admin@yourcompany.com
Password:      YourSecurePassword123!
Confirm:       YourSecurePassword123!
Name:          Admin User
Company Name:  Your Company Inc
Country:       Select your country (e.g., United States)
```

6. Click **"Sign Up"**
7. You'll be automatically signed in as Admin
8. Company currency is auto-set based on your country

### What Happens on Signup

1. **Company Created**:
   - Name from form
   - Currency from country
   - Unique ID generated

2. **Admin User Created**:
   - Your email and hashed password
   - Role set to ADMIN
   - Linked to your company

3. **Auto Sign-In**:
   - Session created
   - Redirected to dashboard

---

## Testing the Application

### Test 1: Create Manager and Employee

**As Admin:**

1. Go to **Dashboard → Users**
2. Click **"Add User"**
3. Create a Manager:
   ```
   Name: John Manager
   Email: manager@yourcompany.com
   Password: Manager123!
   Role: MANAGER
   ✓ Is Manager Approver
   ```
4. Click **"Save"**
5. Create an Employee:
   ```
   Name: Jane Employee
   Email: employee@yourcompany.com
   Password: Employee123!
   Role: EMPLOYEE
   Manager: John Manager
   ```
6. Click **"Save"**

### Test 2: Configure Approval Rules

**As Admin:**

1. Go to **Dashboard → Approval Rules**
2. Click **"Add Rule"**
3. Create a simple rule:
   ```
   Name: Manager Approval
   Description: All expenses require manager approval
   Type: PERCENTAGE
   Percentage: 100
   Sequence: 1
   ✓ Active
   ```
4. Click **"Save"**

### Test 3: Submit Expense with OCR Auto-Fill 🤖

**Sign out and sign in as Employee:**

1. Go to **Dashboard → Expenses**
2. Click **"Submit Expense"** (blue button top right)
3. **Test OCR Receipt Scanning:**
   - Click on the receipt upload area
   - Select a clear receipt image (restaurant bill, taxi receipt, hotel invoice)
   - Wait for "Scanning receipt..." (2-3 seconds)
   - **Watch the magic!** ✨ Form fields auto-populate:
     - Amount extracted from receipt
     - Date from transaction
     - Currency detected
     - Merchant name filled
     - Category auto-selected
4. **Review Auto-Filled Data:**
   - Check if amount is correct
   - Verify date makes sense
   - Adjust category if needed
   - Edit description if desired
5. Click **"Submit"**
6. You should see the expense with status **PENDING**

**Expected OCR Results:**
- ✅ **Restaurant Receipt**: Amount, date, restaurant name → "Meals" category
- ✅ **Taxi Receipt**: Fare, date, Uber/Lyft → "Travel" category  
- ✅ **Hotel Bill**: Total, checkout date, hotel name → "Accommodation" category
- ✅ **Gas Station**: Amount, date, fuel → "Travel" category

**If OCR doesn't work:**
- Ensure Google Cloud Vision is enabled in Cloudinary
- Try a clearer receipt image
- System will gracefully allow manual entry

### Test 3B: Manual Entry (Fallback)

If OCR is not enabled or receipt is unclear:

1. Click **"Submit Expense"**
2. Manually fill in the form:
   ```
   Amount: 100.00
   Currency: USD (or your company currency)
   Category: Travel
   Description: Taxi to client meeting
   Date: Today
   Receipt: Upload image (stores but no OCR)
   ```
3. Click **"Submit"**
4. Expense created successfully

### Test 4: Approve Expense

**Sign out and sign in as Manager:**

1. Go to **Dashboard → Approvals**
2. You should see 1 pending approval
3. Click on the expense to expand
4. Review details (amount will be in company currency)
5. Click **"Approve"** (or **"Reject"**)
6. Add optional comments
7. Submit

**Verify as Employee:**
1. Sign back in as Employee
2. Go to **Dashboard → Expenses**
3. Expense status should now be **APPROVED**

### Test 5: Admin Override

**Sign in as Admin:**

1. Create a new expense as admin (admins can submit too)
2. Or use the employee account to submit another expense
3. Go to **Dashboard → Expenses**
4. Find a PENDING expense
5. Click to expand it
6. You'll see **"Override Approve"** and **"Override Reject"** buttons
7. Click **"Override Approve"**
8. Enter a reason: `Urgent approval needed`
9. Confirm
10. Expense immediately becomes **APPROVED**
11. All pending approval requests are **CANCELLED**
12. Audit trail shows admin override with sequence 999

---

## Production Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   - Copy all from your local `.env`
   - **IMPORTANT**: Update `NEXTAUTH_URL` to your production domain
7. Click **"Deploy"**

### Deploy to Other Platforms

#### Render
1. Create PostgreSQL database
2. Create Web Service
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables

#### Railway
1. Create new project
2. Add PostgreSQL service
3. Add Web service from GitHub
4. Environment variables auto-detected from `.env`
5. Deploy

### Database Migrations for Production

```bash
# Create migration from schema changes
npx prisma migrate dev --name init

# In production, run:
npx prisma migrate deploy
```

### Post-Deployment Checklist

- [ ] Database connected and migrated
- [ ] Environment variables set correctly
- [ ] NEXTAUTH_URL matches production domain
- [ ] Cloudinary uploads working
- [ ] Email sending functional (if configured)
- [ ] Create first admin account
- [ ] Test complete workflow (submit → approve)

```bash
- [ ] Test complete workflow (submit → approve)
- [ ] SSL/HTTPS enabled
- [ ] Backup strategy in place

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error**: `Can't reach database server at localhost:5432`

**Solutions**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Verify DATABASE_URL in .env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

#### 2. Prisma Client Error

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
# Regenerate Prisma Client
npm run db:generate

# If still failing, clean install:
rm -rf node_modules
npm install
npm run db:generate
```

#### 3. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### 4. Cloudinary Upload Error

**Error**: `Failed to upload file to Cloudinary`

**Solutions**:
- Verify all three Cloudinary credentials in `.env`
- Check file size (default limit: 10MB)
- Ensure file is valid image format (JPG, PNG, PDF)
- Check Cloudinary dashboard for quota limits
- Review browser console for detailed error

#### 5. NextAuth Session Error

**Error**: `[next-auth][error][SESSION_ERROR]`

**Solutions**:
```bash
# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32

# Update .env with new secret
# Clear browser cookies for localhost:3000
# Restart dev server
```

#### 6. Build Errors

**Error**: Various TypeScript or build errors

**Solutions**:
```bash
# Clean build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 7. Migration Errors

**Error**: `Migration failed`

**Solutions**:
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
psql -U postgres
DROP DATABASE expense_management;
CREATE DATABASE expense_management;
\q

# Then run migrations
npm run db:migrate
```

### Debugging Tips

#### Enable Prisma Logging

Add to `.env`:
```env
DEBUG="prisma:*"
```

#### Check Database Connection

```bash
# Test connection using psql
psql -U expense_user -d expense_management -h localhost

# List all tables
\dt

# View schema
\d+ expenses
```

#### View Server Logs

Development mode logs are visible in terminal. For production:
```bash
npm start 2>&1 | tee server.log
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | ✅ Yes | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ Yes | Random secret for JWT | `(run openssl rand -base64 32)` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | `dxxxxxx` |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | `abcdefghijklmnop` |
| `RESEND_API_KEY` | ⚠️ Optional | Email API key (Resend) | `re_123456789` |
| `EXCHANGE_RATE_API_URL` | ⚠️ Optional | Currency API (has default) | Pre-configured |
| `COUNTRIES_API_URL` | ⚠️ Optional | Countries API (has default) | Pre-configured |

---

## Available NPM Scripts

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run lint             # Run ESLint for code quality

# Production
npm run build            # Create optimized production build
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client from schema
npm run db:push          # Push schema to database (dev only)
npm run db:migrate       # Create and run migrations (production)
npm run db:studio        # Open Prisma Studio (database GUI)

# Utilities
npm run db:seed          # Seed database with sample data (if configured)
```

---

## Security Best Practices

### For Development

1. **Never commit `.env` file** to version control
2. Use strong `NEXTAUTH_SECRET` (min 32 characters)
3. Use complex database passwords
4. Keep dependencies updated: `npm audit`

### For Production

1. **Use environment variables**, not `.env` files
2. **Enable HTTPS** (SSL/TLS certificates)
3. Set secure `NEXTAUTH_SECRET` (64+ characters)
4. Use managed PostgreSQL (RDS, Neon, Railway)
5. Enable Cloudinary signed uploads
6. Set up database backups
7. Use rate limiting for API routes
8. Enable CORS restrictions
9. Set up monitoring (Sentry, LogRocket)
10. Regular security audits

---

## Performance Optimization

### Database

```sql
-- Add indexes for better query performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_approval_requests_approver ON approval_requests(approver_id);
```

### Next.js

```bash
# Enable production optimizations
NODE_ENV=production npm run build
npm start
```

### Caching

Consider adding:
- Redis for session storage
- CDN for static assets (Vercel Edge, Cloudflare)
- Database query caching with Prisma

---

## Backup and Recovery

### Database Backup

```bash
# Backup database
pg_dump -U expense_user expense_management > backup_$(date +%Y%m%d).sql

# Restore database
psql -U expense_user expense_management < backup_20241004.sql
```

### Automated Backups

For production, set up automated backups:
- **Vercel Postgres**: Built-in daily backups
- **Railway**: Point-in-time recovery
- **AWS RDS**: Automated snapshots

---

## Monitoring and Logging

### Application Monitoring

Recommended tools:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance metrics
- **Posthog** - Product analytics

### Database Monitoring

```bash
# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('expense_management'));"
```

---

## Next Steps

After successful setup:

1. ✅ **Create Admin Account** - First signup creates admin
2. ✅ **Add Test Users** - Create manager and employee
3. ✅ **Configure Approval Rules** - Set up workflow
4. ✅ **Submit Test Expense** - Test full workflow
5. ✅ **Test Admin Override** - Verify override functionality
6. ✅ **Customize Settings** - Adjust for your company
7. ✅ **Train Users** - Share user guides
8. ✅ **Go Production** - Deploy to hosting platform

---

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

### Support
- **GitHub Issues**: [Create an issue](https://github.com/Virajkoli/Odoo_Expense_Management/issues)
- **Email**: support@yourcompany.com (update this)
- **README.md**: Main project documentation

### Community
- Next.js Discord
- Prisma Slack
- Stack Overflow (tag: next.js, prisma)

---

## Changelog

### Version 2.0 (October 2024)
- ✅ Added Admin Override Approvals feature
- ✅ Enhanced security with audit trails
- ✅ Improved workflow visualization
- ✅ Added comprehensive testing checklist
- ✅ Updated documentation

### Version 1.0 (Initial Release)
- ✅ Multi-role system (Admin, Manager, Employee)
- ✅ Approval workflow engine
- ✅ Currency conversion
- ✅ Receipt upload with Cloudinary
- ✅ Complete authentication system

---

## FAQ

**Q: Can I use MySQL instead of PostgreSQL?**  
A: Yes, update `DATABASE_URL` in `.env` and Prisma will handle it. However, PostgreSQL is recommended for production.

**Q: How many users can the system support?**  
A: The system can easily handle 1000+ concurrent users. For larger scale, consider:
- Database connection pooling
- Redis for session management
- Load balancing

**Q: Can I disable email features?**  
A: Yes, email is optional. Simply don't set `RESEND_API_KEY` and the system will work without emails.

**Q: How do I backup my data?**  
A: Use `pg_dump` for PostgreSQL or use your hosting provider's backup features.

**Q: Can I customize the approval workflow?**  
A: Yes, admins can configure approval rules with three types: PERCENTAGE, SPECIFIC, and HYBRID.

**Q: Is OCR free?**  
A: Cloudinary's Google Cloud Vision add-on has a free tier (1000 requests/month).

---

**Setup Complete! 🎉**

For additional help, refer to [README.md](./README.md) or create an issue on GitHub.

**Happy Expense Managing! 🚀**

---

**Last Updated**: October 2024  
**Version**: 2.0  
**Maintained by**: Viraj Koli
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
