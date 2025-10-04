# Approval Workflow - Implementation Summary

## ✅ Implementation Status

### Completed Features

#### 1. Manager Approval ✓
- **Location:** `/src/app/api/expenses/route.ts` (Lines 211-221)
- **Logic:** Checks if `user.manager.isManagerApprover === true`
- **Sequence:** Always sequence 1 (if enabled)
- **Compliance:** ✓ "The expense is first approved by his manager, if the IS MANAGER APPROVER field is checked"

#### 2. Multi-Level Sequential Approvals ✓
- **Location:** `/src/app/api/expenses/route.ts` (Lines 223-286)
- **Logic:** Processes active approval rules in order by `rule.sequence`
- **Sequence:** Increments after each rule (2, 3, 4...)
- **Compliance:** ✓ "When multiple approvers are assigned, Admin can define their sequence"

#### 3. Percentage Rule ✓
- **Location:** `/src/app/api/expenses/[id]/approve/route.ts` (Lines 105-117)
- **Logic:** Calculates `(approved / total) * 100`, checks against `rule.percentage`
- **Example:** 60% rule with 5 approvers needs 3 approvals
- **Compliance:** ✓ "If 60% of approvers approve → Expense approved"

#### 4. Specific Approver Rule ✓
- **Location:** `/src/app/api/expenses/[id]/approve/route.ts` (Lines 119-145)
- **Logic:** Checks if any `isSpecialApprover` has approved
- **Example:** CFO approval instantly moves to next sequence
- **Compliance:** ✓ "If CFO approves → Expense auto-approved"

#### 5. Hybrid Rule ✓
- **Location:** `/src/app/api/expenses/[id]/approve/route.ts` (Lines 147-180)
- **Logic:** Checks percentage OR special approver (OR condition)
- **Example:** 60% of team OR CFO approval
- **Compliance:** ✓ "Combine both (e.g., 60% OR CFO approves)"

#### 6. Sequential Processing ✓
- **Location:** `/src/app/api/expenses/[id]/approve/route.ts` (Lines 300-326)
- **Logic:** Only processes current sequence, moves to next only when conditions met
- **Flow:** Sequence 1 → Approve → Sequence 2 → Approve → Final Approval
- **Compliance:** ✓ "Expense moves to the next approver only after the current one approves"

#### 7. Rejection Handling ✓
- **Location:** `/src/app/api/expenses/[id]/approve/route.ts` (Lines 266-288)
- **Logic:** Any rejection immediately rejects expense, stores comment
- **Auto-reject:** All pending requests at same sequence auto-rejected
- **Compliance:** ✓ "Approve/Reject with comments"

#### 8. Combined Flows ✓
- **Location:** `/src/app/api/expenses/route.ts` (Full workflow)
- **Logic:** Manager (seq 1) + Rule 1 (seq 2) + Rule 2 (seq 3) + Rule 3 (seq 4)...
- **Example:** Manager → Finance Team (60%) → CFO (specific) → Director (specific)
- **Compliance:** ✓ "There can be a combination of both flows together"

---

## 🔧 Implementation Details

### Database Schema

```prisma
model ApprovalRule {
  id          String              @id
  name        String
  companyId   String
  ruleType    ApprovalRuleType    // PERCENTAGE | SPECIFIC_APPROVER | HYBRID
  percentage  Int?                // Required for PERCENTAGE and HYBRID
  sequence    Int                 // Execution order (1, 2, 3...)
  isActive    Boolean             // Can be toggled on/off
  approvers   ApprovalRuleApprover[]
}

model ApprovalRuleApprover {
  id                String  @id
  approvalRuleId    String
  userId            String
  isSpecialApprover Boolean // true for CFO in SPECIFIC_APPROVER/HYBRID rules
  sequence          Int     // Order within the rule
}

model ApprovalRequest {
  id         String         @id
  expenseId  String
  approverId String
  status     ApprovalStatus // PENDING | APPROVED | REJECTED
  sequence   Int            // Which approval level (1, 2, 3...)
  comments   String?
}
```

### API Endpoints

#### 1. Create Expense with Approval Workflow
```
POST /api/expenses
Body: { amount, currency, category, description, date, receipt }
Returns: Expense with approval requests created
```

**Implementation:**
1. Creates expense record
2. Checks for manager approval requirement
3. Fetches active approval rules (ordered by sequence)
4. Creates approval requests for each level
5. Returns expense

