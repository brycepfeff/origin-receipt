import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Origin Receipt",
  description: "Generate a tamper-evident authenticity receipt for your media.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#0B0F1A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
