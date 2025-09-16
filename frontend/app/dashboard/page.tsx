"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "../../components/features/dashboard/StatsCard";
import { BalanceCard } from "../../components/features/dashboard/BalanceCard";
import { DashboardFilters } from "../../components/features/dashboard/DashboardFilters";
import { GoalsCard } from "../../components/features/dashboard/GoalsCard";
import { ChartsCard } from "../../components/features/dashboard/ChartsCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "../../components/ui";
import { Navbar } from "../../components/layout/Navbar";
import {
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Download,
  Settings,
} from "lucide-react";
import { apiClientInstance } from "../utils/api-client-factory";
import { DashboardStats, User, Payment, Goal, ChartsData } from "../types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Payment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        profileResponse,
        balanceResponse,
        statsResponse,
        transactionsResponse,
        goalsResponse,
        chartsResponse,
      ] = await Promise.all([
        apiClientInstance.getProfile(),
        apiClientInstance.getBalance(),
        apiClientInstance.getDashboardStats(),
        apiClientInstance.getTransactions(),
        apiClientInstance.getGoals(),
        apiClientInstance.getChartsData(),
      ]);

      if (profileResponse.success) {
        setUser(profileResponse.data);
      }

      if (balanceResponse.success) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                balance: balanceResponse.data.balance,
                tktBalance: balanceResponse.data.tktBalance,
              }
            : null
        );
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data.slice(0, 5));
      }

      if (goalsResponse.success) {
        setGoals(goalsResponse.data);
      }

      if (chartsResponse.success) {
        setChartsData(chartsResponse.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    console.log("Exporting dashboard data...");
  };

  const handleSettings = () => {
    console.log("Opening settings...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={loadDashboardData}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statsData = stats
    ? [
        {
          title: "Current TKT Balance",
          value: `${user?.tktBalance || 0} TKT`,
          change: { value: 12.5, type: "increase" as const },
          icon: TrendingUp,
          color: "success" as const,
          description: "Growth this month",
        },
        {
          title: "Events Attended",
          value: stats.userStats.totalParticipants.toString(),
          change: {
            value: stats.userStats.newUsersThisMonth,
            type: "increase" as const,
          },
          icon: Calendar,
          color: "primary" as const,
          description: "This month",
        },
        {
          title: "Active Events",
          value: stats.activeEvents.toString(),
          change: { value: 3, type: "increase" as const },
          icon: CreditCard,
          color: "secondary" as const,
          description: "Ongoing",
        },
        {
          title: "Total Revenue",
          value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR")}`,
          change: { value: 8.2, type: "increase" as const },
          icon: Activity,
          color: "accent" as const,
          description: "vs last month",
        },
      ]
    : [];

  const goalsData = goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    target: goal.target,
    current: goal.current,
    type: goal.type,
    deadline: goal.deadline,
    completed: goal.completed,
    description: goal.description,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hello, {user?.name || "User"}! 👋
            </h1>
            <p className="text-gray-400">
              Here’s a summary of your activity in events
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button
                onClick={handleExportData}
                variant="outline"
                size="sm"
                className="border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>

              <Button
                onClick={handleExportData}
                variant="outline"
                size="sm"
                className="border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>

            <Button
              onClick={handleSettings}
              variant="outline"
              size="sm"
              className="border-dark-700 text-gray-300 hover:bg-dark-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <DashboardFilters
            onFilterChange={(filters) => {
              console.log("Filters changed:", filters);
            }}
            onExport={(format) => {
              console.log("Export as:", format);
            }}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col h-full">
            <BalanceCard
              balance={user?.tktBalance || 0}
              currency="XLM"
              recentTransactions={recentTransactions.map((tx) => ({
                id: tx.id,
                type:
                  tx.type === "purchase" || tx.type === "event_payment"
                    ? "debit"
                    : "credit",
                amount: tx.amount,
                description: tx.description,
                timestamp: tx.timestamp,
              }))}
            />
          </div>

          <div className="flex flex-col h-full">
            <GoalsCard goals={goalsData} />
          </div>
        </div>

        {/* Charts and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartsCard
            balanceHistory={
              chartsData?.balanceHistory.map((item) => ({
                date: item.date,
                balance: item.value,
              })) || []
            }
            spendingByCategory={chartsData?.spendingByCategory || []}
          />

          <Card className="bg-dark-800 border-dark-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Notifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  console.log("Mark all as read");
                }}
              >
                Mark all as read
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Notifications are managed by the global notification system.
                </p>
                <p className="text-gray-500 text-sm">
                  Use the notification bell in the navigation bar to see all
                  notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
