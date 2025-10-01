"use client"

import { ArrowUpIcon, CreditCardIcon, ShoppingBagIcon, SmartphoneIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const transactions = [
  {
    id: "t1",
    name: "Starbucks Coffee",
    date: "Today, 10:30 AM",
    amount: -24.5,
    type: "expense",
    category: "Food & Drink",
    icon: <ShoppingBagIcon className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  {
    id: "t2",
    name: "Salary Deposit",
    date: "Mar 15, 2023",
    amount: 4750.0,
    type: "income",
    category: "Salary",
    icon: <ArrowUpIcon className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  {
    id: "t3",
    name: "Amazon.com",
    date: "Mar 14, 2023",
    amount: -156.88,
    type: "expense",
    category: "Shopping",
    icon: <ShoppingBagIcon className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "t4",
    name: "Netflix Subscription",
    date: "Mar 12, 2023",
    amount: -15.99,
    type: "expense",
    category: "Entertainment",
    icon: <SmartphoneIcon className="h-4 w-4" />,
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  {
    id: "t5",
    name: "ATM Withdrawal",
    date: "Mar 10, 2023",
    amount: -200.0,
    type: "expense",
    category: "Cash",
    icon: <CreditCardIcon className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
]

const extendedTransactions = [
  ...transactions,
  {
    id: "t6",
    name: "Uber Ride",
    date: "Mar 9, 2023",
    amount: -32.5,
    type: "expense",
    category: "Transportation",
    icon: <CreditCardIcon className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  },
  {
    id: "t7",
    name: "Freelance Payment",
    date: "Mar 8, 2023",
    amount: 850.0,
    type: "income",
    category: "Freelance",
    icon: <ArrowUpIcon className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  {
    id: "t8",
    name: "Gym Membership",
    date: "Mar 5, 2023",
    amount: -79.99,
    type: "expense",
    category: "Health",
    icon: <CreditCardIcon className="h-4 w-4" />,
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
]

interface RecentTransactionsProps {
  extended?: boolean
}

export function RecentTransactions({ extended = false }: RecentTransactionsProps) {
  const displayTransactions = extended ? extendedTransactions : transactions.slice(0, 4)

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 backdrop-filter backdrop-blur-md border border-white/20 shadow-md">
              <AvatarFallback
                className={`${
                  transaction.type === "income" ? "bg-blue-600/40 text-blue-100" : "bg-blue-500/20 text-blue-100"
                }`}
              >
                {transaction.icon}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{transaction.name}</p>
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`rounded-sm px-1 py-0 text-xs backdrop-filter backdrop-blur-sm ${
                transaction.type === "income"
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  : "bg-white/10 border-white/20"
              }`}
            >
              {transaction.category}
            </Badge>
            <p
              className={`text-sm font-medium ${transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : ""}`}
            >
              {transaction.type === "income" ? "+" : ""}
              {transaction.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
        </div>
      ))}

      {!extended && (
        <div className="pt-2 text-center">
          <a href="#" className="text-xs text-primary hover:underline">
            View all transactions
          </a>
        </div>
      )}
    </div>
  )
}
