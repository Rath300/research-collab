import type { Metadata } from "next";
import { Inter, Rubik } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { NavigationProvider } from "@/contexts/NavigationContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "ResearchCollab - Connecting Researchers and Ideas",
  description: "A platform for researchers to collaborate and share ideas",
  keywords: ["research", "collaboration", "academic", "networking", "science"],
  authors: [{ name: "ResearchCollab Team" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://researchcollab.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://researchcollab.com",
    title: "ResearchCollab - Connecting Researchers and Ideas",
    description: "A platform for researchers to collaborate and share ideas",
    siteName: "ResearchCollab",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResearchCollab - Connecting Researchers and Ideas",
    description: "A platform for researchers to collaborate and share ideas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${rubik.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <NavigationProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  {children}
                </div>
              </div>
              <Toaster position="top-right" richColors />
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
