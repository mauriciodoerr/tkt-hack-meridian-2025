"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

interface ChartsCardProps {
  balanceHistory: Array<{ date: string; balance: number }>;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
}

export function ChartsCard({
  balanceHistory,
  spendingByCategory,
}: ChartsCardProps) {
  const maxBalance = Math.max(...balanceHistory.map((item) => item.balance));
  const maxSpending = Math.max(
    ...spendingByCategory.map((item) => item.amount)
  );

  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-white">Analytics</CardTitle>
            <p className="text-sm text-gray-400">
              Balance tracking and expenses
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Balance Evolution Chart */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Balance tracking (7 days)
            </h4>
            <div className="h-32 bg-white/5 rounded-lg p-4 flex items-end space-x-2">
              {balanceHistory.map((item, index) => {
                const height = (item.balance / maxBalance) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-400 hover:to-primary-300"
                      style={{ height: `${height}%` }}
                      title={`R$ ${item.balance.toLocaleString("pt-BR")}`}
                    />
                    <span className="text-xs text-gray-400 mt-2">
                      {new Date(item.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spending by Category */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center">
              <PieChart className="w-4 h-4 mr-2" />
              Spent per section (in Events)
            </h4>
            <div className="space-y-3">
              {spendingByCategory.map((category, index) => {
                const percentage = (category.amount / maxSpending) * 100;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{category.category}</span>
                        <span className="text-gray-400">
                          R$ {category.amount.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {balanceHistory[
                  balanceHistory.length - 1
                ]?.balance.toLocaleString("pt-BR") || "0"}{" "}
                XLM
              </p>
              <p className="text-sm text-gray-400">Current balance XLM</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                R${" "}
                {spendingByCategory
                  .reduce((sum, cat) => sum + cat.amount, 0)
                  .toLocaleString("pt-BR")}
              </p>
              <p className="text-sm text-gray-400">spent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