#### 2. Approve/Reject Expense
```
PATCH /api/expenses/[id]/approve
Body: { status: "APPROVED" | "REJECTED", comments?: string }
Returns: { message, status }
```

**Implementation:**
1. Finds pending approval request for current user
2. Updates request status
3. If REJECTED → Reject expense, cancel all pending at same sequence
4. If APPROVED → Check conditional rules:
   - Rules satisfied → Move to next sequence or final approval
   - Rules not satisfied → Keep pending
   - Rules impossible → Reject expense

---

## 🧪 Test Scenarios

### Test 1: Simple Manager Approval
```bash
# Setup
User: Employee (id: emp_1)
Manager: John (id: mgr_1, isManagerApprover: true)
Rules: None

# Flow
POST /api/expenses (by emp_1)
→ Approval Request created: { approverId: mgr_1, sequence: 1 }

PATCH /api/expenses/exp_1/approve (by mgr_1)
Body: { status: "APPROVED" }
→ Expense status: APPROVED ✓
```

### Test 2: Manager + Percentage Rule
```bash
# Setup
User: Employee (id: emp_1)
Manager: John (id: mgr_1, isManagerApprover: true)
Rules:
  - Finance Team (PERCENTAGE, 60%, sequence: 1)
    Approvers: fin_a, fin_b, fin_c

# Flow
POST /api/expenses (by emp_1)
→ Approval Requests:
  { approverId: mgr_1, sequence: 1 }
  { approverId: fin_a, sequence: 2 }
  { approverId: fin_b, sequence: 2 }
  { approverId: fin_c, sequence: 2 }

PATCH /api/expenses/exp_1/approve (by mgr_1)
Body: { status: "APPROVED" }
→ Expense status: PENDING (waiting for sequence 2)

PATCH /api/expenses/exp_1/approve (by fin_a)
Body: { status: "APPROVED" }
→ Expense status: PENDING (33% approved, need 60%)

PATCH /api/expenses/exp_1/approve (by fin_b)
Body: { status: "APPROVED" }
→ Expense status: APPROVED ✓ (66% approved, condition met!)
```

### Test 3: Hybrid Rule (CFO Override)
```bash
# Setup
User: Employee (id: emp_1)
Manager: None (isManagerApprover: false)
Rules:
  - Hybrid (HYBRID, 60%, sequence: 1)
    Approvers:
      - fin_a (isSpecialApprover: false)
      - fin_b (isSpecialApprover: false)
      - fin_c (isSpecialApprover: false)
      - cfo_1 (isSpecialApprover: true)

# Flow 1: CFO Override
POST /api/expenses (by emp_1)
→ Approval Requests (all sequence 1):
  { approverId: fin_a, sequence: 1 }
  { approverId: fin_b, sequence: 1 }
  { approverId: fin_c, sequence: 1 }
  { approverId: cfo_1, sequence: 1 }

PATCH /api/expenses/exp_1/approve (by cfo_1)
Body: { status: "APPROVED" }
→ Expense status: APPROVED ✓ (Special approver approved!)

# Flow 2: Percentage Met
POST /api/expenses (by emp_1)
→ Same approval requests created

PATCH /api/expenses/exp_1/approve (by fin_a)
Body: { status: "APPROVED" }
→ Expense status: PENDING (25% approved)

PATCH /api/expenses/exp_1/approve (by fin_b)
Body: { status: "APPROVED" }
→ Expense status: PENDING (50% approved)

PATCH /api/expenses/exp_1/approve (by fin_c)
Body: { status: "APPROVED" }
→ Expense status: APPROVED ✓ (75% approved, condition met!)
```

### Test 4: Multi-Level Sequential
```bash
# Setup
User: Employee (id: emp_1)
Manager: John (id: mgr_1, isManagerApprover: true)
Rules:
  - Finance Team (PERCENTAGE, 60%, sequence: 1)
    Approvers: fin_a, fin_b, fin_c
  - Executive (SPECIFIC_APPROVER, sequence: 2)
    Approvers: cfo_1 (special)

# Flow
POST /api/expenses (by emp_1)
→ Approval Requests:
  { approverId: mgr_1, sequence: 1 }      # Manager
  { approverId: fin_a, sequence: 2 }      # Finance
  { approverId: fin_b, sequence: 2 }      # Finance
  { approverId: fin_c, sequence: 2 }      # Finance
  { approverId: cfo_1, sequence: 3 }      # CFO

# Step 1: Manager Approves
PATCH /api/expenses/exp_1/approve (by mgr_1)
Body: { status: "APPROVED" }
→ Expense status: PENDING (move to sequence 2)

# Step 2: Finance Team (2 of 3 approve = 66%)
PATCH /api/expenses/exp_1/approve (by fin_a)
→ Expense status: PENDING (33%)

PATCH /api/expenses/exp_1/approve (by fin_b)
→ Expense status: PENDING (66%, move to sequence 3)

# Step 3: CFO Approves
PATCH /api/expenses/exp_1/approve (by cfo_1)
→ Expense status: APPROVED ✓ (All sequences complete!)
```

