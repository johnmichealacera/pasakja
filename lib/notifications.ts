import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

/**
 * Creates a Notification row and, if the user has a registered Expo push
 * token, fires a push too. This is the first thing to ever populate the
 * Notification model — it existed in the schema unused until now.
 */
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const [, user] = await Promise.all([
    prisma.notification.create({ data: { userId, title, message } }),
    prisma.user.findUnique({ where: { id: userId }, select: { pushToken: true } }),
  ]);

  if (user?.pushToken) {
    await sendPushNotification(user.pushToken, title, message, data);
  }
}

export async function notifyAdmins(
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const admins = await prisma.admin.findMany({ select: { userId: true } });
  await Promise.all(admins.map((a) => notifyUser(a.userId, title, message, data)));
}

/**
 * Called when a booking is created (cash or GCash). If the passenger
 * requested a specific driver, only that driver is notified; otherwise
 * every currently available, verified driver is.
 */
export async function notifyEligibleDrivers(booking: {
  id: string;
  requestedDriverId: string | null;
  pickupAddress: string;
}): Promise<void> {
  const title = "New ride request";
  const message = `Pickup at ${booking.pickupAddress}`;
  const data = { bookingId: booking.id, type: "booking_request" };

  if (booking.requestedDriverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: booking.requestedDriverId },
      select: { userId: true },
    });
    if (driver) await notifyUser(driver.userId, title, message, data);
    return;
  }

  const drivers = await prisma.driver.findMany({
    where: { status: "VERIFIED", isAvailable: true },
    select: { userId: true },
  });
  await Promise.all(drivers.map((d) => notifyUser(d.userId, title, message, data)));
}
