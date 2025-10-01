"use client"

import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 1", balance: 18400 },
  { date: "Jan 5", balance: 17500 },
  { date: "Jan 10", balance: 19200 },
  { date: "Jan 15", balance: 18900 },
  { date: "Jan 20", balance: 20100 },
  { date: "Jan 25", balance: 22000 },
  { date: "Jan 30", balance: 24563 },
]

interface AccountBalanceChartProps {
  className?: string
}

export function AccountBalanceChart({ className }: AccountBalanceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="date" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={isDark ? "#64748b" : "#94a3b8"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-white/20 backdrop-filter backdrop-blur-md bg-black/40 p-2 shadow-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Balance</span>
                      <span className="font-bold">${payload[0].value?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "#3b82f6", opacity: 0.8 },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
