"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, LogOut, Menu, ChevronLeft, ChevronRight, Users, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"
import { useUser } from "@/app/context/UserContext"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen)
  const { handleLogout } = useLogout();

  //context
  const { userNewData, setUserNewData } = useUser();
  let sidebarItems = [];

  if(userNewData.isAdmin){
    sidebarItems = [
      { icon: Home, label: "Accueil", href: "/dashboard" },
      { icon: Users, label: "Professeurs", href: "/dashboard/professeurs" },
      { icon: FileText, label: "Historiques", href: "/dashboard/logs" },
      //{ icon: User, label: "Mon profil", href: "/dashboard/profile" },
      { icon: LogOut, label: "Déconnexion", href: "#" },
    ]
  }else{
    sidebarItems = [
      { icon: Home, label: "Accueil", href: "/dashboard" },
      //{ icon: Users, label: "Professeurs", href: "/dashboard/professeurs" },
      //{ icon: FileText, label: "Historiques", href: "/dashboard/logs" },
      { icon: User, label: "Mon profil", href: "/dashboard/profile" },
      { icon: LogOut, label: "Déconnexion", href: "#" },
    ]
  }

  return (
    <>
      <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleMobileSidebar}>
        <Menu className="h-4 w-4" />
      </Button>
      <aside
        className={cn(
          "fixed inset-y-5 left-5 z-40 bg-blue-600 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out mr-4",
          isCollapsed ? "w-20" : "w-64",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full py-20">
          <nav className="flex-1 flex flex-col items-center px-2 py-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                onClick={item.label === "Déconnexion" ? handleLogout : undefined}
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-3 rounded-lg transition-colors duration-200",
                  pathname === item.href
                    ? "bg-blue-700 text-white font-medium"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white",
                  isCollapsed ? "w-12 justify-center" : "w-full",
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700" onClick={toggleSidebar}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}