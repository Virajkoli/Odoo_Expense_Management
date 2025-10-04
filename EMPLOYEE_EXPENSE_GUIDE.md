# Employee Guide - Managing Your Expenses

## 🎯 Overview

As an employee, you can submit expense claims, track their status, and view your complete expense history. This guide will walk you through everything you need to know.

---

## 📍 Accessing Your Expenses

**Navigation:** Dashboard → Expenses

**URL:** `/dashboard/expenses`

---

## 📊 Dashboard Overview

When you open the Expenses page, you'll see:

### Statistics Cards

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │  Pending     │  Approved    │  Rejected    │ Total Amount │
│ Expenses     │              │              │              │              │
│     15       │      3       │      10      │      2       │  $5,432.50   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**What each means:**
- **Total Expenses:** All expenses you've ever submitted
- **Pending:** Currently being reviewed by approvers
- **Approved:** Successfully approved and ready for reimbursement
- **Rejected:** Not approved (with reasons provided)
- **Total Amount:** Sum of all expenses in company currency

### Filter Tabs

Click tabs to filter your expenses:
- **All** - View everything
- **Pending** - See what's in review
- **Approved** - See what's been approved
- **Rejected** - See what needs attention

---

## ➕ Submitting a New Expense

### Step-by-Step Process

#### 1. Click "New Expense" Button

Located in the top-right corner of the page.

#### 2. Fill Out the Form

**Required Fields (marked with *):**

**Amount***
- Enter the expense amount
- Use decimal for cents (e.g., 125.50)
- Example: `125.50`

**Currency***
- Select the currency you paid in
- Available: USD, EUR, GBP, CAD, AUD, INR, JPY
- System will auto-convert to company currency
- Example: If you paid in EUR but company uses USD, both amounts will be shown

**Category***
- Choose from predefined categories:
  - **Travel** - Flights, trains, buses
  - **Meals** - Restaurant, food delivery
  - **Accommodation** - Hotels, lodging
  - **Transportation** - Taxis, rideshare, car rental
  - **Office Supplies** - Pens, paper, desk items
  - **Equipment** - Computers, monitors, peripherals
  - **Software** - Subscriptions, licenses
  - **Training** - Courses, conferences, workshops
  - **Entertainment** - Client dinners, team events
  - **Other** - Anything else

**Expense Date***
- Date when expense occurred
- Use date picker or type YYYY-MM-DD
- Example: `2025-10-04`

**Optional Fields:**

**Description**
- Add context about the expense
- Explain what it was for
- Include any relevant details
- Example: "Dinner with client John from ABC Corp - discussed Q4 project"

**Receipt**
- Upload photo or PDF of receipt
- Click "Click to upload" area
- Select file from device
- Supported: PNG, JPG, PDF (up to 10MB)
- **Best Practice:** Always upload receipts to speed up approval

#### 3. Review and Submit

- Double-check all information
- Ensure receipt is uploaded (if available)
- Click **"Submit Expense"**
- You'll see confirmation message
- Expense appears in your list immediately

### Example Submission

```
Amount: 156.75
Currency: USD
Category: Meals
Date: October 4, 2025
Description: Lunch meeting with potential client Sarah Johnson
Receipt: [receipt.jpg uploaded]

[Cancel] [Submit Expense]
```

---

## 👀 Viewing Your Expenses

### Expense Cards

Each expense displays as a card with:

**Header:**
- Status badge (Pending/Approved/Rejected)
- Submission date

**Details:**
- 💵 **Amount:** Original amount + converted amount (if different currency)
- 📁 **Category:** Type of expense
- 📅 **Date:** When expense occurred
- ✓ **Approvals:** How many approvers have approved (e.g., 2 / 3)

**Additional Info:**
- Description (if provided)
- Rejection reason (if rejected)
- Receipt thumbnail (click to view full)

### Expanding for More Details

**Click any expense card** to expand and see:

#### Approval Status Timeline

```
┌─────────────────────────────────────────────────────┐
│              Approval Status                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✓ Step 1 - John Manager                            │
│   Status: APPROVED                                   │
│   "Looks good, approved!"                           │
│   Approved: 2 hours ago                             │
│                                                      │
│ ⏳ Step 2 - Finance Team                            │
│   Status: PENDING                                    │
│   finance.team@company.com                          │
│   Waiting for approval...                           │
│                                                      │
│ ⏳ Step 3 - CFO                                     │
│   Status: PENDING                                    │
│   Will be notified after Step 2                     │
└─────────────────────────────────────────────────────┘
```

**Status Icons:**
- ✓ Green checkmark = Approved at this step
- ✗ Red X = Rejected at this step
- ⏳ Clock = Waiting for approval

**Approver Comments:**
- See what approvers said
- Helpful for understanding decisions
- Learn for future submissions

