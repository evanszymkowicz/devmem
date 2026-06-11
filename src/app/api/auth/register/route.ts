import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validations/auth";

// POST /api/auth/register — create an email/password user.
// Returns the standard { success, data, error } shape with matching status codes.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let parsed;
  try {
    parsed = registerSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    throw error;
  }

  const { name, email, password } = parsed;
  const normalizedEmail = email.toLowerCase();

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: passwordHash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    // P2002 = unique constraint violation (email already registered). Don't leak
    // which field collided beyond the email the caller already supplied.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
