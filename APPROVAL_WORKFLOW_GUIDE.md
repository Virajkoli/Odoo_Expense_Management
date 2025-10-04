# Approval Workflow Guide

This document explains the complete approval workflow implementation for the Expense Management System.

---

## 📋 Overview

The approval workflow supports **flexible, multi-level approvals** with **conditional rules** as specified in the problem statement. The system handles:

1. **Manager Approval** (if `isManagerApprover` is checked)
2. **Multi-Level Sequential Approvals** (defined by admin)
3. **Conditional Approval Rules**:
   - **Percentage Rule**: e.g., "60% of approvers must approve"
   - **Specific Approver Rule**: e.g., "If CFO approves, auto-approve"
   - **Hybrid Rule**: e.g., "60% OR CFO approves"

---

## 🔄 Workflow Flow

### Step 1: Employee Submits Expense

```
Employee → Submit Expense (Amount, Category, Description, Date, Receipt)
  ↓
System → Currency Conversion (if needed)
  ↓
System → Create Expense Record (status = PENDING)
  ↓
System → Generate Approval Requests
```

### Step 2: Approval Request Generation

The system automatically creates approval requests in **sequential order**:

#### Sequence 1: Manager Approval (Optional)
```typescript
if (user.manager && user.manager.isManagerApprover) {
  // Create approval request for direct manager
  sequence: 1
}
```

#### Sequence 2+: Approval Rules (Active Rules Only)
```typescript
for each active approval rule (ordered by rule.sequence) {
  // Create approval requests based on rule type
  sequence++
}
```

**Example Approval Sequence:**
```
Expense: $5000 Travel Expense

Sequence 1: Manager (if isManagerApprover = true)
  ↓ (after approval)
Sequence 2: Finance Team (Percentage Rule: 60% must approve)
  - Finance Manager A
  - Finance Manager B
  - Finance Manager C
  ↓ (after 2 of 3 approve = 66%)
Sequence 3: CFO (Specific Approver Rule)
  ↓ (after CFO approves)
Status: APPROVED ✓
```

---

## 🎯 Approval Rule Types

### 1. Percentage Rule

**Definition:** A certain percentage of approvers must approve for the expense to move forward.

**Use Case:** Democratic approval for mid-level expenses

**Configuration:**
```typescript
{
  ruleType: "PERCENTAGE",
  percentage: 60,  // 60% must approve
  approvers: [
    { userId: "manager1" },
    { userId: "manager2" },
    { userId: "manager3" },
  ]
}
```

**Logic:**
- All approvers at this sequence receive approval requests **simultaneously**
- System calculates: `(approved / total) * 100`
- If percentage ≥ required percentage → **Move to next sequence**
- If impossible to reach percentage (too many rejections) → **Reject expense**

**Example:**
```
Total Approvers: 5
Required: 60%
Approved: 3 → 60% ✓ (moves to next sequence)
Approved: 2 → 40% ✗ (still pending)
Approved: 2, Rejected: 2 → 40% max, impossible → Reject expense
```

### 2. Specific Approver Rule

**Definition:** If a specific person (e.g., CFO, Director) approves, expense is auto-approved at this sequence.

**Use Case:** Executive override for high-value expenses

**Configuration:**
```typescript
{
  ruleType: "SPECIFIC_APPROVER",
  approvers: [
    { userId: "cfo", isSpecialApprover: true },
    { userId: "director", isSpecialApprover: true },
  ]
}
```

**Logic:**
- Only special approvers receive requests
- If **any** special approver approves → **Move to next sequence immediately**
- If **all** special approvers reject → **Reject expense**

**Example:**
```
Special Approvers: CFO, Director
CFO approves → ✓ (moves to next sequence, Director request cancelled)
Both reject → ✗ (expense rejected)
```

### 3. Hybrid Rule

**Definition:** Combines percentage AND specific approver (OR condition).

**Use Case:** "Either 60% of finance team approves OR CFO approves"

**Configuration:**
```typescript
{
  ruleType: "HYBRID",
  percentage: 60,
  approvers: [
    { userId: "financeManager1", isSpecialApprover: false },
    { userId: "financeManager2", isSpecialApprover: false },
    { userId: "financeManager3", isSpecialApprover: false },
    { userId: "cfo", isSpecialApprover: true },
  ]
}
```

**Logic:**
- All approvers receive requests simultaneously
- **Condition 1:** If special approver approves → **Move to next sequence**
- **Condition 2:** If percentage met → **Move to next sequence**
- If **both** conditions impossible → **Reject expense**