---

## 📈 Understanding Expense Status

### 🟡 PENDING

**What it means:**
- Expense is being reviewed
- One or more approvers haven't responded yet
- You need to wait

**What you can do:**
- Monitor approval progress
- Wait patiently
- Contact approver if urgent (via email/chat, not through system)

**Timeline:**
- Typical approval: 1-3 business days
- Complex approvals: Up to 1 week
- Depends on approval rules configured

### 🟢 APPROVED

**What it means:**
- All required approvers have approved
- Expense is ready for reimbursement
- Finance team will process payment

**What you can do:**
- Wait for reimbursement
- Check with finance about payment timeline
- Keep receipt for records

**Next Steps:**
- Finance team processes reimbursement
- Payment issued according to company policy
- Typically 1-2 weeks after approval

### 🔴 REJECTED

**What it means:**
- An approver did not approve the expense
- You won't be reimbursed for this claim
- See rejection reason for details

**What you can do:**
1. **Read Rejection Reason:**
   - Displayed in red box on expense card
   - Explains why it was rejected
   - Example: "Missing receipt - please upload and resubmit"

2. **Take Action:**
   - Fix the issue mentioned
   - Submit a NEW expense with corrections
   - Don't resubmit the same expense

3. **Common Rejection Reasons:**
   - Missing receipt
   - Incorrect category
   - Personal expense (not business-related)
   - Exceeds policy limits
   - Insufficient documentation
   - Duplicate submission

**Example:**
```
❌ REJECTED

Rejection Reason:
"Receipt is not clear enough to read the amount. 
Please upload a higher quality image and resubmit."

Action: Take new photo of receipt and submit new expense
```

---

## 💡 Tips for Faster Approvals

### 1. Upload Clear Receipts

**Do:**
- ✅ Take photo in good lighting
- ✅ Ensure all text is readable
- ✅ Include full receipt (top to bottom)
- ✅ Upload immediately after purchase

**Don't:**
- ❌ Blurry or dark photos
- ❌ Cropped receipts (missing info)
- ❌ Handwritten notes instead of receipt
- ❌ Waiting weeks to submit

### 2. Provide Good Descriptions

**Good Examples:**
```
✅ "Client dinner at Joe's Steakhouse - discussed Q4 marketing strategy with ABC Corp team"
✅ "Uber to airport for Chicago conference trip"
✅ "Microsoft Office license for new project work"
```

**Poor Examples:**
```
❌ "Dinner"
❌ "Uber"
❌ "Software"
```

**Why it matters:**
- Helps approvers understand context
- Speeds up decision-making
- Reduces back-and-forth questions

### 3. Choose Correct Category

**Matching categories correctly:**
- Travel = Flights, trains, buses
- Meals = Food only
- Accommodation = Hotels only
- Transportation = Local travel (taxi, Uber, rental car)

**Not sure?**
- Use "Other" and explain in description
- Ask your manager before submitting

### 4. Submit Promptly

**Best Practice:**
- Submit within 48 hours of expense
- Don't wait until end of month
- Fresh receipts are easier to verify

**Benefits:**
- Better memory of details
- Receipt quality still good
- Faster reimbursement

### 5. Check Company Policy

**Before submitting:**
- Know your expense limits
- Understand what's allowed
- Check if pre-approval needed
- Ask manager if unsure

**Common Policies:**
- Meals: $50 per day maximum
- Hotels: $150 per night maximum
- No alcohol unless with client
- Pre-approval required for >$500

---

## ❓ Frequently Asked Questions

### Q: How long does approval take?

**A:** Depends on approval workflow:
- Simple (manager only): 1-2 days
- Multi-level (manager + finance + exec): 3-5 days
- Complex cases: Up to 1 week

**Check approval status** on expense card to see progress.

---

### Q: Can I edit an expense after submitting?

**A:** No, expenses cannot be edited after submission.

**Solution:**
- If wrong info: Ask manager to reject it
- Submit a new correct expense
- Add note explaining it's a correction

---

### Q: What if I lost my receipt?

**A:** Options:
1. Request duplicate from vendor
2. Submit with explanation in description
3. Provide credit card statement showing purchase
4. Check with manager - some may require receipt

**Note:** Many companies require receipts for reimbursement.

---

### Q: Can I submit personal expenses?

**A:** No, only business-related expenses.

**Business Expenses:**
- ✅ Travel for work
- ✅ Client meals
- ✅ Work equipment
- ✅ Professional development

**Personal Expenses:**
- ❌ Personal meals
- ❌ Personal shopping
- ❌ Family entertainment
- ❌ Personal subscriptions

**Violation may result in:**
- Rejection
- Warning
- Disciplinary action

---

### Q: What if expense is in foreign currency?

