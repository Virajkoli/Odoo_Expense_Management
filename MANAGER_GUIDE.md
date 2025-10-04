# Manager Guide - Team Expense Management

## 🎯 Overview

As a manager, you have additional responsibilities and capabilities beyond regular employees. This guide covers all manager-specific features for managing team expenses and approvals.

---

## 👔 Manager Role & Permissions

### What Managers Can Do

✅ **All Employee Functions:**
- Submit own expenses
- View personal expense history
- Track approval status

✅ **Team Management:**
- View all team member expenses
- Track team spending
- Monitor submission patterns

✅ **Approval Workflow:**
- Approve/reject team expenses
- View expenses in company's default currency
- Add comments to approvals
- Escalate as per approval rules

✅ **Oversight:**
- Review expense compliance
- Ensure policy adherence
- Support team members

---

## 📋 Accessing Manager Features

### Navigation

**For Team Expenses:**
- Dashboard → **Expenses**
- Shows: Your expenses + Team expenses

**For Approvals:**
- Dashboard → **Approvals**
- Shows: Requests assigned to you

**Dashboard Overview:**
- See pending approval count
- Quick access to all features

---

## 👥 Viewing Team Expenses

### Location: `/dashboard/expenses`

**What You See:**

Managers see expenses from:
1. **Your own expenses** - Expenses you submitted
2. **Team expenses** - Expenses from employees you manage

### How to Identify Team vs. Own

Each expense card shows:
- **Employee Name** - Who submitted it
- If it's you: Shows your name
- If it's team: Shows employee's name

**Example:**
```
┌─────────────────────────────────────────────┐
│ [PENDING]                    Oct 4, 2025    │
│                                             │
│ 👤 Sarah Johnson (Your Team)               │
│ sarah@company.com                           │
│                                             │
│ $500 USD | Travel | Oct 4                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [PENDING]                    Oct 4, 2025    │
│                                             │
│ 👤 John Manager (You)                       │
│ john@company.com                            │
│                                             │
│ $200 USD | Meals | Oct 4                   │
└─────────────────────────────────────────────┘
```

### Filtering Team Expenses

**Current Capabilities:**
- Filter by status (All/Pending/Approved/Rejected)
- View combined statistics
- See all team activity

**Use Cases:**
- **Pending** - Check what needs approval
- **Approved** - Track approved team spending
- **Rejected** - Review issues and provide guidance

---

## ✅ Approving/Rejecting Expenses

### Location: `/dashboard/approvals`

### Your Approval Queue

**When You'll See Approval Requests:**

1. **When isManagerApprover = true:**
   - You're the employee's direct manager
   - Admin checked "Is Manager Approver" for you
   - You see approval requests at Sequence 1

2. **When You're in Approval Rules:**
   - Admin added you as an approver in rules
   - Percentage rule (e.g., 60% of approvers)
   - Specific approver rule (special approver)
   - Hybrid rule (percentage OR special)

### Approval Interface

```
┌─────────────────────────────────────────────────────┐
│ Approval Queue                    5 Pending  3 Done │
├─────────────────────────────────────────────────────┤
│ [Pending] [Processed] [All]                         │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ [PENDING] Seq 1              Oct 4, 2025    │    │
│ │                                             │    │
│ │ 👤 Sarah Johnson                            │    │
│ │                                             │    │
│ │ 💵 $500 USD ($540 CAD) - Company Currency  │    │
│ │ 📁 Travel | 📅 Oct 1, 2025                │    │
│ │                                             │    │
│ │ Description: Conference flight booking      │    │
│ │                                        [📷] │    │
│ │                                             │    │
│ │ [Click to expand]                           │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 💰 Amount Display - Company Currency

### Automatic Currency Conversion

**All amounts shown in your company's default currency!**

**How It Works:**

1. **Employee submits in any currency:**
   ```
   Employee submits: €100 EUR
   ```

2. **System converts automatically:**
   ```
   Uses exchange rate from expense date
   Converts to company currency
   ```

3. **You see both amounts:**
   ```
   💵 Amount: $108 USD (Company Currency)
      (€100 EUR - Original)
   ```

**Benefits:**
- ✅ Consistent view across all expenses
- ✅ Easy budget tracking
- ✅ No mental math needed
- ✅ Clear comparison between expenses

**Display Format:**
```
Primary: Converted amount in company currency (bold)
Secondary: Original amount if different (smaller text)

Example:
  $540 CAD  ← This is what you focus on
  ($500 USD) ← Original for reference
