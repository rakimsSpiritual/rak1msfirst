import { Toaster } from "sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | rakims",
    default: "rakims",
  },
  description: "The social media app for rakims_spiritual",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextSSRPlugin 
          routerConfig={extractRouterConfig(fileRouter)}
          // Optional: Customize the upload button styling
          appearance={{
            uploadButton: {
              button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed",
              container: "flex justify-center",
              allowedContent: "text-xs text-muted-foreground",
            }
          }}
        />
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="rakims-theme"
          >
            {children}
            <Toaster 
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: "font-sans",
                  title: "font-medium",
                  description: "text-muted-foreground",
                },
              }}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