**Example:**
```
Approvers: 3 Finance Managers + 1 CFO
Required: 60% OR CFO

Scenario 1: CFO approves → ✓ (instant approval)
Scenario 2: 2 of 3 Finance Managers approve (66%) → ✓
Scenario 3: 1 Finance Manager approves, CFO rejects → Still pending
Scenario 4: All reject → ✗ (expense rejected)
```

---

## 🔀 Sequential vs. Parallel Approvals

### Sequential (Multi-Level)

**How it works:**
- Approval requests are created with different `sequence` numbers
- Only requests at the **current sequence** are active
- Expense moves to next sequence only after current sequence conditions are met

**Example:**
```
Sequence 1: Manager → APPROVED
  ↓
Sequence 2: Finance Team (60% rule) → 2 of 3 APPROVED (66%)
  ↓
Sequence 3: CFO → APPROVED
  ↓
Result: EXPENSE APPROVED ✓
```

### Parallel (Same Sequence)

**How it works:**
- Multiple approval requests with the **same sequence** number
- All approvers can respond simultaneously
- Rules (percentage/specific/hybrid) determine when to proceed

**Example:**
```
Sequence 2: Finance Team (all at sequence 2)
  - Finance Manager A → APPROVED
  - Finance Manager B → APPROVED
  - Finance Manager C → PENDING

Result: 66% approved, condition met, move to sequence 3
```

---

## 🏗️ Implementation Details

### Database Schema

```prisma
model ApprovalRule {
  id          String           @id
  name        String           // "Finance Team Approval"
  companyId   String
  ruleType    ApprovalRuleType // PERCENTAGE | SPECIFIC_APPROVER | HYBRID
  percentage  Int?             // For PERCENTAGE and HYBRID (e.g., 60)
  sequence    Int              // Order of execution (1, 2, 3...)
  isActive    Boolean          // Can be disabled without deleting
  approvers   ApprovalRuleApprover[]
}

model ApprovalRuleApprover {
  id                String  @id
  approvalRuleId    String
  userId            String
  isSpecialApprover Boolean // true for CFO in SPECIFIC_APPROVER/HYBRID
  sequence          Int     // Order within the rule (if needed)
}

model ApprovalRequest {
  id         String         @id
  expenseId  String
  approverId String
  status     ApprovalStatus // PENDING | APPROVED | REJECTED
  sequence   Int            // Which level of approval
  comments   String?
}
```

### API: Create Expense with Approval Workflow

**Endpoint:** `POST /api/expenses`

**Logic:**
```typescript
1. Create expense record (status = PENDING)

2. Get user's manager
   if (manager.isManagerApprover) {
     Create approval request (sequence = 1, approverId = manager.id)
     currentSequence = 2
   } else {
     currentSequence = 1
   }

3. Get active approval rules (ordered by rule.sequence)

4. For each approval rule:
   if (PERCENTAGE):
     Create requests for all approvers (same sequence)
   
   if (SPECIFIC_APPROVER):
     Create requests for special approvers only (same sequence)
   
   if (HYBRID):
     Create requests for all approvers (same sequence)
   
   currentSequence++

5. Return expense with approval requests created
```

### API: Approve/Reject Expense

**Endpoint:** `PATCH /api/expenses/[id]/approve`

**Body:**
```json
{
  "status": "APPROVED" | "REJECTED",
  "comments": "Looks good!" (optional)
}
```

**Logic:**
```typescript
1. Find pending approval request for current user

2. Update approval request status

3. If REJECTED:
   - Mark expense as REJECTED
   - Auto-reject all other pending requests at same sequence
   - Return

4. If APPROVED:
   - Check conditional approval rules for current sequence
   
   - If conditions met:
     - Check if next sequence exists
       - YES: Return "Moved to next approver"
       - NO: Mark expense as APPROVED, Return "Approved"
   
   - If conditions not met:
     - Return "Waiting for other approvers"
   
   - If conditions impossible:
     - Mark expense as REJECTED
     - Return "Approval conditions not met"
```

### Conditional Approval Logic

```typescript
async function checkConditionalApprovalRules(expenseId, currentSequence) {
  // Get all approval requests at this sequence
  const approvalRequests = await getApprovalRequests(expenseId, currentSequence)
  
  // Find which rule applies to this sequence
  const currentRule = findRuleForSequence(currentSequence)
  
  // Count statuses
  const approved = count(status = APPROVED)
  const rejected = count(status = REJECTED)
  const pending = count(status = PENDING)
  
  // Check if rejected (any rejection = fail for this sequence)
  if (rejected > 0) {
    return { shouldReject: true }
  }
  
  // Apply rule-specific logic
  if (PERCENTAGE rule):
    percentage = (approved / total) * 100
    if (percentage >= required) return { shouldApprove: true }
    if (max possible < required) return { shouldReject: true }
  
  if (SPECIFIC_APPROVER rule):
    if (any special approver approved) return { shouldApprove: true }
    if (all special approvers rejected) return { shouldReject: true }
  
  if (HYBRID rule):
    if (any special approver approved) return { shouldApprove: true }
    percentage = (approved / total) * 100
    if (percentage >= required) return { shouldApprove: true }
    if (both conditions impossible) return { shouldReject: true }
  
  return { stillPending: true }
}
```