### Test 5: Rejection
```bash
# Setup
User: Employee (id: emp_1)
Manager: John (id: mgr_1, isManagerApprover: true)

# Flow
POST /api/expenses (by emp_1)
→ Approval Request: { approverId: mgr_1, sequence: 1 }

PATCH /api/expenses/exp_1/approve (by mgr_1)
Body: { status: "REJECTED", comments: "Missing receipt" }
→ Expense status: REJECTED ✗
→ Rejection reason: "Missing receipt"
```

---

## 📝 Code Locations

| Feature | File | Lines |
|---------|------|-------|
| Expense Creation | `/src/app/api/expenses/route.ts` | 165-286 |
| Manager Approval Check | `/src/app/api/expenses/route.ts` | 211-221 |
| Approval Rule Processing | `/src/app/api/expenses/route.ts` | 223-286 |
| Approval/Rejection Handler | `/src/app/api/expenses/[id]/approve/route.ts` | 185-340 |
| Conditional Rule Checker | `/src/app/api/expenses/[id]/approve/route.ts` | 14-182 |
| Percentage Rule Logic | `/src/app/api/expenses/[id]/approve/route.ts` | 105-117 |
| Specific Approver Logic | `/src/app/api/expenses/[id]/approve/route.ts` | 119-145 |
| Hybrid Rule Logic | `/src/app/api/expenses/[id]/approve/route.ts` | 147-180 |

---

## 🎯 Problem Statement Compliance Checklist

- [x] **Manager approval first** (if isManagerApprover = true)
- [x] **Multi-level approvals** with admin-defined sequence
- [x] **Sequential processing** (moves to next only after current approves)
- [x] **Percentage rule** (e.g., 60% must approve)
- [x] **Specific approver rule** (e.g., CFO auto-approves)
- [x] **Hybrid rule** (percentage OR specific approver)
- [x] **Combination of flows** (manager + multiple rules)
- [x] **Approve/Reject with comments**
- [x] **Currency conversion** in company's default currency
- [x] **View expenses by role** (Employee: own, Manager: team, Admin: all)

---

## 🚀 Ready to Test

The approval workflow is **fully implemented** and ready for testing. To test:

1. **Create test users:**
   ```bash
   # From Admin Dashboard → Users
   - Create managers
   - Create employees
   - Set manager relationships
   - Toggle isManagerApprover flag
   ```

2. **Configure approval rules:**
   ```bash
   # From Admin Dashboard → Approval Rules
   - Create percentage rule (e.g., 60%)
   - Create specific approver rule (CFO)
   - Create hybrid rule (60% OR CFO)
   - Set sequences (1, 2, 3...)
   - Mark special approvers
   ```

3. **Submit test expense:**
   ```bash
   # From Employee account
   POST /api/expenses
   {
     "amount": 1000,
     "originalCurrency": "USD",
     "category": "Travel",
     "description": "Business trip",
     "expenseDate": "2025-10-04T10:00:00Z"
   }
   ```

4. **Approve in sequence:**
   ```bash
   # From Manager/Approver accounts
   PATCH /api/expenses/[id]/approve
   {
     "status": "APPROVED",
     "comments": "Approved"
   }
   ```

5. **Verify workflow:**
   ```bash
   # Check:
   - Approval requests created in correct sequence
   - Percentage calculations working
   - Special approver override working
   - Sequential progression working
   - Final approval/rejection working
   ```

---

## 📚 Documentation

- **Full Guide:** `/APPROVAL_WORKFLOW_GUIDE.md` (with examples and scenarios)
- **This Summary:** `/APPROVAL_WORKFLOW_SUMMARY.md`
- **Setup Guide:** `/SETUP.md`
- **Quick Reference:** `/QUICK_REFERENCE.md`

---

**Status: ✅ COMPLETE - Ready for Testing**
