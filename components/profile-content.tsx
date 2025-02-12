"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { toast, Toaster } from "react-hot-toast";

export function ProfileContent() {
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    photo: null as File | null,
    telephone: "",
    type: "",
  });

  //context
  const { userNewData, setUserNewData } = useUser();
  const userId = userNewData.id;

  useEffect(() => {
    // Fetch profile data on mount
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/prof/${userId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        const data = await response.json();
        console.log(data);

        // Update state with fetched data
        setUserData({
          id: data.id,
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          telephone: data.telephone || "",
          type: data.type || "",
          photo: data.photo,
        });
        setPhoto(data.photo || "/placeholder.svg");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string);
        }
      });

      const response = await fetch(`/api/profile/${userData.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(
          data.error ||
            "Une erreur est survenue lors de la mise à jour de vos informations."
        );
        return;
      }

      toast.success("Vos informations ont été mises à jour avec succès.");
      setUserNewData({
        id: userData.id,
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        telephone: userData.telephone,
        photo: photo,
        isAdmin: false,
        isProfesseur: true,
      });
    } catch (error) {
      console.error("Error updating informations:", error);
      toast.error("Une erreur est survenue lors de la mise à jour.");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
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
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Chargement des informations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <Toaster />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Mon Profil
        </h1>
        <Card className="bg-white shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={photo} alt="Profile photo" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
                  >
                    <Camera className="h-5 w-5" />
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={userData.nom}
                    onChange={(e) =>
                      setUserData({ ...userData, nom: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={userData.prenom}
                    onChange={(e) =>
                      setUserData({ ...userData, prenom: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={userData.telephone}
                  onChange={(e) =>
                    setUserData({ ...userData, telephone: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={userData.type} disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="vacataire">Vacataire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              >
                Mettre à jour le profil
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
