import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profileImage } = await req.json();
  if (!profileImage) {
    return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
  }

  const user = session.user as { id: string };
  await prisma.user.update({
    where: { id: user.id },
    data: { profileImage },
  });

  return NextResponse.json({ message: "Profile image updated" });
}
