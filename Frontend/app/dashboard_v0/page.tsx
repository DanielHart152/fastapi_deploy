"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard_v0/dashboard-nav"
import { OverviewSection } from "@/components/dashboard_v0/overview-section"
import { OrganizationsSection } from "@/components/dashboard_v0/organizations-section"
import { MeetingsSection } from "@/components/dashboard_v0/meetings-section"
import { ProfileSection } from "@/components/dashboard_v0/profile-section"
import { SettingsSection } from "@/components/dashboard_v0/settings-section"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/gradient-background.jpg)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSectionChange = (section: string) => {
    if (section === activeSection) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSection(section)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 150)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "organizations":
        return <OrganizationsSection />
      case "meetings":
        return <MeetingsSection />
      case "profile":
        return <ProfileSection />
      case "settings":
        return <SettingsSection />
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Dashboard Layout */}
      <div className="min-h-screen flex">
        <div className="w-80 flex-shrink-0 p-4">
          <div className="sticky top-4">
            <DashboardNav activeSection={activeSection} onSectionChange={handleSectionChange} />
          </div>
        </div>

        <div className="flex-1 p-4 pr-6">
          <div className={`max-w-none transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
