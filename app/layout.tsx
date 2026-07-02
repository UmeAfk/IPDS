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
        <title>IPDS - Self Redevelopment Consultancy | Pune</title>
        <meta name="description" content="Pune's leading self-redevelopment consultancy. 150+ housing society projects delivered across Maharashtra with full transparency and zero compromise." />
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