```

---

## ✅ Approval Process

### Step 1: Review Request

**Click expense card to expand and see:**

1. **Employee Information:**
   - Name and email
   - Submission date

2. **Expense Details:**
   - Amount in company currency
   - Original amount (if different)
   - Category
   - Expense date
   - Description
   - Receipt (view full image)

3. **Approval Chain:**
   - Your position in sequence
   - Who approved before you
   - Who's waiting after you
   - Conditional rules (if any)

**Example:**
```
┌─────────────────────────────────────────────────────┐
│ Expense Details                                     │
│                                                     │
│ Employee: Sarah Johnson                             │
│ Amount: $540 CAD (converted from $500 USD)         │
│ Category: Travel                                    │
│ Date: October 1, 2025                              │
│ Description: Conference flight - Tech Summit 2025  │
│ Receipt: [View Full Image]                         │
│                                                     │
│ ────── Approval Chain ──────                       │
│                                                     │
│ ✓ Step 1: You (John Manager)      [Your Turn]     │
│   Status: PENDING                                   │
│                                                     │
│ ⏳ Step 2: Finance Team                            │
│   Will be notified after your approval             │
│                                                     │
│ ⏳ Step 3: CFO                                     │
│   Final approval                                    │
└─────────────────────────────────────────────────────┘
```

### Step 2: Verify Details

**Checklist Before Approving:**

✅ **Receipt Check:**
- Receipt uploaded?
- Receipt clear and readable?
- Amount matches receipt?
- Date matches receipt?
- Vendor/merchant visible?

✅ **Policy Compliance:**
- Within spending limits?
- Appropriate category?
- Business-related expense?
- Pre-approval obtained (if required)?

✅ **Documentation:**
- Description adequate?
- Purpose clear?
- Client/project mentioned?
- Necessary context provided?

✅ **Budget:**
- Within team budget?
- Appropriate timing?
- Business justification?

### Step 3: Add Comments (Optional but Recommended)

**Best Practices:**

**For Approvals:**
```
Good: "Approved - receipt verified, within policy"
Better: "Approved - conference attendance pre-approved, receipt matches"
Best: "Approved - Tech Summit attendance aligns with Q4 training goals, receipt verified for $540 CAD"
```

**For Questions:**
```
"Approved for now, but please get pre-approval for conferences >$500 next time"
"Approved - note that future meals should include attendee names in description"
```

**Provide Guidance:**
```
"Approved - well documented! This is a great example of expense submission"
"Approved - receipt is perfect, but consider booking earlier for better rates"
```

### Step 4: Make Decision

**Approve:**
```
1. Add comments (optional)
2. Click "Approve" button (green)
3. Confirmation shown
4. Next approver notified (if any)
5. Or expense approved (if last step)
```

**Reject:**
```
1. Add comments (REQUIRED for rejection)
   - Explain clearly why rejecting
   - Provide guidance for resubmission
   - Be constructive

2. Click "Reject" button (red)
3. Expense immediately rejected
4. Employee notified with your comments
5. All pending approvals cancelled
```

---

## 🔄 Escalation & Approval Rules

### Understanding Escalation

**Escalation happens automatically through approval rules!**

### How It Works

**Sequence-Based Escalation:**
```
Your Position: Sequence 1 (Manager)
  ↓ You Approve
Escalates to: Sequence 2 (Finance Team)
  ↓ Finance Approves
Escalates to: Sequence 3 (CFO)
  ↓ CFO Approves
Result: Expense Approved
```

### Your Role in Escalation

**As a Manager:**

1. **Primary Approver (Sequence 1):**
   - First to review
   - Gate-keeper role
   - Verify basics (receipt, policy, documentation)
   - Your approval triggers next sequence

2. **Secondary Approver (In Rules):**
   - Part of approval rule (percentage/specific/hybrid)
   - Review alongside other approvers
   - Your approval contributes to rule conditions

### Conditional Approval Rules

**You Might Be Part Of:**

#### 1. Percentage Rule
```
Rule: 60% of Finance Managers must approve

Scenario:
- You + 2 other managers = 3 total
- Need 60% = 2 approvals
- You approve = 33% ✓
- One more approves = 66% ✓ → ESCALATES
```

**Your Impact:**
- Your vote counts toward percentage
- Can see progress: "2 of 3 approved (66%)"
- When threshold met, escalates automatically

#### 2. Specific Approver Rule
```
Rule: If CFO approves, auto-approve

Scenario:
- You're regular approver
- CFO is special approver
- If CFO approves → Instant approval
- Your approval not needed (but recorded)
```

**Your Role:**
- Provide input even if CFO can override
- Your comments visible to all
- Good for documentation

#### 3. Hybrid Rule
```
Rule: 60% of managers OR CFO approval

