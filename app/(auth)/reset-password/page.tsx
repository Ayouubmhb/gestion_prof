"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["repeatPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      router.push("/login"); // Redirect if token is missing
    }
  }, [router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la réinitialisation.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé.",
      });

      router.push("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réinitialisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-bold mb-6">Réinitialiser votre mot de passe</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Nouveau mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Répéter le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? "Envoi..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </Form>
    </div>
  );
}