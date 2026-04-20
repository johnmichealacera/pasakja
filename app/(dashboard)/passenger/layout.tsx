import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { prisma } from "@/lib/prisma";

export default async function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "PASSENGER") {
    const role = (session.user as { role: string }).role.toLowerCase();
    redirect(`/${role}`);
  }

  const user = session.user as { id: string };
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { profileImage: true },
  });

  return (
    <DashboardLayout role="passenger" profileImage={userData?.profileImage ?? null}>
      {children}
    </DashboardLayout>
  );
}
