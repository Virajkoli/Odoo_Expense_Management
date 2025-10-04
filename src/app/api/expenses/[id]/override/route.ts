import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const overrideSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(1, "Reason is required for override"),
});

// PATCH /api/expenses/[id]/override - Admin override approval
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can override approvals
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Only admins can override approvals" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = overrideSchema.parse(body);

    // Get the expense
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        approvalRequests: {
          include: {
            approver: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Verify expense belongs to same company
    if (expense.user.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Check if expense is already in final state
    if (expense.status === "APPROVED" || expense.status === "REJECTED") {
      return NextResponse.json(
        { error: `Expense is already ${expense.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const newStatus = data.action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Update expense status
    await prisma.expense.update({
      where: { id: params.id },
      data: {
        status: newStatus,
      },
    });

    // Cancel all pending approval requests
    await prisma.approvalRequest.updateMany({
      where: {
        expenseId: params.id,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
        comments: `Admin override: ${data.reason}`,
      },
    });

    // Create an audit trail entry
    await prisma.approvalRequest.create({
      data: {
        expenseId: params.id,
        approverId: session.user.id,
        sequence: 999, // Special sequence for overrides
        status: newStatus === "APPROVED" ? "APPROVED" : "REJECTED",
        comments: `[ADMIN OVERRIDE] ${data.reason}`,
      },
    });

    // Get updated expense with approval chain
    const updatedExpense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        approvalRequests: {
          include: {
            approver: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      message: `Expense ${newStatus.toLowerCase()} by admin override`,
      expense: updatedExpense,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Override error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
