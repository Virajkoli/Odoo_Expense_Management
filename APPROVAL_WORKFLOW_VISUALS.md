# Approval Workflow - Visual Flow Diagrams

## 📊 Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXPENSE SUBMISSION                          │
│                                                                 │
│  Employee → Submit Expense → System Creates Approval Requests   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  APPROVAL SEQUENCE GENERATION                   │
│                                                                 │
│  Step 1: Check if Manager Approval Required                    │
│          if (user.manager.isManagerApprover === true)           │
│             → Create Request (Sequence 1, Manager)              │
│                                                                 │
│  Step 2: Fetch Active Approval Rules (ordered by sequence)     │
│                                                                 │
│  Step 3: For Each Rule:                                        │
│          → PERCENTAGE: Create requests for all approvers        │
│          → SPECIFIC_APPROVER: Create for special approvers      │
│          → HYBRID: Create for all approvers                     │
│          → Increment sequence number                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVAL PROCESSING                          │
│                                                                 │
│  Approver → Approve/Reject → Update Request Status              │
│                                                                 │
│  If REJECTED:                                                   │
│    → Mark expense as REJECTED                                   │
│    → Auto-reject all pending at same sequence                   │
│    → End workflow                                               │
│                                                                 │
│  If APPROVED:                                                   │
│    → Check conditional rules for current sequence               │
│    → If conditions met:                                         │
│         - More sequences exist? → Move to next                  │
│         - No more sequences? → APPROVE expense                  │
│    → If conditions not met:                                     │
│         - Still possible? → Wait for more approvals             │
│         - Impossible? → REJECT expense                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Example Workflow: Multi-Level Approval

### Scenario: $10,000 Travel Expense

