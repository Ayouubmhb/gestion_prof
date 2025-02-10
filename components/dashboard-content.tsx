"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users2, GraduationCap, BookOpen, Clock, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { professeurs } from "@/lib/professeurs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Dummy data for charts (we'll keep this for now)
const professorData = [
  { month: "Jan", count: 10 },
  { month: "Feb", count: 15 },
  { month: "Mar", count: 20 },
  { month: "Apr", count: 25 },
  { month: "May", count: 30 },
  { month: "Jun", count: 35 },
]

const professorTypeData = [
  { type: "Permanents", count: professeurs.filter((p) => p.type === "permanent").length },
  { type: "Vacataires", count: professeurs.filter((p) => p.type === "vacataire").length },
]

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  change: {
    value: number
    trend: "up" | "down"
  }
  iconClassName?: string
}

function StatCard({ label, value, icon, change, iconClassName }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground tracking-wider">{label}</p>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold">{value}</span>
              <div
                className={cn("flex items-center text-sm", change.trend === "up" ? "text-emerald-500" : "text-red-500")}
              >
                {change.trend === "up" ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                <span>{Math.abs(change.value)}% Depuis le mois dernier</span>
              </div>
            </div>
          </div>
          <div className={cn("h-14 w-14 rounded-full flex items-center justify-center", iconClassName)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  const [isMounted, setIsMounted] = useState(false)
  const totalProfessors = professeurs.length
  const permanentProfessors = professeurs.filter((p) => p.type === "permanent").length
  const vacataireProfessors = professeurs.filter((p) => p.type === "vacataire").length
  const uniqueSubjects = new Set(professeurs.flatMap((p) => p.matieresEnseignees)).size

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // or a loading indicator
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="TOTAL PROFESSEURS"
          value={totalProfessors}
          icon={<Users2 className="h-7 w-7 text-[#DC4E4D]" />}
          change={{ value: 12, trend: "up" }}
          iconClassName="bg-[#DC4E4D]/10"
        />
        <StatCard
          label="PROFESSEURS PERMANENTS"
          value={permanentProfessors}
          icon={<GraduationCap className="h-7 w-7 text-[#26C6DA]" />}
          change={{ value: 16, trend: "up" }}
          iconClassName="bg-[#26C6DA]/10"
        />
        <StatCard
          label="MATIÈRES ENSEIGNÉES"
          value={uniqueSubjects}
          icon={<BookOpen className="h-7 w-7 text-[#FFB74D]" />}
          change={{ value: 8, trend: "up" }}
          iconClassName="bg-[#FFB74D]/10"
        />
        <StatCard
          label="PROFESSEURS VACATAIRES"
          value={vacataireProfessors}
          icon={<Clock className="h-7 w-7 text-[#7C4DFF]" />}
          change={{ value: 24, trend: "up" }}
          iconClassName="bg-[#7C4DFF]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Évolution du Nombre de Professeurs</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={professorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8f9fa",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#495057", fontWeight: "bold" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Répartition des Professeurs</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={professorTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8f9fa",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#495057", fontWeight: "bold" }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}