Scenario:
- 3 managers + 1 CFO
- Option A: 2 managers approve (60%) → Escalate
- Option B: CFO approves → Instant escalate
```

**Your Strategy:**
- Approve if legitimate
- Know CFO can override
- Focus on your assessment

---

## 📊 Team Expense Oversight

### Monitoring Team Spending

**Dashboard View:**

Check statistics for team:
- Total team expenses
- Pending approvals
- Approved amounts
- Rejected items

**What to Watch:**

🔍 **Spending Patterns:**
- Unusually high amounts
- Frequent rejections
- Missing receipts
- Late submissions

🔍 **Policy Compliance:**
- Category misuse
- Limit violations
- Personal expenses
- Documentation quality

🔍 **Submission Quality:**
- Description completeness
- Receipt clarity
- Timing appropriateness

### Taking Action

**Proactive Management:**

1. **Regular Reviews:**
   - Check approvals queue daily
   - Review weekly spending
   - Monthly team analysis

2. **Team Guidance:**
   - Share best practices
   - Provide examples
   - Clarify policies
   - Answer questions

3. **Process Improvement:**
   - Identify pain points
   - Suggest rule changes
   - Request admin updates
   - Streamline workflow

---

## 💼 Manager Best Practices

### DO:

✅ **Review Promptly:**
- Check queue daily
- Respond within 24 hours
- Don't delay team reimbursements
- Set aside dedicated time

✅ **Be Thorough:**
- Check all details
- Verify receipts
- Ensure policy compliance
- Ask questions if needed

✅ **Communicate Clearly:**
- Always add comments
- Explain decisions
- Be constructive in rejections
- Provide guidance

✅ **Be Consistent:**
- Apply same standards to all
- Follow policy uniformly
- Document reasoning
- Build trust

✅ **Support Team:**
- Answer questions promptly
- Clarify policies
- Help with resubmissions
- Advocate when appropriate

### DON'T:

❌ **Delay Approvals:**
- Don't let requests sit for days
- Team needs timely reimbursement
- Delays hurt morale

❌ **Approve Without Review:**
- Always check details
- Verify receipt
- Ensure compliance
- Take responsibility

❌ **Reject Without Explanation:**
- Always provide reason
- Help employee improve
- Be constructive
- Guide resubmission

❌ **Be Inconsistent:**
- Same rules for everyone
- No favoritism
- Fair treatment
- Predictable decisions

❌ **Overstep Authority:**
- Follow approval rules
- Respect sequences
- Let system escalate
- Don't bypass process

---

## 🎓 Common Scenarios

### Scenario 1: Team Member's First Expense

**Situation:**
```
New employee Sarah submits first expense
Amount: $75 USD
Category: Meals
Description: "Lunch"
Receipt: Blurry photo
```

**Your Action:**
```
Option A: Reject and Guide
  Comments: "Receipt is too blurry to verify amount. 
  Please retake photo in better lighting. Also, add 
  more context - who was the lunch with and what 
  was the business purpose?"
  
  [REJECT]

Option B: Approve with Guidance
  Comments: "Approved this time, but please note:
  1. Take clearer receipt photos
  2. Add context: who, what, why
  3. Example: 'Lunch with client John from ABC Corp'
  Future submissions should include these details."
  
  [APPROVE]
```

**Best Practice:** Option B (approve with guidance for first-timers)

### Scenario 2: Large Unusual Expense

**Situation:**
```
Team member submits:
Amount: $2,500 USD
Category: Equipment
Description: "New laptop"
Receipt: Apple Store receipt
No pre-approval
```

**Your Action:**
```
Check Policy:
- Equipment >$1,000 requires pre-approval?
- Is laptop necessary for role?
- Budget available?

If No Pre-Approval Required:
  Comments: "Approved - verified with IT that 
  new laptop was needed for project work. 
  For future equipment purchases >$1,000, 
  please get pre-approval."
  [APPROVE]

If Pre-Approval Required:
  Comments: "Cannot approve without pre-approval. 
  Company policy requires manager approval before 
  equipment purchases >$1,000. Please get 
  pre-approval and resubmit. I can approve the 
  pre-approval separately."
  [REJECT]
```

### Scenario 3: Expense in Foreign Currency

**Situation:**
```
Employee traveled to Europe
Submitted: €500 EUR
Converted: $540 USD (company currency)
Category: Accommodation
Receipt: Hotel in Paris
```

**What You See:**
```
💵 Amount: $540 USD  ← Focus on this
   (€500 EUR)        ← Original for reference
