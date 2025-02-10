import type { Metadata } from "next"
import Image from "next/image"
import { RecoverForm } from "@/components/auth/recover-form"

export const metadata: Metadata = {
  title: "Récupération de mot de passe | Dashboard",
  description: "Récupérez l'accès à votre compte",
}

export default function RecoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex justify-center mb-8">
              <Image src="/ucd.png" alt="Logo" width={200} height={120} className="h-16 w-auto" priority />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Récupération de mot de passe</h1>
            <p className="text-center text-gray-600 mb-8">
              Entrez votre adresse e-mail pour réinitialiser votre mot de passe
            </p>
            <RecoverForm />
          </div>
        </div>
      </div>
    </div>
  )
}

