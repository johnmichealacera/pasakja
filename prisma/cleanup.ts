import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database (keeping user accounts only)...");

  await prisma.$transaction(async (tx) => {
    const rating = await tx.rating.deleteMany();
    const trip = await tx.trip.deleteMany();
    const earning = await tx.earning.deleteMany();
    const sos = await tx.sosAlert.deleteMany();
    const notification = await tx.notification.deleteMany();
    const booking = await tx.booking.deleteMany();
    const fare = await tx.fare.deleteMany();
    const zone = await tx.zone.deleteMany();

    const drivers = await tx.driver.updateMany({
      data: {
        totalEarnings: 0,
        isAvailable: false,
        currentLat: null,
        currentLng: null,
      },
    });

    console.log({
      ratingsDeleted: rating.count,
      tripsDeleted: trip.count,
      earningsDeleted: earning.count,
      sosAlertsDeleted: sos.count,
      notificationsDeleted: notification.count,
      bookingsDeleted: booking.count,
      faresDeleted: fare.count,
      zonesDeleted: zone.count,
      driversReset: drivers.count,
    });
  });

  console.log("Done. User, Passenger, Driver, and Admin rows were not deleted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
