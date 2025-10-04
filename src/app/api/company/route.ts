import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const companySchema = z.object({
  name: z.string().min(2),
  currency: z.string().length(3),
  country: z.string().min(2),
});

// GET company information
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        currency: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update company information (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can update company settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = companySchema.parse(body);

    const updatedCompany = await prisma.company.update({
      where: {
        id: session.user.companyId,
      },
      data: {
        name: data.name,
        currency: data.currency,
        country: data.country,
      },
      select: {
        id: true,
        name: true,
        currency: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
