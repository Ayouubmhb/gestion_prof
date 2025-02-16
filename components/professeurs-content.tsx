"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Upload,
  Edit,
  Eye,
  Trash2,
  Search,
  Printer,
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import QRCode from "qrcode"
import * as XLSX from "xlsx"
import { toast, Toaster } from "react-hot-toast"

type Professeur = {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  type: "permanent" | "vacataire"
  matieresEnseignees: string[]
  photo: string | null
}

export function ProfesseursContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [professeurs, setProfesseurs] = useState<Professeur[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [professorToDelete, setProfessorToDelete] = useState<string | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfesseurs()
  }, [])

  const filteredProfesseurs = useMemo(() => {
    return professeurs.filter((professeur) =>
      Object.entries(professeur).some(
        ([key, value]) =>
          ["nom", "prenom", "email", "telephone", "type", "matieresEnseignees"].includes(key) &&
          (typeof value === "string" || Array.isArray(value)) &&
          (typeof value === "string"
            ? value.toLowerCase().includes(searchTerm.toLowerCase())
            : value.some((item: string) => item.toLowerCase().includes(searchTerm.toLowerCase()))),
      ),
    )
  }, [professeurs, searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [professeurs, searchTerm]) //Fixed unnecessary dependency

  const fetchProfesseurs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/prof")
      if (!response.ok) {
        throw new Error("Failed to fetch professors")
      }
      const data = await response.json()
      setProfesseurs(data)
    } catch (error) {
      console.error("Error fetching professors:", error)
      toast.error("Erreur lors du chargement des professeurs")
    }finally{
      setIsLoading(false);
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProfesseurs.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleEdit = (id: string) => {
    router.push(`/dashboard/professeurs/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/prof`, {
        method: "DELETE",
        body: JSON.stringify({id: id}),
      })
      if (!response.ok) {
        throw new Error("Failed to delete professor")
      }
      setProfesseurs((prevState) => prevState.filter((prof) => prof.id !== id))
      setIsDeleteDialogOpen(false)
      setProfessorToDelete(null)
      toast.success("Professeur supprimé avec succès")
    } catch (error) {
      console.error("Error deleting professor:", error)
      toast.error("Erreur lors de la suppression du professeur")
    }
  }

  const handlePrintCard = async (professeur: Professeur) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54],
      })
  
      // Add white background
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, 85, 54, "F")
  
      // Add green background at the bottom
      doc.setFillColor(1,50,46) // Dark green
      doc.rect(0, 40, 85, 14, "F")
  
      // Add gold vertical line
      doc.setDrawColor(218, 165, 32) // Gold color
      doc.setLineWidth(0.2)
      doc.line(60, 4, 60, 51)
  
      // Add "ENSEIGNANT CHERCHEUR" text
      doc.setFontSize(14)
      doc.setTextColor(0, 100, 0) // Dark green
      doc.setFont("times", "bold")
      doc.text("ENSEIGNANT", 6, 8)
      doc.text("CHERCHEUR", 6, 13)

      //horizontal line
      doc.setDrawColor(218, 165, 32) // Gold color
      doc.setLineWidth(0.3)
      doc.line(18, 15, 27, 15)
  
      // Add department text
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Département : Informatique", 6, 18)
  
      // Add contact information with icons
      doc.setFontSize(5)
      doc.setTextColor(0, 0, 0)
      doc.addImage("/assets/user.png", "PNG", 8, 21, 3, 3)
      doc.text(`${professeur.nom} ${professeur.prenom}`, 13, 23)
      doc.addImage("/assets/phone.png", "PNG", 8, 25, 3, 3)
      doc.text(professeur.telephone, 13, 27)
      doc.addImage("/assets/email.png", "PNG", 8, 29, 3, 3)
      doc.text(professeur.email, 13, 31)
      doc.addImage("/assets/website.png", "PNG", 8, 33, 3, 3)
      doc.text("www.fs.ucd.ac.ma", 13, 35)
  
      // Add faculty text and logo in top right
      doc.setFontSize(4)
      doc.setTextColor(0, 0, 0)
      doc.addImage("/assets/fs.png", "PNG", 62, 4, 8, 8)
      doc.setFont("courier", "normal")
      doc.text("FACULTÉ DES", 72, 6)
      doc.text("SCIENCES", 72, 8)
      doc.text("EL JADIDA", 72, 10)
  
      try {
        // Add profile photo as square
        const img = await loadImage(professeur.photo || "/placeholder.svg")
        doc.addImage(img, "PNG", 64, 32, 18, 18) // Square photo
        doc.setDrawColor(0, 0, 0) // Black color
        doc.setLineWidth(0.3) // Border thickness
        doc.rect(64, 32, 18, 18, "D") // "D" means only draw border
      } catch (imgError) {
        console.error("Error loading image:", imgError)
        doc.setFontSize(6)
        doc.text("Photo non disponible", 62, 38)
      }
  
      try {
        // Add QR code in bottom left
        const qrCodeDataUrl = await QRCode.toDataURL(
          JSON.stringify({
            nom: professeur.nom,
            prenom: professeur.prenom,
            email: professeur.email,
            telephone: professeur.telephone,
          }),
        )
        doc.addImage(qrCodeDataUrl, "PNG", 6, 41, 12, 12)
      } catch (qrError) {
        console.error("Error generating QR code:", qrError)
      }
  
      doc.save(`carte_${professeur.nom}_${professeur.prenom}.pdf`)
  

    } catch (error) {
      console.error("Error generating PDF:", error)
      
    }
  }

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = src
    })
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      const tableData = filteredProfesseurs.map((prof) => [
        prof.nom,
        prof.prenom,
        prof.email,
        prof.telephone,
        prof.type,
        prof.matieresEnseignees.join(", "),
      ])

      autoTable(doc, {
        head: [["Nom", "Prénom", "Email", "Téléphone", "Type", "Matière(s) enseignée(s)"]],
        body: tableData,
      })
      doc.save("professeurs.pdf")
      toast.success("Export PDF réussi")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Erreur lors de l'export PDF")
    }
  }

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()
      const excelData = filteredProfesseurs.map((prof) => ({
        Nom: prof.nom,
        Prénom: prof.prenom,
        Email: prof.email,
        Téléphone: prof.telephone,
        Type: prof.type,
        "Matière(s) enseignée(s)": prof.matieresEnseignees.join(", "),
      }))
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(workbook, worksheet, "Professeurs")
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "professeurs.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Export Excel réussi")
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast.error(`Erreur lors de l'export Excel: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleImportExcel called", event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      toast.error("Aucun fichier sélectionné")
      return
    }

    const toastId = toast.loading("Importation en cours...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const data = new Uint8Array(arrayBuffer)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const validatedData = validateImportData(jsonData)
      if (validatedData.length > 0) {
        const response = await fetch("/api/prof/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de l'importation")
        }
  
        const result = await response.json()
        await fetchProfesseurs() // Refresh the list after import
        toast.success(`${result.importedCount} professeurs importés avec succès`, { id: toastId })
      } else {
        toast.error("Aucune donnée valide n'a été trouvée dans le fichier", { id: toastId })
      }
    } catch (error) {
      console.error("Error importing Excel file:", error)
      toast.error("Erreur lors de l'importation du fichier Excel. Veuillez vérifier le format du fichier.", {
        id: toastId,
      })
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateImportData = (data: any[]): Professeur[] => {
    const validatedData: Professeur[] = []
    const requiredFields = ["nom", "prenom", "email", "telephone", "type", "matieresEnseignees"]

    data.forEach((item, index) => {
      const rowNumber = index + 2 // Adding 2 because Excel starts at 1 and we have a header row
      const errors: string[] = []

      // Check for missing fields
      const missingFields = requiredFields.filter((field) => !item[field])
      if (missingFields.length > 0) {
        errors.push(`Champs manquants: ${missingFields.join(", ")}`)
      }

      // Validate type
      if (item.type && !["permanent", "vacataire"].includes(item.type)) {
        errors.push("Type invalide. Doit être 'permanent' ou 'vacataire'")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (item.email && !emailRegex.test(item.email)) {
        errors.push("Format d'email invalide")
      }

      // Validate phone number format (assuming French format)
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
      if (item.telephone && !phoneRegex.test(item.telephone)) {
        errors.push("Format de numéro de téléphone invalide")
      }

      // Validate matieresEnseignees
      let matieresEnseignees: string[] = []
      if (item.matieresEnseignees) {
        if (typeof item.matieresEnseignees === "string") {
          matieresEnseignees = item.matieresEnseignees.split(",").map((m: string) => m.trim())
        } else if (Array.isArray(item.matieresEnseignees)) {
          matieresEnseignees = item.matieresEnseignees
        } else {
          errors.push("Format invalide pour matière(s) enseignée(s)")
        }
      }

      if (errors.length > 0) {
        console.error(`Erreur à la ligne ${rowNumber}:`, errors.join(". "))
        toast.error(`Erreur à la ligne ${rowNumber}: ${errors.join(". ")}`)
      } else {
        validatedData.push({
          id: Date.now() + index + "", // Temporary ID, will be replaced by the server
          nom: item.nom,
          prenom: item.prenom,
          email: item.email,
          telephone: item.telephone,
          type: item.type as "permanent" | "vacataire",
          matieresEnseignees: matieresEnseignees,
          photo: item.photo || "/placeholder.svg",
        })
      }
    })

    return validatedData
  }

  if(isLoading){
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
          <p className="mt-4 text-lg font-semibold text-gray-700">Chargement des professeurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Liste des Professeurs</h1>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }}
                >
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              onClick={() => router.push("/dashboard/professeurs/add")}
              className="bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Ajouter un professeur
            </Button>
          </div>
        </div>
        <div className="mb-4 relative max-w-sm w-full">
          <Input
            placeholder="Rechercher un professeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Toaster />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Matière(s) enseignée(s)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((professeur, index) => (
                  <TableRow key={professeur.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <TableCell>
                      <img
                        src={professeur.photo || "/placeholder.svg"}
                        alt={`${professeur.prenom} ${professeur.nom}`}
                        className="w-10 h-10 rounded-full"
                      />
                    </TableCell>
                    <TableCell>{professeur.nom}</TableCell>
                    <TableCell>{professeur.prenom}</TableCell>
                    <TableCell className="hidden md:table-cell">{professeur.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{professeur.telephone}</TableCell>
                    <TableCell>{professeur.type}</TableCell>
                    <TableCell>{professeur.matieresEnseignees.join(", ")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Détails du Professeur</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center space-y-4">
                              <img
                                src={professeur.photo || "/placeholder.svg"}
                                alt={`${professeur.prenom} ${professeur.nom}`}
                                className="w-32 h-32 rounded-full"
                              />
                              <h2 className="text-2xl font-bold">{`${professeur.prenom} ${professeur.nom}`}</h2>
                              <p>
                                <strong>Email:</strong> {professeur.email}
                              </p>
                              <p>
                                <strong>Téléphone:</strong> {professeur.telephone}
                              </p>
                              <p>
                                <strong>Type:</strong> {professeur.type}
                              </p>
                              <p>
                                <strong>Matière(s) enseignée(s):</strong> {professeur.matieresEnseignees.join(", ")}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleEdit(professeur.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setProfessorToDelete(professeur.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader className="space-y-3">
                              <AlertDialogTitle className="text-xl font-semibold">Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 flex justify-end space-x-3">
                              <AlertDialogCancel className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Annuler
                              </AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (professorToDelete !== null) {
                                    handleDelete(professorToDelete)
                                  }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                Continuer
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-purple-600 hover:text-purple-800"
                          onClick={() => handlePrintCard(professeur)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastItem >= filteredProfesseurs.length}>
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredProfesseurs.length)}</span> sur{" "}
                <span className="font-medium">{filteredProfesseurs.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={indexOfLastItem >= filteredProfesseurs.length}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => paginate(Math.ceil(filteredProfesseurs.length / itemsPerPage))}
                  disabled={indexOfLastItem >= filteredProfesseurs.length}
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}