"use client"

import type React from "react"

import { Home, Users, Calendar, Settings, LogOut, Plus, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface Toast {
  id: number
  message: string
  visible: boolean
  showIcon: boolean
}

interface DashboardNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardNav({ activeSection, onSectionChange }: DashboardNavProps) {
  const [toast, setToast] = useState<Toast | null>(null)
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgDescription, setNewOrgDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { user, logout, createOrganization } = useAuth()
  const router = useRouter()

  const menuItems = [
    {
      icon: Home,
      label: "Overview",
      id: "overview",
    },
    {
      icon: Users,
      label: "Organizations",
      id: "organizations",
    },
    {
      icon: Calendar,
      label: "Meetings",
      id: "meetings",
    },
    {
      icon: User,
      label: "Profile",
      id: "profile",
    },
    {
      icon: Settings,
      label: "Settings",
      id: "settings",
    },
  ]

  const showToast = (message: string) => {
    const newToast = {
      id: Date.now(),
      message,
      visible: true,
      showIcon: false,
    }
    setToast(newToast)

    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, showIcon: true } : null))
    }, 200)
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false, showIcon: false } : null))
        setTimeout(() => setToast(null), 500)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleLogout = () => {
    logout()
    router.push("/auth")
    showToast("Logged out successfully")
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setIsCreating(true)
    try {
      await createOrganization(newOrgName, newOrgDescription)
      setNewOrgName("")
      setNewOrgDescription("")
      setShowCreateOrgForm(false)
      showToast("Organization created successfully!")
      onSectionChange("organizations")
    } catch (error) {
      console.error("Failed to create organization:", error)
      showToast("Failed to create organization")
    }
    setIsCreating(false)
  }

  return (
    <div className="relative">
      <div className="w-72 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        {/* User Info */}
        <div className="mb-6 p-4 rounded-xl bg-white/10 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">{user?.name}</h3>
              <p className="text-white/70 text-xs">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs">
              {user?.isPrivateUser ? "Private User" : "Org User"}
            </div>
            {user?.orgMemberships && user.orgMemberships.length > 0 && (
              <div className="px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs">
                {user.orgMemberships.length} Org{user.orgMemberships.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out cursor-pointer hover:bg-white/15 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                  isActive ? "bg-white/20 shadow-md" : ""
                }`}
                onClick={() => {
                  onSectionChange(item.id)
                  showToast(`${item.label} selected`)
                }}
              >
                <Icon className="w-5 h-5 text-white transition-transform duration-200 hover:scale-110" />
                <span className="text-white font-medium text-sm">{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => setShowCreateOrgForm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create Organization</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Organization Form Modal */}
      {showCreateOrgForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Organization</h2>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Organization Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  placeholder="Describe your organization"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateOrgForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`absolute top-full mt-4 left-0 right-0 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-500 ease-out transform-gpu z-20 ${
            toast.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
          style={{
            animation: toast.visible
              ? "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "slideOutDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 ease-out ${
                toast.showIcon ? "scale-100 rotate-0" : "scale-0 rotate-180"
              }`}
            >
              <Home
                className={`w-4 h-4 text-white transition-all duration-200 delay-100 ${
                  toast.showIcon ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              />
            </div>
            <span
              className={`text-white font-medium text-sm transition-all duration-300 delay-75 ${
                toast.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              }`}
            >
              {toast.message}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-2xl overflow-hidden">
            <div
              className={`h-full bg-white/30 transition-all duration-2500 ease-linear ${
                toast.visible ? "w-0" : "w-full"
              }`}
              style={{
                animation: toast.visible ? "progressBar 2.5s linear" : "none",
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(2rem) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-0.2rem) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideOutDown {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(1rem) scale(0.95);
          }
        }

        @keyframes progressBar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
