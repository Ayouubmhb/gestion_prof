"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users2, GraduationCap, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "recharts";

interface Stats {
  total: number;
  permanent: number;
  vacataire: number;
  trends: { month: string; count: number }[];
}

export function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [matiereCount, setMatiereCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profResponse, matiereResponse] = await Promise.all([
          fetch("/api/prof/stats"),
          fetch("/api/matiere"),
        ]);

        const profData = await profResponse.json();
        const matiereData = await matiereResponse.json();

        setStats(profData);
        setMatiereCount(matiereData.total);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return <p className="text-center text-gray-600">Chargement...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="TOTAL PROFESSEURS"
          value={stats?.total ?? 0}
          icon={<Users2 className="h-7 w-7 text-[#DC4E4D]" />}
          change={{ value: 12, trend: "up" }}
          iconClassName="bg-[#DC4E4D]/10"
        />
        <StatCard
          label="PROFESSEURS PERMANENTS"
          value={stats?.permanent ?? 0}
          icon={<GraduationCap className="h-7 w-7 text-[#26C6DA]" />}
          change={{ value: 16, trend: "up" }}
          iconClassName="bg-[#26C6DA]/10"
        />
        <StatCard
          label="PROFESSEURS VACATAIRES"
          value={stats?.vacataire ?? 0}
          icon={<Clock className="h-7 w-7 text-[#7C4DFF]" />}
          change={{ value: 24, trend: "up" }}
          iconClassName="bg-[#7C4DFF]/10"
        />
        <StatCard
          label="MATIÈRES ENSEIGNÉES"
          value={matiereCount}
          icon={<BookOpen className="h-7 w-7 text-[#FFB74D]" />}
          change={{ value: 8, trend: "up" }}
          iconClassName="bg-[#FFB74D]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart for Monthly Trends */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">
              Évolution du Nombre de Professeurs
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.trends || []}>
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

        {/* Bar Chart for Professor Types */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Répartition des Professeurs</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { type: "Permanents", count: stats?.permanent ?? 0 },
                    { type: "Vacataires", count: stats?.vacataire ?? 0 },
                  ]}
                >
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
                  <Bar
                    dataKey="count"
                    name="Totale"
                    fill="#0270af"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change: { value: number; trend: "up" | "down" };
  iconClassName?: string;
}

function StatCard({
  label,
  value,
  icon,
  change,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground tracking-wider">
              {label}
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold">{value}</span>
              <div
                className={cn(
                  "flex items-center text-sm",
                  change.trend === "up" ? "text-emerald-500" : "text-red-500"
                )}
              >
                <span>{Math.abs(change.value)}% Depuis le mois dernier</span>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center",
              iconClassName
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
