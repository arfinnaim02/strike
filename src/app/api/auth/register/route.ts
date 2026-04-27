import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!name || !email || !phone || !password) {
      return new NextResponse("All required fields must be filled", {
        status: 400,
      });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", {
        status: 400,
      });
    }

    if (password !== confirmPassword) {
      return new NextResponse("Passwords do not match", {
        status: 400,
      });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return new NextResponse("Email already registered", {
        status: 400,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
      },
    });

    return NextResponse.redirect(new URL("/auth/login?registered=1", request.url));
  } catch (error) {
    console.error("Register error:", error);
    return new NextResponse("Failed to register", { status: 500 });
  }
}