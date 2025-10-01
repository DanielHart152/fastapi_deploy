"use client"

import { useTheme } from "next-themes"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const performanceData = [
  { month: "Jan", stocks: 4000, bonds: 2400, crypto: 1800 },
  { month: "Feb", stocks: 4200, bonds: 2500, crypto: 2100 },
  { month: "Mar", stocks: 3800, bonds: 2300, crypto: 1700 },
  { month: "Apr", stocks: 4100, bonds: 2400, crypto: 2000 },
  { month: "May", stocks: 4500, bonds: 2600, crypto: 2300 },
  { month: "Jun", stocks: 4700, bonds: 2700, crypto: 2500 },
]

const allocationData = [
  { name: "Stocks", value: 60 },
  { name: "Bonds", value: 25 },
  { name: "Crypto", value: 10 },
  { name: "Cash", value: 5 },
]

interface InvestmentPerformanceChartProps {
  className?: string
  extended?: boolean
}

export function InvestmentPerformanceChart({ className, extended = false }: InvestmentPerformanceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const textColor = isDark ? "#94a3b8" : "#64748b"
  const gridColor = isDark ? "#334155" : "#e2e8f0"

  if (extended) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={300} className={className}>
            <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} />
              <YAxis stroke={textColor} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                formatter={(value) => [`$${value}`, undefined]}
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="stocks" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="bonds" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="crypto" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={300} className={className}>
            <BarChart data={allocationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} />
              <YAxis stroke={textColor} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Allocation"]}
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          stroke={isDark ? "#64748b" : "#94a3b8"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={isDark ? "#64748b" : "#94a3b8"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              // Calculate total safely by checking if each payload item exists
              const total = payload.reduce((sum, entry) => {
                return sum + (entry && entry.value ? entry.value : 0)
              }, 0)

              return (
                <div className="rounded-lg border border-white/20 backdrop-filter backdrop-blur-md bg-black/40 p-2 shadow-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.month}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                      <span className="font-bold">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="stocks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStocks)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
