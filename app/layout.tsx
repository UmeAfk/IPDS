import { Arsenal, Rubik } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import "@/styles/globals.css";

const display = Arsenal({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-display",
  display: "swap",
});

const body = Rubik({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>IPDS - Architecture | Development | Interiors</title>
        <meta name="description" content="Pune's premier architecture, redevelopment, and interior design firm. Transforming communities through thoughtful design and quality construction." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="theme-color" content="#b8922a" />
      </head>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