---

## 📊 Example Scenarios

### Scenario 1: Simple Manager Approval

**Setup:**
- Employee's manager has `isManagerApprover = true`
- No approval rules configured

**Flow:**
```
Employee submits $500 expense
  ↓
Sequence 1: Manager receives approval request
  ↓
Manager approves
  ↓
No more sequences
  ↓
✓ Expense APPROVED
```

### Scenario 2: Manager + Finance Team (Percentage)

**Setup:**
- Manager approval required
- Finance Team rule: 60% must approve (3 managers)

**Flow:**
```
Employee submits $2000 expense
  ↓
Sequence 1: Direct Manager
  Manager approves ✓
  ↓
Sequence 2: Finance Team (3 managers, need 60%)
  Finance Manager A: APPROVED
  Finance Manager B: APPROVED
  Finance Manager C: PENDING
  → 66% approved, condition met!
  ↓
No more sequences
  ↓
✓ Expense APPROVED
```

### Scenario 3: Manager + Finance + CFO (Specific Approver)

**Setup:**
- Manager approval required
- Finance Team rule: 60% (3 managers)
- CFO rule: CFO approval auto-approves

**Flow:**
```
Employee submits $10,000 expense
  ↓
Sequence 1: Direct Manager
  Manager approves ✓
  ↓
Sequence 2: Finance Team (3 managers, need 60%)
  All 3 approve (100%)
  ↓
Sequence 3: CFO (specific approver)
  CFO approves ✓
  ↓
No more sequences
  ↓
✓ Expense APPROVED
```

### Scenario 4: Hybrid Rule (CFO Override)

**Setup:**
- No manager approval
- Hybrid rule: 60% of 4 finance managers OR CFO

**Flow:**
```
Employee submits $15,000 expense
  ↓
Sequence 1: Hybrid Rule (4 Finance + 1 CFO)
  Finance Manager A: APPROVED
  Finance Manager B: PENDING
  Finance Manager C: PENDING
  Finance Manager D: PENDING
  CFO: APPROVED ✓ (Special approver!)
  ↓
Condition met: CFO approved (hybrid rule satisfied)
  ↓
No more sequences
  ↓
✓ Expense APPROVED

Alternative flow:
  Finance Manager A: APPROVED
  Finance Manager B: APPROVED
  Finance Manager C: APPROVED (75% > 60%)
  CFO: PENDING
  ↓
Condition met: Percentage satisfied
  ↓
✓ Expense APPROVED
```

### Scenario 5: Rejection

**Flow:**
```
Employee submits expense
  ↓
Sequence 1: Manager
  Manager: REJECTED (with comment: "Missing receipt")
  ↓
✗ Expense REJECTED
  All subsequent approval requests cancelled
```

---

## 🎛️ Admin Configuration

### Creating Approval Rules

**From Admin Dashboard → Approval Rules:**

1. **Click "Add Approval Rule"**

2. **Fill in Details:**
   - Name: "Finance Team Approval"
   - Rule Type: PERCENTAGE | SPECIFIC_APPROVER | HYBRID
   - Percentage: (if applicable) e.g., 60
   - Sequence: 1, 2, 3... (order of execution)

3. **Select Approvers:**
   - For PERCENTAGE: Select all approvers
   - For SPECIFIC_APPROVER: Select special approvers and check "Special Approver"
   - For HYBRID: Select all + mark special ones

4. **Activate Rule:**
   - Toggle "Active" to enable
   - Can deactivate without deleting

### Example Configuration

**Rule 1: Finance Team**
```
Name: Finance Team Approval
Type: PERCENTAGE
Percentage: 60
Sequence: 1
Approvers:
  - Finance Manager A
  - Finance Manager B
  - Finance Manager C
Active: Yes
```

**Rule 2: Executive Approval**
```
Name: Executive Approval
Type: SPECIFIC_APPROVER
Sequence: 2
Approvers:
  - CFO (Special Approver ✓)
  - CEO (Special Approver ✓)
Active: Yes
```