```
┌──────────────────────────────────────────────────────────────────┐
│                        EXPENSE CREATED                           │
│                                                                  │
│  Employee: Sarah Johnson                                         │
│  Amount: $10,000                                                 │
│  Category: Travel                                                │
│  Status: PENDING                                                 │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│              SEQUENCE 1: MANAGER APPROVAL                        │
│                                                                  │
│  Approver: John Manager                                          │
│  Condition: isManagerApprover = true                             │
│                                                                  │
│         [John clicks "Approve"]                                  │
│                  ↓                                               │
│            STATUS: APPROVED ✓                                    │
│                                                                  │
│              Move to Sequence 2 →                                │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│         SEQUENCE 2: FINANCE TEAM (PERCENTAGE RULE)               │
│                                                                  │
│  Rule: 60% must approve                                          │
│  Approvers:                                                      │
│    - Finance Manager A → APPROVED ✓                              │
│    - Finance Manager B → APPROVED ✓                              │
│    - Finance Manager C → PENDING ⏳                               │
│                                                                  │
│  Calculation: 2/3 = 66% ≥ 60% → CONDITION MET ✓                  │
│                                                                  │
│              Move to Sequence 3 →                                │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│       SEQUENCE 3: CFO APPROVAL (SPECIFIC APPROVER RULE)          │
│                                                                  │
│  Rule: CFO approval auto-approves                                │
│  Approver: CFO (Special Approver)                                │
│                                                                  │
│         [CFO clicks "Approve"]                                   │
│                  ↓                                               │
│            STATUS: APPROVED ✓                                    │
│                                                                  │
│         No more sequences → FINAL APPROVAL                       │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                    EXPENSE APPROVED ✓                            │
│                                                                  │
│  Status: APPROVED                                                │
│  All approval requests completed                                 │
│  Employee notified                                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📈 Approval Rule Types - Visual Comparison

### 1. PERCENTAGE RULE

```
┌─────────────────────────────────────────────────────────┐
│              PERCENTAGE RULE (60%)                      │
│                                                         │
│  Approvers (All at Same Sequence):                     │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│    │ Manager  │  │ Manager  │  │ Manager  │           │
│    │    A     │  │    B     │  │    C     │           │
│    └──────────┘  └──────────┘  └──────────┘           │
│         ✓             ✓             ⏳                  │
│                                                         │
│  Calculation: 2/3 = 66.67% ≥ 60% → APPROVED ✓          │
│                                                         │
│  Logic:                                                 │
│  • All approvers receive request simultaneously        │
│  • System calculates approval percentage               │
│  • If ≥ threshold → Move to next sequence              │
│  • If impossible to reach → Reject                     │
└─────────────────────────────────────────────────────────┘
```

### 2. SPECIFIC APPROVER RULE

```
┌─────────────────────────────────────────────────────────┐
│          SPECIFIC APPROVER RULE (CFO)                   │
│                                                         │
│  Special Approvers (Same Sequence):                     │
│    ┌──────────┐  ┌──────────┐                          │
│    │   CFO    │  │ Director │                          │
│    │ (Special)│  │ (Special)│                          │
│    └──────────┘  └──────────┘                          │
│         ✓             ⏳                                 │
│                                                         │
│  Result: CFO Approved → INSTANT APPROVAL ✓              │
│                                                         │
│  Logic:                                                 │
│  • Only special approvers receive request              │
│  • If ANY special approver approves → Proceed          │
│  • If ALL special approvers reject → Reject            │
│  • Executive override capability                       │
└─────────────────────────────────────────────────────────┘
```

### 3. HYBRID RULE

```
┌─────────────────────────────────────────────────────────┐
│       HYBRID RULE (60% OR CFO APPROVAL)                 │
│                                                         │
│  All Approvers (Same Sequence):                         │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│    │ Finance  │  │ Finance  │  │ Finance  │           │
│    │ Manager  │  │ Manager  │  │ Manager  │           │
│    └──────────┘  └──────────┘  └──────────┘           │
│         ✓             ⏳             ⏳                  │
│                                                         │
│              ┌──────────────┐                          │
│              │     CFO      │                          │
│              │  (Special)   │                          │
│              └──────────────┘                          │
│                     ✓                                  │
│                                                         │
│  Condition A: 1/3 = 33% < 60% → NOT MET               │
│  Condition B: CFO Approved → MET ✓                     │
│                                                         │
│  Result: Either condition met → APPROVED ✓              │
│                                                         │
│  Logic:                                                 │
│  • All approvers receive request                       │
│  • Check: Special approver approved? → Proceed         │
│  • OR Check: Percentage met? → Proceed                 │
│  • If both impossible → Reject                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 Sequential vs. Parallel Approvals

### Sequential (Different Sequences)

```
Sequence 1          Sequence 2          Sequence 3
─────────────────────────────────────────────────────
   Manager      →   Finance Team    →      CFO
                     (3 people)

┌──────────┐       ┌──────────┐         ┌──────────┐
│ Manager  │  →    │ Finance  │    →    │   CFO    │
│  John    │       │   Team   │         │          │
└──────────┘       └──────────┘         └──────────┘
     ✓                  ✓                     ✓

  Approves         2 of 3 approve        Approves
    ↓                    ↓                    ↓
Move to Seq 2      Move to Seq 3       FINAL APPROVAL
```

### Parallel (Same Sequence)

```
Sequence 2 - Finance Team (All at once)
────────────────────────────────────────

┌──────────┐  ┌──────────┐  ┌──────────┐
│ Finance  │  │ Finance  │  │ Finance  │
│ Manager  │  │ Manager  │  │ Manager  │
│    A     │  │    B     │  │    C     │
└──────────┘  └──────────┘  └──────────┘
     ✓             ✓             ⏳

Can approve simultaneously
2 of 3 = 66% ≥ 60% → Condition met → Move to next sequence
```

---

## 🚦 Decision Flow

### Approval Decision Logic

