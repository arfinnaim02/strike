import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "../../../../../lib/db";
import { getCurrentSuperAdmin } from "../../../../../lib/admin-auth";

const allowedStaffRoles: Role[] = [
  "ADMIN",
  "ORDER_MANAGER",
  "INVENTORY_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER_SUPPORT",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const superAdmin = await getCurrentSuperAdmin();

    if (!superAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const role = body.role as Role | undefined;
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : undefined;

    if (role && !allowedStaffRoles.includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    await db.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update staff error:", error);
    return new NextResponse("Failed to update staff", { status: 500 });
  }
}