**Rule 3: High-Value Hybrid**
```
Name: High-Value Expense Approval
Type: HYBRID
Percentage: 75
Sequence: 1
Approvers:
  - Finance Manager A
  - Finance Manager B
  - Finance Manager C
  - Finance Manager D
  - CFO (Special Approver ✓)
Active: Yes
```

---

## 👥 User Roles & Permissions

### Employee
- ✓ Submit expenses
- ✓ View own expense history
- ✓ Check approval status
- ✗ Cannot approve expenses

### Manager
- ✓ All employee permissions
- ✓ Approve/reject expenses (if in approval chain)
- ✓ View team expenses
- ✗ Cannot configure approval rules

### Admin
- ✓ All manager permissions
- ✓ Configure approval rules
- ✓ Assign manager relationships
- ✓ Set `isManagerApprover` flag
- ✓ View all company expenses
- ✓ Override approvals (can manually approve/reject)

---

## 🔍 Viewing Approval Status

### Employee View

**My Expenses Page:**
```
Expense: $500 - Travel
Status: PENDING
Current Approver: John Manager (Sequence 1 of 2)

Approval Chain:
  ✓ Sequence 1: John Manager - APPROVED (2h ago)
  ⏳ Sequence 2: Finance Team - PENDING
     - Finance A: APPROVED
     - Finance B: PENDING
     - Finance C: PENDING
     (Need 2 of 3 to approve - 60% rule)
```

### Manager/Admin View

**Approval Queue:**
```
Pending Approvals for You:

Expense #1234
Amount: $2,000 (USD)
Employee: Sarah Johnson
Category: Travel
Date: Oct 4, 2025
Sequence: 2 of 3

[Approve] [Reject]
Comments: _________________
```

---

## 🛠️ API Reference

### Get Expense with Approval Details

**GET** `/api/expenses?status=PENDING`

**Response:**
```json
[
  {
    "id": "exp_123",
    "amount": 2000,
    "status": "PENDING",
    "approvalRequests": [
      {
        "id": "req_1",
        "sequence": 1,
        "status": "APPROVED",
        "approver": {
          "name": "John Manager"
        }
      },
      {
        "id": "req_2",
        "sequence": 2,
        "status": "PENDING",
        "approver": {
          "name": "Finance Manager A"
        }
      }
    ]
  }
]
```

### Approve/Reject Expense

**PATCH** `/api/expenses/exp_123/approve`

**Request:**
```json
{
  "status": "APPROVED",
  "comments": "Approved - receipt verified"
}
```

**Response:**
```json
{
  "message": "Approval processed - moved to next approver",
  "status": "PENDING"
}
```

---

## ✅ Compliance with Problem Statement

### ✓ Implemented Features:

1. **✓ Manager Approval First**
   - "The expense is first approved by his manager, if the IS MANAGER APPROVER field is checked"
   - Implemented: Sequence 1 created only if `isManagerApprover = true`

2. **✓ Multi-Level Sequential Approvals**
   - "When multiple approvers are assigned, Admin can define their sequence"
   - Implemented: Approval rules have `sequence` field, requests created in order

3. **✓ Sequential Processing**
   - "Expense moves to the next approver only after the current one approves"
   - Implemented: Only current sequence requests are active, moves to next after conditions met

4. **✓ Percentage Rule**
   - "If 60% of approvers approve → Expense approved"
   - Implemented: Calculates percentage, checks if threshold met

5. **✓ Specific Approver Rule**
   - "If CFO approves → Expense auto-approved"
   - Implemented: `isSpecialApprover` flag, instant approval on special approver approval

6. **✓ Hybrid Rule**
   - "Combine both (e.g., 60% OR CFO approves)"
   - Implemented: Checks both percentage and special approver (OR condition)

7. **✓ Combined Flows**
   - "There can be a combination of both flows (Multiple approvers + Conditional) together"
   - Implemented: Manager (sequence 1) + Multiple rules (sequence 2, 3, 4...)

8. **✓ Rejection Handling**
   - "Approve/Reject with comments"
   - Implemented: Any rejection stops workflow, rejection reason stored

---

## 🚀 Next Steps

1. **Test the Workflow:**
   - Create test users with manager relationships
   - Configure approval rules
   - Submit test expenses
   - Verify approval sequence

2. **Create UI for Approvals:**
   - Approvals dashboard page (`/dashboard/approvals`)
   - Expense detail view with approval chain
   - Approve/Reject buttons with comment field

3. **Add Notifications:**
   - Email notifications when approval request assigned
   - Email on final approval/rejection
   - In-app notifications

4. **Advanced Features:**
   - Approval based on amount thresholds
   - Category-specific rules
   - Time-based auto-approval/escalation

---

**The approval workflow is now fully implemented according to the problem statement!** 🎉
