import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "GET" });
      if (!response.ok) throw new Error("Failed to log out");

      toast({ title: "Déconnexion réussie", description: "À bientôt !" });

      router.push("/login"); // Redirect to login page
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur de déconnexion", variant: "destructive" });
    }
  };

  return { handleLogout };
}