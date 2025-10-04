import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  country: z.string(),
  companyName: z.string().min(2),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, country, companyName } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Fetch country currency
    const countriesResponse = await fetch(
      process.env.COUNTRIES_API_URL || 'https://restcountries.com/v3.1/all?fields=name,currencies'
    )
    const countries = await countriesResponse.json()
    
    const selectedCountry = countries.find((c: any) => 
      c.name.common === country || c.name.official === country
    )
    
    const currency = selectedCountry?.currencies 
      ? Object.keys(selectedCountry.currencies)[0] 
      : 'USD'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          currency,
          country,
        }
      })

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
          companyId: company.id,
        }
      })

      return { company, user }
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
