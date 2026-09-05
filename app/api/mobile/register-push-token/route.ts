import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

/** Mobile-only — the web app has no push registration. */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pushToken } = (await req.json()) as { pushToken?: string };
  if (!pushToken) {
    return NextResponse.json({ error: "pushToken is required" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { pushToken } });

  return NextResponse.json({ ok: true });
}

/** Called on logout so a shared/reused device stops receiving this user's pushes. */
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { pushToken: null } });

  return NextResponse.json({ ok: true });
}
