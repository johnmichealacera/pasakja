import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/api-auth";

/**
 * Mobile-only counterpart to NextAuth's CredentialsProvider (see auth.ts) —
 * same bcrypt check against the same User table, but returns a Bearer JWT
 * instead of a cookie session, since the mobile client can't use NextAuth's
 * cookie jar. Reuses the existing credentials, no new accounts/tables.
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signMobileToken({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return NextResponse.json({
    token,
    user: { id: user.id, role: user.role, name: user.name, email: user.email },
  });
}
