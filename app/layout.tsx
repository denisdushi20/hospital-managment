import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Hospital Management System',
  description: 'Client-side Web Project',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

import Header from '@/components/Header'
import Footer from '@/components/Footer'
