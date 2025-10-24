import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/contexts/settings-context";
import AppHeader from "@/components/app-header";

export const metadata: Metadata = {
  title: "Image2read",
  description: "Interactive reading support for children.",
};

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-headline",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
