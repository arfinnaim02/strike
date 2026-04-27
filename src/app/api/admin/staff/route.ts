import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "../../../../lib/db";
import { getCurrentSuperAdmin } from "../../../../lib/admin-auth";

const allowedStaffRoles: Role[] = [
  "ADMIN",
  "ORDER_MANAGER",
  "INVENTORY_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER_SUPPORT",
];

export async function POST(request: Request) {
  try {
    const superAdmin = await getCurrentSuperAdmin();

    if (!superAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "ADMIN") as Role;

    if (!name || !email || !password) {
      return new NextResponse("Name, email and password are required", {
        status: 400,
      });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", {
        status: 400,
      });
    }

    if (!allowedStaffRoles.includes(role)) {
      return new NextResponse("Invalid staff role", { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return NextResponse.redirect(new URL("/admin/staff", request.url));
  } catch (error) {
    console.error("Create staff error:", error);
    return new NextResponse("Failed to create staff", { status: 500 });
  }
}