"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur inconnue");
      }

      toast({
        title: "E-mail envoyé",
        description: "Vérifiez votre boîte de réception pour les instructions de réinitialisation.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message || "Une erreur s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Email</FormLabel>
              <FormControl>
                <Input placeholder="nom@exemple.com" {...field} className="rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
        </Button>
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Retour à la connexion
          </Link>
        </div>
      </form>
    </Form>
  );
}