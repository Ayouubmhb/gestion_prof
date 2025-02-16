"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Plus, X, ArrowBigLeftDash } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProfDetails {
  nom: string
  prenom: string
  email: string
  telephone: string
  type: "permanent" | "vacataire"
  photo: File | null
  matieresEnseignees: string[]
}

export default function AddProfesseurPage() {
  const router = useRouter()
  const [profDetails, setProfDetails] = useState<ProfDetails>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    type: "permanent",
    photo: null,
    matieresEnseignees: [],
  })
  const [newMatiere, setNewMatiere] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(profDetails).forEach(([key, value]) => {
        if (key === "matieresEnseignees") {
          formData.append(key, JSON.stringify(value))
        } else if (key === "photo" && value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch("/api/prof", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log(data);

      if (!response.ok || data.error) {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de l'ajout du professeur.",
          variant: "destructive",
        })
        return;
      }

      toast({
        title: "Professeur ajouté",
        description: "Le nouveau professeur a été ajouté avec succès.",
      })
      router.push("/dashboard/professeurs")
    } catch (error) {
      console.error("Error adding professor:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'ajout du professeur.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfDetails((prev) => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMatiere = () => {
    if (newMatiere && !profDetails.matieresEnseignees.includes(newMatiere)) {
      setProfDetails((prev) => ({
        ...prev,
        matieresEnseignees: [...prev.matieresEnseignees, newMatiere],
      }))
      setNewMatiere("")
    }
  }

  const handleRemoveMatiere = (matiere: string) => {
    setProfDetails((prev) => ({
      ...prev,
      matieresEnseignees: prev.matieresEnseignees.filter((m) => m !== matiere),
    }))
  }

  return (
    <div className="container mx-auto py-10">
      <Button onClick={() => router.push("/dashboard/professeurs")} className="mb-6">
        <ArrowBigLeftDash /> Retour
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Professeur</CardTitle>
          <CardDescription>Entrez les informations du nouveau professeur</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={previewUrl || undefined} alt="Photo de profil" />
                  <AvatarFallback>
                    {profDetails.nom.charAt(0)}
                    {profDetails.prenom.charAt(0)}
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
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" name="nom" value={profDetails.nom} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" name="prenom" value={profDetails.prenom} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profDetails.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                value={profDetails.telephone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={profDetails.type}
                onValueChange={(value) =>
                  setProfDetails((prev) => ({ ...prev, type: value as "permanent" | "vacataire" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="vacataire">Vacataire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matieresEnseignees">Matières enseignées</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profDetails.matieresEnseignees.map((matiere, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span>{matiere}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2"
                      onClick={() => handleRemoveMatiere(matiere)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="newMatiere"
                  value={newMatiere}
                  onChange={(e) => setNewMatiere(e.target.value)}
                  placeholder="Nouvelle matière"
                />
                <Button type="button" onClick={handleAddMatiere}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ajout en cours..." : "Ajouter le Professeur"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}