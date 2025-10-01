"use client"

import { OrganizationManager } from "@/components/organization-manager"

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrganizationManager />
      </div>
    </div>
  )
}