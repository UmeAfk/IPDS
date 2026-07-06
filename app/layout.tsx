import { Arsenal, Rubik } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAllSiteContent } from "@/lib/supabase";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteContent = await getAllSiteContent();
  const metaDescSetting = siteContent.find(c => c.section === "settings" && c.title === "meta_description");
  const metaDescription = metaDescSetting?.body || "Pune's leading self-redevelopment consultancy. 150+ housing society projects delivered across Maharashtra with full transparency and zero compromise.";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="google-fonts-link"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Serif+Display&family=Cormorant+Garamond:wght@400;600;700&family=Fraunces:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Cinzel:wght@400;700&family=Inter:wght@400;500;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;700&family=Source+Sans+3:wght@400;700&family=Work+Sans:wght@400;700&family=Nunito:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Fira+Code:wght@400;700&family=IBM+Plex+Mono:wght@400;700&family=Space+Mono:wght@400;700&family=Source+Code+Pro:wght@400;700&family=Roboto+Mono:wght@400;700&family=Courier+Prime:wght@400;700&family=Inconsolata:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>IPDS - Self Redevelopment Consultancy | Pune</title>
        <meta name="description" content={metaDescription} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="theme-color" content="#b8922a" />
      </head>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
