import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UserProvider } from "../context/UserContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <div className="md:ml-72 pl-4 transition-all duration-300 ease-in-out">
          <Header />
          <main className="pt-16">
            <div className="p-5">
              <div className="max-w-6xl mx-auto">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  )
}