```

**Your Action:**
```
Review Process:
1. Check converted amount ($540) against budget
2. Verify original amount (€500) matches receipt
3. Confirm exchange rate reasonable
4. Approve based on company currency amount

Comments: "Approved - hotel stay verified, 
converted amount $540 USD within policy for 
Paris accommodation"

[APPROVE]
```

### Scenario 4: Multiple Pending Approvals

**Situation:**
```
You have 10 pending approval requests
All from same employee
All submitted same day
Mix of categories and amounts
```

**Your Action:**
```
Efficient Review:
1. Review each individually (don't batch approve)
2. Look for patterns:
   - All from business trip?
   - All have receipts?
   - Any policy violations?

3. Provide consolidated feedback:
   First expense: "Approved - all trip expenses 
   look good, receipts verified"
   
   Others: "Approved - verified with main trip"

4. Or reject problematic ones individually
```

### Scenario 5: Questionable Business Expense

**Situation:**
```
Expense: $200 USD
Category: Entertainment
Description: "Dinner"
Receipt: High-end restaurant, alcohol included
No client/business context mentioned
```

**Your Action:**
```
Before Deciding:
1. Contact employee (email/chat)
   "Hi Sarah, can you provide more context on 
   the $200 dinner expense? Was this with a 
   client or team? Please update the description 
   with details."

2. Wait for response

3. If Business Dinner with Client:
   Comments: "Approved - confirmed client dinner 
   with ABC Corp to discuss partnership. Please 
   include client info in description for future 
   business meals."
   [APPROVE]

4. If Team Dinner (Might Not Be Allowed):
   Check policy on team entertainment
   If allowed: Approve
   If not allowed: Reject with explanation

5. If Personal:
   Comments: "This appears to be a personal 
   expense. Company policy only covers business 
   meals with clients or required work events. 
   Please review policy section 4.2."
   [REJECT]
```

---

## 📈 Tracking Team Performance

### Key Metrics to Monitor

**1. Approval Turnaround Time:**
- How long you take to approve
- Target: <24 hours
- Track your average

**2. Rejection Rate:**
- % of team expenses you reject
- High rate = training needed
- Low rate = good compliance

**3. Team Compliance:**
- Receipt upload rate
- Description quality
- Policy adherence
- On-time submissions

**4. Spending Trends:**
- Monthly team spend
- Category breakdown
- Budget vs actual
- Seasonal patterns

### Monthly Review Template

```
Team Expense Review - October 2025

Team: Sarah, Mike, Jane (3 members)

Summary:
- Total Expenses: 24
- Total Amount: $4,500 USD
- Approved: 22 (92%)
- Rejected: 2 (8%)
- Avg Turnaround: 18 hours

Categories:
- Travel: $2,500 (56%)
- Meals: $1,200 (27%)
- Other: $800 (17%)

Issues:
- 2 rejected for missing receipts
- 1 exceeded daily meal limit
- All resolved with resubmission

Action Items:
- Remind team about receipt requirements
- Share meal limit policy
- Provide submission best practices
```

---

## 🚨 Escalation & Special Cases

### When to Contact Admin

**Contact Admin If:**

1. **Policy Uncertainty:**
   - Unusual expense type
   - Edge case scenario
   - Policy interpretation needed
   - New situation

2. **System Issues:**
   - Can't approve/reject
   - Wrong amount showing
   - Missing approval request
   - Technical problems

3. **Rule Changes Needed:**
   - Current rules too strict
   - Workflow inefficient
   - Process improvement ideas
   - Team feedback

4. **Urgent Approvals:**
   - Employee urgent need
   - Time-sensitive expense
   - Override needed
   - Exception required

### When to Involve Employee's Skip-Level Manager

**Escalate Upward When:**

1. **High-Value Expense:**
   - Exceeds your authority
   - Company impact
   - Budget concerns

2. **Policy Violation:**
   - Serious compliance issue
   - Repeated violations
   - Potential misconduct

3. **Disagreement:**
   - Employee disputes your rejection
   - You need backup
   - Second opinion needed

---

## 🔒 Compliance & Audit

### Your Responsibilities

**Documentation:**
- All approvals recorded
- Comments preserved
- Audit trail maintained
- History immutable

**Verification:**
- Receipt authenticity
- Amount accuracy
- Business purpose
- Policy compliance

**Reporting:**
- Suspicious activity
- Policy violations
- Fraud concerns
- System abuse

### Red Flags to Watch

🚩 **Potential Issues:**
- Frequent large expenses just under approval limits
- Missing receipts with explanations
- Same vendor repeatedly
- Unusual categories
- Weekend/holiday submissions
- Duplicate expenses
- Edited receipts
- Cash-only expenses

**Action:**
- Document concerns
- Contact admin
- Request investigation
- Follow company policy

---

## 📱 Mobile Management

**Approve On-The-Go:**

✅ **Mobile-Responsive:**
- Approve from phone
- Review from tablet
- Access anywhere

✅ **Quick Actions:**
- Swipe through requests
- Tap to approve/reject
- Add quick comments
- View receipts full-screen

✅ **Notifications:**
- Email when requests arrive
- Check on mobile
- Approve immediately
- No delays

---

## 💡 Pro Tips

### Efficiency Tips

**1. Set a Schedule:**
```
Morning: Check new approvals
Lunch: Review any urgent items
EOD: Clear queue before leaving
```

**2. Use Templates:**
```
Save common comments:
- "Approved - receipt verified"
- "Approved - within policy"
- "Need clearer receipt - please resubmit"
```

**3. Batch Similar Items:**
```
If employee has 5 travel expenses from one trip:
- Review together
- Same context
- Consistent decision
- One set of comments
```

**4. Stay Informed:**
```
- Know company policies
- Understand approval rules
- Be aware of budget
- Track team patterns
```

### Quality Tips

**1. Ask Questions:**
- Not clear? Ask employee
- Unusual? Get context
- Uncertain? Check policy
- Complex? Consult admin

**2. Think Long-Term:**
- Build good habits
- Set expectations
- Train team
- Improve process

**3. Document Everything:**
- Add meaningful comments
- Explain rejections
- Provide guidance
- Create paper trail

---

## ❓ Manager FAQs

### Q: What if I'm not sure about approving?

**A:** 
1. Review policy documentation
2. Contact admin for guidance
3. Ask employee for more info
4. Consult with peer managers
5. Better to ask than approve wrongly

---

### Q: Can I approve my own expenses?

**A:** 
No - you cannot approve your own expenses. They go through normal approval workflow (your manager or approval rules).

---

### Q: What if team member submits expense while I'm on vacation?

**A:** 
- Set out-of-office
- Notify admin of absence
- Admin may assign backup approver
- Approve when you return (queue waits)

**Best Practice:** Notify admin in advance for backup assignment

---

### Q: How do I handle expense I partially agree with?

**A:** Options:
1. **Approve full amount with comment:**
   "Approved, but note $50 alcohol portion should be excluded from future client meals"

2. **Reject and request adjustment:**
   "Please resubmit for $150 (excluding $50 alcohol which isn't covered by policy)"

3. **Contact admin for partial approval capability** (feature request)

---

### Q: What if I accidentally approve/reject?

**A:** 
- Actions are final and cannot be undone
- Contact admin immediately
- Admin may be able to override
- For rejections: Employee can resubmit
- For approvals: Explain in follow-up comment

**Prevention:** Always review carefully before clicking!

---

### Q: How to handle duplicate expenses?

**A:** 
1. Check if truly duplicate (same date, amount, receipt)
2. If duplicate:
   - Reject second one
   - Comment: "Duplicate of expense #123 already approved"
3. Contact employee to prevent future duplicates

---

### Q: Team member says my rejection was unfair?

**A:** 
1. Review your decision and comments
2. Check policy again
3. Discuss with employee (explain reasoning)
4. If you were wrong: Ask admin to override
5. If correct: Stand firm but be understanding
6. Escalate to skip-level if needed

---

## 📞 Support & Resources

**For Help:**
- **Policy Questions:** Check company handbook
- **Technical Issues:** Contact IT support
- **Process Questions:** Contact admin
- **Urgent Issues:** Email admin directly

**Training:**
- New manager orientation
- Quarterly policy updates
- Best practices workshops
- Peer learning sessions

---

## ✅ Manager Checklist

### Daily:
- [ ] Check approval queue
- [ ] Review new team expenses
- [ ] Respond to approval requests
- [ ] Clear pending items

### Weekly:
- [ ] Review team spending trends
- [ ] Follow up on rejections
- [ ] Answer team questions
- [ ] Report issues to admin

### Monthly:
- [ ] Team expense analysis
- [ ] Budget vs actual review
- [ ] Process improvement ideas
- [ ] Team training needs

---

**You're Ready to Manage Team Expenses! 🎯**

Remember:
- ✅ Amounts always shown in company currency
- ✅ Thorough review before approving
- ✅ Clear comments on all decisions
- ✅ Support your team's success
- ✅ Follow approval rules for escalation
- ✅ Act promptly and fairly

Your role is critical to the expense management process - thank you for being a responsible approver!
