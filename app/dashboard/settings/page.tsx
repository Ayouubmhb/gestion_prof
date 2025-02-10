"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, ArrowBigLeftDash } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { useUser } from "@/app/context/UserContext"

export default function SettingsPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [oldPassword, setOldPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const [photo, setPhoto] = useState<string | null>(null)
  const [userData, setUserData] = useState({
          id: "",
          nom: "",
          prenom: "",
          email: "",
          photo: null as File | null,
          telephone: "",
          isAdmin: false,
          isProfesseur: false,
  });

  const { userNewData, setUserNewData } = useUser();
  
    useEffect(() => {
      async function fetchUser() {
        try {
          const res = await fetch("/api/userData", {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
          });
          if (!res.ok) throw new Error("Failed to fetch user data");
            const data = await res.json();
            console.log(data);
            setUserData(data.user);
            setPhoto(data.user.photo);
        } catch (err) {
          console.error("Erreur");
        } finally {
          setIsLoading(false)
        }
      }
  
      fetchUser();
    }, []);

    // Handle form submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that new password matches confirm password
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch(`/api/settings/password/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          password,
          confirmPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la mise à jour du mot de passe.");
        return;
      }

      toast.success("Mot de passe mis à jour avec succès!");
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault()

    try {
      const formData = new FormData()
      Object.entries(userData).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch(`/api/settings/${userData.id}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || "Une erreur est survenue lors de la mise à jour de vos informations.")
        return
      }

      toast.success("Vos informations ont été mises à jour avec succès.")
      setUserNewData({
        id: userData.id,
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        telephone: userData.telephone,
        photo: photo,
        isAdmin: userData.isAdmin,
        isProfesseur: userData.isProfesseur,
      });
    } catch (error) {
      console.error("Error updating informations:", error)
      toast.error("Une erreur est survenue lors de la mise à jour.")
    }

  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUserData((prev) => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div
            className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <Button onClick={() => router.push("/dashboard")} className="mb-6">
        <ArrowBigLeftDash /> Retour au tableau de bord
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du compte</CardTitle>
          <CardDescription>Modifiez vos informations personnelles</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={photo || undefined} alt="Photo de profil" />
                  <AvatarFallback>
                    {userData.nom.charAt(0)}
                    {userData.prenom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                </Label>
                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={userData.nom} onChange={(e) => setUserData({...userData, nom: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" value={userData.prenom} onChange={(e) => setUserData({...userData, prenom: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={userData.telephone}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                required
              />
            </div>
            
          </CardContent>
          <CardFooter>
            <Button className="bg-green-500 hover:bg-green-600 text-white" type="submit">Mettre à jour les informations</Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mettre à jour votre mot de passe</CardTitle>
          <CardDescription>Modifiez votre mot de passe ici</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mot de passe actuel</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-green-500 hover:bg-green-600 text-white" type="submit">Mettre à jour le mot de passe</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}