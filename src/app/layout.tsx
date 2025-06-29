import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomToaster } from "@/components/CustomToaster";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mdFury - Modern Markdown Editor",
  description: "A modern markdown editor with live preview and document management",
};

import { I18nProvider } from "./i18n-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 bg-fixed flex flex-col`}
      >
        <ThemeProvider 
          defaultTheme="dark" 
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </I18nProvider>
          <CustomToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
