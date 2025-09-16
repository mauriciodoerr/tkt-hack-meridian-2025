"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../ui";
import {
  Calendar,
  Filter,
  Download,
  Target,
  Bell,
  TrendingUp,
} from "lucide-react";

interface DashboardFiltersProps {
  onFilterChange: (filters: {
    period: string;
    transactionType: string;
    eventId?: string;
  }) => void;
  onExport: (format: "pdf" | "csv") => void;
}

export function DashboardFilters({
  onFilterChange,
  onExport,
}: DashboardFiltersProps) {
  const [period, setPeriod] = useState("30d");
  const [transactionType, setTransactionType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      period,
      transactionType,
    });
  };

  const periods = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "1y", label: "1 ano" },
    { value: "all", label: "All" },
  ];

  const transactionTypes = [
    { value: "all", label: "All" },
    { value: "payment", label: "Payment in events" },
    { value: "topup", label: "Recargas TKT" },
    { value: "transfer", label: "Transferências P2P" },
    { value: "refund", label: "Refunds" },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value} className="bg-dark-800">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
            >
              {transactionTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-dark-800"
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFilterChange}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Aplicar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Mais Filtros
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="text-white">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Período Personalizado
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
                    placeholder="Data inicial"
                  />
                  <input
                    type="date"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
                    placeholder="Data final"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  placeholder="R$ 1.000,00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="outline" onClick={() => setShowFilters(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFilterChange}>Aplicar Filtros</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
