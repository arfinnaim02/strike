import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { CartProvider } from "../components/cart/cart-provider";
import { CartDrawer } from "../components/cart/cart-drawer";
import { AuthSessionProvider } from "../components/auth/session-provider";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Strike Sports",
  description: "Premium sportswear and jerseys for Bangladesh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${barlowCondensed.variable} ${dmSans.variable}`}>
        <AuthSessionProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}