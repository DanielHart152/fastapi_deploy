"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

import { Progress } from "@/components/ui/progress"

const budgetData = [
  { name: "Housing", value: 1200, color: "#3b82f6", spent: 1100, limit: 1200 },
  { name: "Food", value: 800, color: "#10b981", spent: 650, limit: 800 },
  { name: "Transportation", value: 400, color: "#8b5cf6", spent: 350, limit: 400 },
  { name: "Entertainment", value: 300, color: "#f59e0b", spent: 275, limit: 300 },
  { name: "Shopping", value: 200, color: "#ec4899", spent: 230, limit: 200 },
]

interface BudgetOverviewProps {
  extended?: boolean
}

export function BudgetOverview({ extended = false }: BudgetOverviewProps) {
  if (extended) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Budget Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value}`, "Budget"]}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Budget vs. Spending</h3>
          <div className="space-y-6">
            {budgetData.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-sm">
                    <span
                      className={
                        category.spent > category.limit
                          ? "text-rose-500 font-medium"
                          : category.spent > category.limit * 0.9
                            ? "text-amber-400 font-medium"
                            : "text-blue-400 font-medium"
                      }
                    >
                      ${category.spent}
                    </span>
                    <span className="text-muted-foreground"> / ${category.limit}</span>
                  </div>
                </div>
                <Progress
                  value={(category.spent / category.limit) * 100}
                  className="h-2 bg-white/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-full overflow-hidden"
                  indicatorClassName={
                    category.spent > category.limit
                      ? "bg-rose-500/80 backdrop-filter backdrop-blur-sm"
                      : "bg-blue-500/70 backdrop-filter backdrop-blur-sm"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgetData.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{category.name}</span>
            <div className="text-sm">
              <span
                className={
                  category.spent > category.limit
                    ? "text-rose-500 font-medium"
                    : category.spent > category.limit * 0.9
                      ? "text-amber-400 font-medium"
                      : "text-blue-400 font-medium"
                }
              >
                ${category.spent}
              </span>
              <span className="text-muted-foreground"> / ${category.limit}</span>
            </div>
          </div>
          <Progress
            value={(category.spent / category.limit) * 100}
            className="h-2 bg-white/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-full overflow-hidden"
            indicatorClassName={
              category.spent > category.limit
                ? "bg-rose-500/80 backdrop-filter backdrop-blur-sm"
                : "bg-blue-500/70 backdrop-filter backdrop-blur-sm"
            }
          />
        </div>
      ))}
    </div>
  )
}