**A:** System handles this automatically:
1. Select currency you paid in
2. Enter amount in that currency
3. System converts to company currency
4. Both amounts shown on expense
5. Approvers see company currency

**Example:**
```
You paid: €100 EUR
Company currency: USD
Converted: $108 USD (rate on expense date)
Both amounts displayed
```

---

### Q: How do I know who's reviewing my expense?

**A:** Click expense card to expand and see approval chain:
- Shows each approver's name
- Shows their status (pending/approved/rejected)
- Shows sequence order
- Shows comments (if any)

---

### Q: Can I delete an expense?

**A:** No, expenses cannot be deleted.

**Reason:** Audit trail requirement

**If submitted by mistake:**
- Ask approver to reject it
- Expense marked as rejected
- Submit correct one

---

### Q: What if my expense is urgent?

**A:** 
1. Submit normally with "Urgent" in description
2. Email/message your approver directly
3. Explain urgency
4. Provide context

**Don't:**
- Submit multiple times
- Pressure approvers
- Circumvent process

---

### Q: How do I track reimbursement?

**A:** After approval:
1. Expense shows as APPROVED
2. Finance team processes payment
3. Check with finance for timeline
4. Usually 1-2 weeks after approval

**Note:** Reimbursement tracking may be separate from this system.

---

## 📱 Mobile Usage

The expense system is **mobile-responsive**!

**On Mobile:**
- ✅ Submit expenses from phone
- ✅ Upload receipt photos directly
- ✅ Check approval status
- ✅ View expense history

**Best Practices:**
- Take receipt photo immediately after purchase
- Submit while details are fresh
- Use good lighting for photos
- Ensure full receipt is visible

---

## 🎓 Best Practices Summary

### DO:
- ✅ Submit expenses promptly (within 48 hours)
- ✅ Always upload receipts
- ✅ Write clear descriptions
- ✅ Choose correct category
- ✅ Use correct currency
- ✅ Follow company policy
- ✅ Keep original receipts until reimbursed

### DON'T:
- ❌ Submit personal expenses
- ❌ Upload blurry receipts
- ❌ Wait weeks to submit
- ❌ Use vague descriptions
- ❌ Submit duplicates
- ❌ Exceed policy limits without pre-approval
- ❌ Edit amounts on receipts

---

## 🚨 Common Issues & Solutions

### Issue: "Can't upload receipt"

**Solutions:**
- Check file size (must be <10MB)
- Check file type (JPG, PNG, PDF only)
- Try different browser
- Compress image if too large
- Contact IT if persists

---

### Issue: "Expense not showing in list"

**Solutions:**
- Refresh page (Ctrl+R or Cmd+R)
- Check filter tabs (might be in different tab)
- Clear browser cache
- Try different browser
- Contact support if missing

---

### Issue: "Currency conversion wrong"

**Note:** System uses exchange rates from expense date
- Rates update daily
- Historical rates used for past dates
- Conversion is informational only
- Actual reimbursement may use company's rate

---

## 📞 Need Help?

**For Technical Issues:**
- Contact IT Support
- Email: it@company.com

**For Policy Questions:**
- Ask your manager
- Check company handbook
- Contact finance team

**For Approval Issues:**
- Contact approver directly
- Email/message them
- CC your manager if urgent

---

## 📊 Example Expense Workflow

Let's walk through a complete example:

### Scenario: Business Lunch

**1. You have lunch with client**
```
Date: October 4, 2025
Restaurant: Joe's Steakhouse
Amount: $85.50
Payment: Credit card
Receipt: Saved photo on phone
```

**2. Submit Expense (Same Day)**
```
Open: Dashboard → Expenses
Click: "New Expense"

Fill Form:
  Amount: 85.50
  Currency: USD
  Category: Meals
  Date: 2025-10-04
  Description: "Lunch with client Sarah Johnson from ABC Corp - discussed Q4 partnership opportunities"
  Receipt: [Upload photo from phone]

Click: "Submit Expense"
Result: "Expense submitted successfully!"
```

**3. Track Approval (Next 2 Days)**
```
Day 1:
  Status: PENDING
  Approver: John Manager (Step 1)
  Action: Waiting...

Day 2:
  Status: PENDING
  Step 1: ✓ John Manager - APPROVED
          "Approved - good business development"
  Step 2: ⏳ Finance Team - PENDING
  Action: Waiting...

Day 3:
  Status: APPROVED ✓
  Step 1: ✓ John Manager - APPROVED
  Step 2: ✓ Finance Team - APPROVED
          "Approved - receipt verified"
  Action: Wait for reimbursement
```

**4. Get Reimbursed (Week 2)**
```
Finance processes payment
Check deposited to account
Expense complete!
```

---

**Happy Expensing! 💰**

Remember: Clear receipts + Good descriptions + Prompt submission = Fast approvals!
