"use client"

import { Bell, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { useLogout } from "@/hooks/useLogout"
import { useEffect, useState } from "react"
import { useUser } from "@/app/context/UserContext"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()

  //context
  const { userNewData, setUserNewData } = useUser();

  const {handleLogout} = useLogout();
  const [photo, setPhoto] = useState<string | null>(null)
  const [userData, setUserData] = useState({
        id: "",
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        photo: "",
        isAdmin: false,
        isProfesseur: false,
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/userData", {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
          const data = await res.json();
          setUserData(data.user);
          setUserNewData(data.user);
          setPhoto(data.user.photo);
      } catch (err) {
        console.error("Erreur");
      }
    }

    fetchUser();
  }, [userNewData]);

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Accueil"
      case "/dashboard/professeurs":
        return "Professeurs"
      case "/dashboard/logs":
        return "Historiques"
      case "/dashboard/profile":
        return "Mon Profil"
      default:
        return "Tableau de bord"
    }
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 transition-all duration-300 ease-in-out">
      <div className="mx-5 my-4 rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
              <Bell className="h-5 w-5" />
              <span className="sr-only">View notifications</span>
            </Button>
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="mr-2">{userData.isAdmin ? "Admin" : `Pr. ${userData.nom}`}</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={photo || "/placeholder.svg"}
                      alt=""
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

