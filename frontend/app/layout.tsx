import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BharatAI | Sovereign Intelligence Terminal",
  description: "Secure sovereign AI platform for the Government of India",
  icons: {
    icon: "/favicon.ico", // Ensure this exists or replace with emoji logic if needed
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161616",
              color: "#f5f5f5",
              border: "1px solid #222",
              fontSize: "14px",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#161616",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#161616",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