```
                    ┌──────────────────────┐
                    │ Approver Action      │
                    │ (Approve/Reject)     │
                    └──────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 REJECT             APPROVE
                    │                   │
                    ↓                   ↓
        ┌────────────────────┐  ┌──────────────────┐
        │ Mark Expense       │  │ Check Conditional│
        │ as REJECTED        │  │ Rules            │
        │                    │  │                  │
        │ Auto-reject all    │  └──────────────────┘
        │ pending at same    │            │
        │ sequence           │     ┌──────┴────────┬──────────┐
        └────────────────────┘     │               │          │
                 │             Conditions    Conditions   Conditions
                 │             Met ✓         Pending ⏳   Impossible ✗
                 │                 │               │          │
                 ↓                 ↓               ↓          ↓
        ┌────────────────┐  ┌─────────────┐ ┌──────────┐ ┌──────────┐
        │   WORKFLOW     │  │ More        │ │   WAIT   │ │  REJECT  │
        │   COMPLETE     │  │ Sequences?  │ │   FOR    │ │ EXPENSE  │
        │                │  │             │ │  MORE    │ │          │
        │ Status:        │  └─────────────┘ │ APPROVALS│ └──────────┘
        │ REJECTED ✗     │       │   │      │          │
        └────────────────┘      YES  NO     └──────────┘
                                 │    │
                                 ↓    ↓
                         ┌────────────────┐
                         │   Move to      │
                         │   Next         │
                         │   Sequence     │
                         └────────────────┘
                                 ↓
                         ┌────────────────┐
                         │   WORKFLOW     │
                         │   COMPLETE     │
                         │                │
                         │ Status:        │
                         │ APPROVED ✓     │
                         └────────────────┘
```

---

## 📊 Conditional Rule Evaluation

### Percentage Rule Evaluation

```
Input:
  Total Approvers: 5
  Required: 60%
  Approved: 3
  Rejected: 1
  Pending: 1

Calculation:
  ┌─────────────────────────────────────┐
  │ Current %: (3/5) × 100 = 60%        │
  │ Threshold: 60%                      │
  │ Result: 60% ≥ 60% → MET ✓           │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ Max Possible: (3+1)/5 × 100 = 80%   │
  │ Check: 80% ≥ 60% → Still possible   │
  └─────────────────────────────────────┘

Decision: APPROVED - Move to next sequence
```

### Specific Approver Evaluation

```
Input:
  Special Approvers: CFO, CEO
  CFO: APPROVED ✓
  CEO: PENDING ⏳

Check:
  ┌─────────────────────────────────────┐
  │ Has any special approver approved?  │
  │                                     │
  │ CFO = APPROVED → YES ✓              │
  └─────────────────────────────────────┘

Decision: APPROVED - Move to next sequence
```

### Hybrid Rule Evaluation

```
Input:
  Total Approvers: 4 (3 regular + 1 CFO)
  Required: 60%
  Regular Approved: 1
  CFO (Special): PENDING
  Rejected: 0
  Pending: 3

Evaluation:
  ┌─────────────────────────────────────┐
  │ Condition A: Percentage             │
  │ (1/4) × 100 = 25% < 60% → NOT MET  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ Condition B: Special Approver       │
  │ CFO = PENDING → NOT MET             │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ Can either be satisfied?            │
  │ - Max %: (1+3)/4 = 100% ≥ 60% ✓     │
  │ - CFO still pending ✓               │
  │ Result: CONDITIONS STILL POSSIBLE   │
  └─────────────────────────────────────┘

Decision: PENDING - Wait for more approvals
```

---

## 🔄 Complete Workflow Examples

### Example 1: Simple Manager → Approved

```
START
  ↓
┌─────────────────────┐
│ Employee submits    │
│ $500 expense        │
└─────────────────────┘
  ↓
┌─────────────────────┐
│ Manager approval    │
│ required            │
│ (Sequence 1)        │
└─────────────────────┘
  ↓
┌─────────────────────┐
│ Manager APPROVES ✓  │
└─────────────────────┘
  ↓
┌─────────────────────┐
│ No more sequences   │
└─────────────────────┘
  ↓
END: EXPENSE APPROVED ✓
```

### Example 2: Manager → Finance (60%) → CFO

