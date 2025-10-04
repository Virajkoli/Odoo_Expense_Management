import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
  managerId: z.string().optional(),
  isManagerApprover: z.boolean().optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
  managerId: z.string().optional(),
  isManagerApprover: z.boolean().optional(),
  password: z.string().min(6).optional(), // Optional for updates
});

// GET all users in company
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can view all users" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can create users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = userSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Store plain password for email (before hashing)
    const plainPassword = data.password;

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        companyId: session.user.companyId,
        managerId: data.managerId,
        isManagerApprover: data.isManagerApprover || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
      },
    });

    // Send welcome email with credentials
    try {
      const emailTemplate = getWelcomeEmailTemplate(
        user.name,
        user.email,
        plainPassword
      );
      await sendEmail({
        to: user.email,
        ...emailTemplate,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail user creation if email fails, but log it
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update existing user (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can edit users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    // Check if user exists and belongs to the same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: data.id,
        companyId: session.user.companyId,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: data.id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        );
      }
    }

    // Validate manager assignment (manager must be in same company and different from user)
    if (data.managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: data.managerId,
          companyId: session.user.companyId,
        },
      });

      if (!manager) {
        return NextResponse.json(
          { error: "Invalid manager selected" },
          { status: 400 }
        );
      }

      if (data.managerId === data.id) {
        return NextResponse.json(
          { error: "User cannot be their own manager" },
          { status: 400 }
        );
      }
    }

    // Handle manager change - update pending approval requests
    if (existingUser.managerId !== data.managerId) {
      // Update pending approval requests from old manager to new manager
      if (existingUser.managerId && data.managerId && data.isManagerApprover) {
        await prisma.approvalRequest.updateMany({
          where: {
            approverId: existingUser.managerId,
            status: "PENDING",
            expense: {
              userId: data.id,
            },
          },
          data: {
            approverId: data.managerId,
          },
        });
      } else if (existingUser.managerId && !data.isManagerApprover) {
        // Remove pending approval requests if manager approval is disabled
        await prisma.approvalRequest.deleteMany({
          where: {
            approverId: existingUser.managerId,
            status: "PENDING",
            expense: {
              userId: data.id,
            },
          },
        });
      }
    }

    // Prepare update data
    const updateData: any = {
      email: data.email,
      name: data.name,
      role: data.role,
      managerId: data.managerId || null,
      isManagerApprover: data.isManagerApprover || false,
    };

    // Hash new password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can delete users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and belongs to the same company
    const userToDelete = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: session.user.companyId,
      },
      include: {
        employees: true, // Users who report to this user
        expenses: {
          where: {
            status: "PENDING",
          },
        },
        approvalRequests: {
          where: {
            status: "PENDING",
          },
        },
      },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of the current admin
    if (userToDelete.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check for pending expenses
    if (userToDelete.expenses.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete user with pending expenses. Please resolve all pending expenses first.",
        },
        { status: 400 }
      );
    }

    // Check for pending approval requests
    if (userToDelete.approvalRequests.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete user with pending approval requests. Please resolve all pending approvals first.",
        },
        { status: 400 }
      );
    }

    // Update employees to remove this user as their manager
    if (userToDelete.employees.length > 0) {
      await prisma.user.updateMany({
        where: {
          managerId: userId,
        },
        data: {
          managerId: null,
          isManagerApprover: false, // Reset approval flag since they no longer have a manager
        },
      });
    }

    // Delete the user (this will cascade delete related records due to Prisma schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      updatedEmployees: userToDelete.employees.length,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
