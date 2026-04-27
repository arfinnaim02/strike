import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ loggedIn: false });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      addresses: {
        where: { isDefault: true },
        take: 1,
        select: {
          fullName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          district: true,
          division: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ loggedIn: false });
  }

  const address = user.addresses[0] ?? null;

  return NextResponse.json({
    loggedIn: true,
    profile: {
      name: address?.fullName || user.name || "",
      phone: address?.phone || user.phone || "",
      email: user.email || "",
      address: address
        ? [address.addressLine1, address.addressLine2, address.city, address.district, address.division]
            .filter(Boolean)
            .join(", ")
        : "",
    },
  });
}