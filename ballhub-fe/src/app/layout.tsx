import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Using system fonts as fallback due to build environment network restrictions
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "BallHub – Áo bóng đá chính hãng",
  description: "Mua áo bóng đá chính hãng...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
      >
        {/* 2. Bọc GoogleOAuthProvider ở lớp ngoài cùng của các Provider */}
        <GoogleOAuthProvider clientId="1049777224329-04m2ti3r4eoqr62lvdpma13t5kgfgivc.apps.googleusercontent.com">
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>

        <Analytics />

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={true}
          visibleToasts={5}
          toastOptions={{
            style: {
              borderRadius: "16px",
              border: "none",
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            },
            className: "font-sans transition-all duration-300 ease-in-out",
          }}
        />
      </body>
    </html>
  );
}
