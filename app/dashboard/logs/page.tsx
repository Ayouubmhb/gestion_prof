import type { Metadata } from "next"
import { LogsContent } from "@/components/logs-content"

export const metadata: Metadata = {
  title: "Historiques | Dashboard",
  description: "Visualisez l'historique des activités du système",
}

export default function LogsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historiques</h1>
      <LogsContent />
    </div>
  )
}

