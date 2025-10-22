import type { Metadata } from "next";
import { Belleza, Alegreya } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/contexts/settings-context";
import AppHeader from "@/components/app-header";

export const metadata: Metadata = {
  title: "PhonoTouch",
  description: "Interactive reading support for children.",
};

const fontHeadline = Belleza({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-headline",
});

const fontBody = Alegreya({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <SettingsProvider>
          <div className="relative flex min-h-screen w-full flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
