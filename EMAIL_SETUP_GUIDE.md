# Email Setup Guide - Gmail Integration

This guide explains how to set up Gmail for sending automated emails from the Expense Management System.

## 📧 Email Features

The system sends emails for:
1. **Welcome Emails** - When admin creates a new user (includes temporary password)
2. **Password Reset Requests** - When user requests password reset
3. **Password Reset Confirmation** - After successful password change

---

## 🔐 Setting Up Gmail App Password

### Why App Password?

Gmail requires an **App Password** instead of your regular password for security reasons. This allows the application to send emails on your behalf without exposing your main Google account password.

### Step-by-Step Setup

#### 1. Enable 2-Step Verification

**REQUIRED**: You must have 2-Step Verification enabled to create App Passwords.

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (you'll need your phone)

#### 2. Create App Password

1. After enabling 2-Step Verification, go back to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to **"Signing in to Google"**
3. Click on **App passwords**
4. You may need to sign in again
5. Select app: **Mail**
6. Select device: **Other (Custom name)**
7. Enter name: `Expense Management System`
8. Click **Generate**
9. **IMPORTANT**: Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`
   - This is your `GMAIL_APP_PASSWORD`

#### 3. Update .env File

```env
GMAIL_USER="your-actual-email@gmail.com"
GMAIL_APP_PASSWORD="your16characterapppassword"
COMPANY_NAME="Your Company Name"
```

**Example:**
```env
GMAIL_USER="admin@yourcompany.com"
GMAIL_APP_PASSWORD="abcdefghijklmnop"
COMPANY_NAME="Acme Corporation"
```

---

## 🧪 Testing Email Configuration

### Test 1: Create a Test User

1. Sign in as Admin
2. Go to **Dashboard → Users**
3. Click **"Add User"**
4. Fill in the form:
   ```
   Name: Test User
   Email: test@example.com (use a real email you can access)
   Password: TestPass123
   Role: Employee
   ```
5. Submit

**Expected Result:**
- User created successfully
- Email sent to `test@example.com` with credentials
- Check inbox for "Welcome to Expense Management System"

### Test 2: Request Password Reset

1. Sign out (if signed in)
2. Go to Sign In page
3. Click **"Forgot your password?"**
4. Enter your email
5. Submit

**Expected Result:**
- Success message displayed
- Email sent with reset link
- Link expires in 1 hour

### Test 3: Reset Password

1. Check email for reset link
2. Click the link
3. Enter new password
4. Submit

**Expected Result:**
- Password reset successful
- Confirmation email sent
- Can sign in with new password

---

## 📧 Email Templates

### 1. Welcome Email (New User)

**Sent when:** Admin creates a new user

**Contains:**
- Welcome message
- Login credentials (email + temporary password)
- Security warning to change password
- Link to sign in page
- Instructions for first login

**Sample:**
```
Subject: Welcome to Expense Management System

Hello John Doe!

Your account has been created by an administrator.

Login Credentials:
Email: john@company.com
Temporary Password: TempPass123

⚠️ Important: Change your password after first login

[Sign In Now Button]

Next Steps:
1. Sign in with your credentials
2. Go to Settings → Change Password
3. Set a strong, unique password
```

### 2. Password Reset Request

**Sent when:** User requests password reset

**Contains:**
- Reset link (valid for 1 hour)
- Security notice
- Ignore message if not requested

**Sample:**
```
Subject: Reset Your Password - Expense Management System

Hello John Doe,

We received a request to reset your password.

[Reset Password Button]

This link will expire in 1 hour for security reasons.

If you didn't request this, please ignore this email.
```

### 3. Password Reset Confirmation

**Sent when:** Password successfully changed

**Contains:**
- Confirmation message
- Sign in link
- Security alert

**Sample:**
```
Subject: Your Password Has Been Changed

Hello John Doe,

✓ Your password has been successfully changed.

You can now sign in with your new password.

[Sign In Button]

If you didn't make this change, contact your administrator immediately.
```

---

## 🛠️ Troubleshooting

### Email Not Sending

#### Issue: "Invalid login" or "Authentication failed"

**Solution:**
1. Verify 2-Step Verification is enabled
2. Create a new App Password
3. Copy it without spaces
4. Update `.env` file
5. Restart the server

#### Issue: "Less secure app access"

**Solution:**
Gmail no longer supports "Less secure apps". You **must** use App Passwords.

#### Issue: Emails going to spam

**Solutions:**
1. Add sender email to contacts
2. Mark email as "Not Spam"
3. For production: Use a custom domain email with SPF/DKIM records

#### Issue: "Daily sending limit exceeded"

**Solution:**
Gmail has sending limits:
- New accounts: 100 emails/day
- Established accounts: 500 emails/day

For high volume, consider:
- SendGrid
- AWS SES
- Mailgun

### Email Sent But Not Received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Recipient email is correct
3. ✅ Gmail account has sending permissions
4. ✅ Check server logs for errors

**View Logs:**
```bash
# In terminal where server is running
# Look for:
Email sent: <message-id>
# Or errors:
Email sending failed: <error>
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use App Passwords, never your main password
- ✅ Store App Password in `.env` file (never commit to git)
- ✅ Use different App Passwords for different apps
- ✅ Revoke App Passwords when no longer needed
- ✅ Set password expiry links (currently 1 hour)

### ❌ DON'T:
- ❌ Share your App Password
- ❌ Commit `.env` to version control
- ❌ Use the same password for multiple apps
- ❌ Disable 2-Step Verification
- ❌ Send passwords in plain text in production

---

## 🚀 Production Recommendations

### For Production, Consider:

#### 1. Professional Email Service

Instead of Gmail, use:
- **SendGrid** - 100 emails/day free
- **AWS SES** - $0.10 per 1,000 emails
- **Mailgun** - 5,000 emails/month free
- **Postmark** - Transactional emails

#### 2. Custom Domain Email

```
from: noreply@yourcompany.com
```

Benefits:
- Professional appearance
- Better deliverability
- Brand consistency

#### 3. Email Templates

Store templates in database for:
- Easy updates without code changes
- Multi-language support
- A/B testing

#### 4. Email Queue

Use a queue system for:
- Better performance
- Retry failed sends
- Rate limiting

Popular options:
- Bull (Redis-based)
- AWS SQS
- RabbitMQ

---

## 📊 Monitoring Email Delivery

### Check Email Status

```typescript
// In server logs
console.log('Email sent:', info.messageId)
```

### Track in Database (Future Enhancement)

Create `EmailLog` model:
```prisma
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  status    String   // sent, failed, bounced
  sentAt    DateTime?
  error     String?
  createdAt DateTime @default(now())
}
```

---

## 🔧 Environment Variables Reference

```env
# Required for email functionality
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="16-character-app-password"
COMPANY_NAME="Your Company Name"

# Used in email links
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
```

---

## 📝 User Flow Examples

### Flow 1: Admin Creates User

```
Admin → Create User Form
  ↓
System → Hash Password
  ↓
System → Save to Database
  ↓
System → Send Welcome Email (with plain password)
  ↓
Employee → Receives Email
  ↓
Employee → Signs In
  ↓
Employee → Changes Password (recommended)
```

### Flow 2: User Forgets Password

```
User → Click "Forgot Password"
  ↓
User → Enter Email
  ↓
System → Generate Reset Token
  ↓
System → Save Token + Expiry (1 hour)
  ↓
System → Send Reset Email
  ↓
User → Click Reset Link
  ↓
User → Enter New Password
  ↓
System → Hash Password
  ↓
System → Clear Reset Token
  ↓
System → Send Confirmation Email
  ↓
User → Sign In with New Password
```

---

## 💡 Tips

1. **Test First**: Always test with your own email first
2. **Check Spam**: New users should check spam folder
3. **Valid Email**: Ensure users provide valid email addresses
4. **Mobile Friendly**: All email templates are mobile-responsive
5. **Plain Text**: System auto-generates plain text version from HTML

---

## 📚 Additional Resources

- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Email Best Practices](https://postmarkapp.com/guides/email-best-practices)

---

**Ready to send emails!** 📬

After completing the setup, your users will automatically receive:
- Welcome emails with credentials
- Password reset links
- Confirmation notifications
