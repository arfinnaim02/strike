import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL("/auth/login?callbackUrl=/account/profile", request.url)
      );
    }

    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    const addressId = String(formData.get("addressId") || "").trim();
    const label = String(formData.get("label") || "").trim();
    const addressFullName = String(formData.get("addressFullName") || "").trim();
    const addressPhone = String(formData.get("addressPhone") || "").trim();
    const addressLine1 = String(formData.get("addressLine1") || "").trim();
    const addressLine2 = String(formData.get("addressLine2") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const district = String(formData.get("district") || "").trim();
    const division = String(formData.get("division") || "").trim();
    const postalCode = String(formData.get("postalCode") || "").trim();

    if (!name || !phone) {
      return new NextResponse("Name and phone are required", { status: 400 });
    }

    if (!addressFullName || !addressPhone || !addressLine1 || !city || !district || !division) {
      return new NextResponse("Address fields are required", { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
          phone,
        },
      });

      await tx.address.updateMany({
        where: {
          userId: session.user.id,
        },
        data: {
          isDefault: false,
        },
      });

      if (addressId) {
        const existingAddress = await tx.address.findFirst({
          where: {
            id: addressId,
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        });

        if (!existingAddress) {
          throw new Error("Address not found");
        }

        await tx.address.update({
          where: {
            id: addressId,
          },
          data: {
            label: label || "Home",
            fullName: addressFullName,
            phone: addressPhone,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            district,
            division,
            postalCode: postalCode || null,
            isDefault: true,
          },
        });
      } else {
        await tx.address.create({
          data: {
            userId: session.user.id,
            label: label || "Home",
            fullName: addressFullName,
            phone: addressPhone,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            district,
            division,
            postalCode: postalCode || null,
            isDefault: true,
          },
        });
      }
    });

    revalidatePath("/account");
    revalidatePath("/account/profile");
    revalidatePath("/checkout");
    revalidatePath("/store/checkout");

    return NextResponse.redirect(new URL("/account/profile?updated=1", request.url));
  } catch (error) {
    console.error("Update profile/address error:", error);
    return new NextResponse("Failed to update profile/address", { status: 500 });
  }
}