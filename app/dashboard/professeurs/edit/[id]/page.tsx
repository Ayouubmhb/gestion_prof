"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Plus, X, ArrowBigLeftDash } from "lucide-react"
import { toast } from "react-hot-toast"

export default function EditProfesseurPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [professorDetails, setProfessorDetails] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    type: "permanent",
    photo: null as File | null,
    matieresEnseignees: [] as string[],
  })
  const [newMatiere, setNewMatiere] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchProfessor = async (id: string) => {
    try {
      const response = await fetch(`/api/prof/${id}`)
      if (!response.ok) throw new Error("Failed to fetch professor")
      const data = await response.json()
      setProfessorDetails({ ...data })
      setPreviewUrl(data?.photo)
    } catch (error) {
      console.error("Error fetching professor:", error)
      toast.error("Erreur lors du chargement du professeur")
      router.push("/dashboard/professeurs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfessor(params.id)
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      Object.entries(professorDetails).forEach(([key, value]) => {
        if (key === "matieresEnseignees") {
          formData.append(key, JSON.stringify(value))
        } else if (key === "photo" && value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch(`/api/prof/${professorDetails.id}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || "Une erreur est survenue lors de la mise à jour du professeur.")
        return
      }

      toast.success("Les informations du professeur ont été mises à jour avec succès.")
      router.push("/dashboard/professeurs")
    } catch (error) {
      console.error("Error updating professor:", error)
      toast.error("Une erreur est survenue lors de la mise à jour.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setProfessorDetails((prev) => ({ ...prev, [key]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfessorDetails((prev) => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMatiere = () => {
    if (newMatiere && !professorDetails.matieresEnseignees.includes(newMatiere)) {
      setProfessorDetails((prev) => ({
        ...prev,
        matieresEnseignees: [...prev.matieresEnseignees, newMatiere],
      }))
      setNewMatiere("")
    }
  }

  const handleRemoveMatiere = (matiere: string) => {
    setProfessorDetails((prev) => ({
      ...prev,
      matieresEnseignees: prev.matieresEnseignees.filter((m) => m !== matiere),
    }))
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
      <Button onClick={() => router.push("/dashboard/professeurs")} className="mb-6">
        <ArrowBigLeftDash /> Retour
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Modifier un Professeur</CardTitle>
          <CardDescription>Modifiez les informations du professeur</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={previewUrl || undefined} alt="Photo de profil" />
                  <AvatarFallback>
                    {professorDetails.nom.charAt(0)}
                    {professorDetails.prenom.charAt(0)}
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
              <Input id="nom" value={professorDetails.nom} onChange={(e) => handleInputChange("nom", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" value={professorDetails.prenom} onChange={(e) => handleInputChange("prenom", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={professorDetails.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" value={professorDetails.telephone} onChange={(e) => handleInputChange("telephone", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={professorDetails.type} onValueChange={(value) => handleInputChange("type", value)}>
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
                {professorDetails.matieresEnseignees.map((matiere, index) => (
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
            <Button type="submit" disabled={isLoading}>Mettre à jour le Professeur</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
