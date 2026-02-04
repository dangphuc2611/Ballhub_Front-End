import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Import AuthProvider từ đường dẫn file context của bạn
import { AuthProvider } from "@/app/context/AuthContext" 

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'BallHub – Áo bóng đá chính hãng',
  description: 'Mua áo bóng đá chính hãng từ các CLB hàng đầu và đội tuyển quốc gia. Ưu đãi đến 30% cho các sản phẩm mới nhất.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            
            
            <main className="flex-grow">
              {children}
            </main>

            {/* <Footer /> */}
          </div>
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  )
}