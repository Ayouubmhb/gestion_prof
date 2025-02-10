import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import { Inter } from "next/font/google"

// If you want to use a different font, replace 'Inter' with your chosen font
const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



//import './globals.css'