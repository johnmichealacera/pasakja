import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { VEHICLE_TYPES } from "@/lib/vehicle-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, licenseNo, vehicleType, vehiclePlate, vehicleModel, documents } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRole = role === "DRIVER" ? "DRIVER" : "PASSENGER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
      },
    });

    if (userRole === "PASSENGER") {
      await prisma.passenger.create({
        data: { userId: user.id },
      });
    } else if (userRole === "DRIVER") {
      if (!licenseNo || !vehicleType || !vehiclePlate || !vehicleModel) {
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          { error: "Driver details are required" },
          { status: 400 }
        );
      }
      if (!(VEHICLE_TYPES as readonly string[]).includes(vehicleType)) {
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          { error: `Vehicle type must be one of: ${VEHICLE_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      const driver = await prisma.driver.create({
        data: {
          userId: user.id,
          licenseNo,
          vehicleType,
          vehiclePlate,
          vehicleModel,
        },
      });

      // Save uploaded documents if provided
      if (Array.isArray(documents) && documents.length > 0) {
        const validDocs = documents.filter(
          (d: { type?: string; url?: string; filename?: string }) =>
            d.type && d.url && d.filename
        );
        if (validDocs.length > 0) {
          await prisma.driverDocument.createMany({
            data: validDocs.map((d: { type: string; url: string; filename: string }) => ({
              driverId: driver.id,
              type: d.type,
              url: d.url,
              filename: d.filename,
            })),
          });
        }
      }
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