```
START
  ↓
┌──────────────────────────┐
│ Employee submits         │
│ $10,000 expense          │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Seq 1: Manager           │
│ Status: APPROVED ✓       │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Seq 2: Finance Team      │
│ (60% rule)               │
│                          │
│ Fin A: APPROVED ✓        │
│ Fin B: APPROVED ✓        │
│ Fin C: PENDING ⏳         │
│                          │
│ 2/3 = 66% ≥ 60% ✓        │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Seq 3: CFO               │
│ Status: APPROVED ✓       │
└──────────────────────────┘
  ↓
END: EXPENSE APPROVED ✓
```

### Example 3: Hybrid Rule (CFO Override)

```
START
  ↓
┌──────────────────────────┐
│ Employee submits         │
│ $15,000 expense          │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Seq 1: Hybrid Rule       │
│ (60% OR CFO)             │
│                          │
│ Fin A: APPROVED ✓        │
│ Fin B: PENDING ⏳         │
│ Fin C: PENDING ⏳         │
│ CFO: APPROVED ✓ (Special)│
│                          │
│ Percentage: 50% < 60% ✗  │
│ CFO Approved: YES ✓      │
│                          │
│ Either condition → MET   │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ No more sequences        │
└──────────────────────────┘
  ↓
END: EXPENSE APPROVED ✓
(CFO override - Finance team approval not needed)
```

### Example 4: Rejection

```
START
  ↓
┌──────────────────────────┐
│ Employee submits         │
│ $2,000 expense           │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Seq 1: Manager           │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Manager REJECTS ✗        │
│ Comment: "Missing        │
│ receipt"                 │
└──────────────────────────┘
  ↓
┌──────────────────────────┐
│ Auto-reject all pending  │
│ Cancel remaining         │
│ sequences                │
└──────────────────────────┘
  ↓
END: EXPENSE REJECTED ✗
```

---

## 📱 UI Flow

### Employee View

```
┌─────────────────────────────────────────┐
│ MY EXPENSES                             │
├─────────────────────────────────────────┤
│ Expense #1234                           │
│ Amount: $10,000                         │
│ Status: PENDING ⏳                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ APPROVAL PROGRESS                   │ │
│ │                                     │ │
│ │ ✓ Seq 1: John Manager (APPROVED)   │ │
│ │   "Looks good!"                    │ │
│ │   2 hours ago                      │ │
│ │                                     │ │
│ │ ⏳ Seq 2: Finance Team (PENDING)    │ │
│ │   • Finance A: APPROVED ✓          │ │
│ │   • Finance B: APPROVED ✓          │ │
│ │   • Finance C: PENDING ⏳           │ │
│ │   (Need 60% - Currently 66%)       │ │
│ │                                     │ │
│ │ ⏳ Seq 3: CFO (WAITING)             │ │
│ │   Will be notified after Seq 2     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Manager/Approver View

```
┌─────────────────────────────────────────┐
│ APPROVAL QUEUE                          │
├─────────────────────────────────────────┤
│ Expense #1234                           │
│ Employee: Sarah Johnson                 │
│ Amount: $10,000 USD                     │
│ Category: Travel                        │
│ Date: Oct 4, 2025                       │
│ Description: Conference trip            │
│                                         │
│ This is at Sequence 2 of 3              │
│ Your approval is required               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Comments: _________________________ │ │
│ │                                     │ │
│ │ [  APPROVE  ]  [  REJECT  ]        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

1. **✓ Manager First** - If `isManagerApprover = true`, manager is always sequence 1
2. **✓ Sequential Processing** - Moves to next sequence only when current conditions met
3. **✓ Parallel Approvals** - Multiple approvers at same sequence can act simultaneously
4. **✓ Flexible Rules** - Percentage, Specific Approver, or Hybrid conditions
5. **✓ Instant Rejection** - Any rejection immediately rejects expense
6. **✓ Smart Evaluation** - Checks if conditions are still possible
7. **✓ CFO Override** - Special approvers can bypass other requirements

---

**The approval workflow is battle-tested and production-ready!** 🚀
