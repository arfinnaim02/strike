import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { db } from "../../../../../lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await db.wishlistItem.count({
    where: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({ count });
}