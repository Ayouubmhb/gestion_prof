"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Search } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { toast } from "@/components/ui/use-toast"

// Dummy data for logs
const dummyLogs = [
  { id: 1, utilisateur: "John Doe", action: "Connexion", date: "2023-05-01", temps: "08:30:00" },
  { id: 2, utilisateur: "Jane Smith", action: "Création de professeur", date: "2023-05-01", temps: "09:15:00" },
  { id: 3, utilisateur: "Alice Johnson", action: "Déconnexion", date: "2023-05-01", temps: "10:45:00" },
  { id: 4, utilisateur: "Bob Brown", action: "Modification de profil", date: "2023-05-02", temps: "11:20:00" },
  { id: 5, utilisateur: "Charlie Davis", action: "Connexion", date: "2023-05-02", temps: "13:00:00" },
  // Add more dummy data as needed
]

export function LogsContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLogs, setFilteredLogs] = useState(dummyLogs)
  const router = useRouter()

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase()
    setSearchTerm(searchTerm)
    const filteredItems = dummyLogs.filter((log) =>
      Object.values(log).some((value) => value.toString().toLowerCase().includes(searchTerm)),
    )
    setFilteredLogs(filteredItems)
    setCurrentPage(1)
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.autoTable({
        head: [["Utilisateur", "Action", "Date", "Temps"]],
        body: filteredLogs.map((log) => [log.utilisateur, log.action, log.date, log.temps]),
      })
      doc.save("historiques.pdf")
      toast({
        title: "Export PDF réussi",
        description: "Le fichier PDF a été généré avec succès.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Erreur lors de l'export PDF",
        description: "Une erreur s'est produite lors de la génération du fichier PDF.",
        variant: "destructive",
      })
    }
  }

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(filteredLogs)
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historiques")

      // Use writeFile with a Blob
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "historiques.xlsx"
      link.click()

      // Clean up
      URL.revokeObjectURL(url)

      toast({
        title: "Export Excel réussi",
        description: "Le fichier Excel a été généré avec succès.",
      })
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast({
        title: "Erreur lors de l'export Excel",
        description: `Une erreur s'est produite lors de la génération du fichier Excel: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-full max-w-sm relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-8"
          />
        </div>
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
      </div>
      <div className="rounded-md border bg-white shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Temps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((log, index) => (
              <TableRow key={log.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <TableCell>{log.utilisateur}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>{log.temps}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredLogs.length)} sur{" "}
            {filteredLogs.length} résultats
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => paginate(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= filteredLogs.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(Math.ceil(filteredLogs.length / itemsPerPage))}
            disabled={indexOfLastItem >= filteredLogs.length}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

