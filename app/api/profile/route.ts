import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profileImage } = await req.json();
  if (!profileImage) {
    return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { profileImage },
  });

  return NextResponse.json({ message: "Profile image updated" });
}
