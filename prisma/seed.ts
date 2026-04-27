import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const db = new PrismaClient({
  adapter,
});

async function main() {
  const category = await db.category.upsert({
    where: { slug: "jerseys" },
    update: {},
    create: {
      name: "Jerseys",
      slug: "jerseys",
      isActive: true,
    },
  });

  const product1 = await db.product.upsert({
    where: { slug: "argentina-home-jersey" },
    update: {},
    create: {
      name: "Argentina Home Jersey",
      slug: "argentina-home-jersey",
      description: "Premium fan jersey",
      categoryId: category.id,
      basePrice: "1290",
      status: "ACTIVE",
    },
  });

  const product2 = await db.product.upsert({
    where: { slug: "barcelona-home-kit" },
    update: {},
    create: {
      name: "Barcelona Home Kit",
      slug: "barcelona-home-kit",
      description: "Club edition",
      categoryId: category.id,
      basePrice: "1490",
      status: "ACTIVE",
    },
  });

  const user = await db.user.upsert({
    where: { email: "demo@strikesports.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@strikesports.com",
      role: "CUSTOMER",
    },
  });

  for (let i = 1; i <= 5; i++) {
    await db.order.create({
      data: {
        orderNumber: `SS-2026${1000 + i}`,
        userId: user.id,

        shippingName: "Demo Customer",
        shippingPhone: "01700000000",
        shippingAddress: "Mirpur DOHS Road",
        shippingCity: "Dhaka",
        shippingDistrict: "Dhaka",
        shippingDivision: "Dhaka",

        subtotal: "1490",
        discountAmount: "0",
        deliveryCharge: "80",
        total: "1570",

        paymentMethod: i % 2 === 0 ? "BKASH" : "COD",
        paymentStatus: i % 2 === 0 ? "PAID" : "UNPAID",

        status:
          i === 1
            ? "PENDING"
            : i === 2
            ? "CONFIRMED"
            : i === 3
            ? "SHIPPED"
            : i === 4
            ? "DELIVERED"
            : "CANCELLED",

        items: {
          create: [
            {
              productId: i % 2 === 0 ? product1.id : product2.id,
              productName: i % 2 === 0 ? product1.name : product2.name,
              qty: 1,
              unitPrice: "1490",
              totalPrice: "1490",
            },
          ],
        },

        statusHistory: {
          create: [
            {
              status:
                i === 1
                  ? "PENDING"
                  : i === 2
                  ? "CONFIRMED"
                  : i === 3
                  ? "SHIPPED"
                  : i === 4
                  ? "DELIVERED"
                  : "CANCELLED",
              changedBy: "seed",
            },
          ],
        },

        payments:
          i % 2 === 0
            ? {
                create: [
                  {
                    method: "BKASH",
                    amount: "1570",
                    status: "PAID",
                    transactionId: `BKASH-DEMO-${i}`,
                    paidAt: new Date(),
                  },
                ],
              }
            : undefined,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });