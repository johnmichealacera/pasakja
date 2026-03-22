import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("demo123", 12);
  const driverPassword = await bcrypt.hash("demo123", 12);
  const passengerPassword = await bcrypt.hash("demo123", 12);

  // Create Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      phone: "09001234567",
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id },
  });

  // Create Driver
  const driverUser = await prisma.user.upsert({
    where: { email: "driver@demo.com" },
    update: {},
    create: {
      email: "driver@demo.com",
      name: "Juan Dela Cruz",
      password: driverPassword,
      role: "DRIVER",
      phone: "09111234567",
    },
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNo: "D01-23-456789",
      vehicleType: "Tricycle",
      vehiclePlate: "SRG-1234",
      vehicleModel: "Honda Wave 125",
      status: "VERIFIED",
      isAvailable: true,
    },
  });

  // Create Passenger
  const passengerUser = await prisma.user.upsert({
    where: { email: "passenger@demo.com" },
    update: {},
    create: {
      email: "passenger@demo.com",
      name: "Maria Santos",
      password: passengerPassword,
      role: "PASSENGER",
      phone: "09221234567",
    },
  });

  const passenger = await prisma.passenger.upsert({
    where: { userId: passengerUser.id },
    update: {},
    create: { userId: passengerUser.id },
  });

  // Create Zones
  const zone1 = await prisma.zone.upsert({
    where: { id: "zone-1" },
    update: {},
    create: {
      id: "zone-1",
      name: "Zone 1 - Town Center",
      description: "Covers the town center and nearby barangays",
      isActive: true,
    },
  });

  await prisma.fare.upsert({
    where: { id: "fare-1" },
    update: {},
    create: {
      id: "fare-1",
      zoneId: zone1.id,
      baseFare: 25.00,
      perKmRate: 8.00,
    },
  });

  const zone2 = await prisma.zone.upsert({
    where: { id: "zone-2" },
    update: {},
    create: {
      id: "zone-2",
      name: "Zone 2 - Extended Area",
      description: "Covers barangays further from the town center",
      isActive: true,
    },
  });

  await prisma.fare.upsert({
    where: { id: "fare-2" },
    update: {},
    create: {
      id: "fare-2",
      zoneId: zone2.id,
      baseFare: 35.00,
      perKmRate: 10.00,
    },
  });

  // Create sample bookings
  const completedBooking = await prisma.booking.upsert({
    where: { id: "booking-1" },
    update: {},
    create: {
      id: "booking-1",
      passengerId: passenger.id,
      driverId: driver.id,
      pickupLat: 9.6234,
      pickupLng: 125.9685,
      pickupAddress: "Socorro Town Hall, Socorro, Surigao del Norte",
      dropoffLat: 9.6250,
      dropoffLng: 125.9700,
      dropoffAddress: "Socorro Public Market, Socorro, Surigao del Norte",
      status: "COMPLETED",
      fare: 45.00,
      paymentMethod: "CASH",
      paymentStatus: "PAID",
    },
  });

  await prisma.trip.upsert({
    where: { bookingId: completedBooking.id },
    update: {},
    create: {
      bookingId: completedBooking.id,
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 10 * 60 * 1000),
      distance: 2.5,
    },
  });

  await prisma.earning.upsert({
    where: { id: "earning-1" },
    update: {},
    create: {
      id: "earning-1",
      driverId: driver.id,
      bookingId: completedBooking.id,
      amount: 45.00,
    },
  });

  await prisma.driver.update({
    where: { id: driver.id },
    data: { totalEarnings: 45.00 },
  });

  await prisma.rating.upsert({
    where: { bookingId: completedBooking.id },
    update: {},
    create: {
      bookingId: completedBooking.id,
      passengerId: passenger.id,
      driverId: driver.id,
      score: 5,
      comment: "Very polite and professional driver!",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\nDemo Accounts:");
  console.log("  Admin:     admin@demo.com     / demo123");
  console.log("  Driver:    driver@demo.com    / demo123");
  console.log("  Passenger: passenger@demo.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
