import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomToaster } from "@/components/common";
import { Footer } from "@/components/layout";
import { ThemeProvider, NextAuthProvider } from "@/components/providers";
import { AuthProvider } from "@/contexts/AuthContext";



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
        className={"antialiased min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col"}
      >
        <NextAuthProvider>
          <AuthProvider>
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
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
