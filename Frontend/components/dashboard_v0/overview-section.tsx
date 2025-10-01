"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Users, Building2, Calendar, Clock, Star } from "lucide-react"

export function OverviewSection() {
  const { user, organizations } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState([])
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgDescription, setNewOrgDescription] = useState("")
  
  useEffect(() => {
    loadTodaysMeetings()
  }, [])
  
  const loadTodaysMeetings = async () => {
    try {
      const token = localStorage.getItem('token')
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/meetings?meeting_date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
    }
  }
  
  const createOrganization = async () => {
    if (!newOrgName.trim()) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newOrgName,
          description: newOrgDescription
        })
      })
      
      if (response.ok) {
        setNewOrgName("")
        setNewOrgDescription("")
        setShowCreateOrgModal(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create organization:', error)
    }
  }

  const adminOrgs = organizations.filter((org) => org.user_role === "admin")
  const managerOrgs = organizations.filter((org) => org.user_role === "manager")

  const stats = [
    {
      icon: Building2,
      label: "Organizations",
      value: organizations.length,
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    },
    {
      icon: Users,
      label: "Admin Roles",
      value: adminOrgs.length,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    },
    {
      icon: Star,
      label: "Manager Roles",
      value: managerOrgs.length,
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    },
    {
      icon: Calendar,
      label: "Meetings Today",
      value: meetings.length,
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    },
  ]

  const recentActivity = [
    { action: "Joined TechCorp organization", time: "2 hours ago", type: "join" },
    { action: "Created new meeting", time: "4 hours ago", type: "meeting" },
    { action: "Updated profile settings", time: "1 day ago", type: "profile" },
    { action: "Invited user to organization", time: "2 days ago", type: "invite" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-white/70">
          {user?.isPrivateUser
            ? "You're operating as a private user with access to personal and organizational features."
            : "You're part of organizational teams with specific role-based permissions."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-md border shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white" />
                <span className="text-3xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-white/80 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations Overview */}
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '600ms' }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Organizations
          </h2>
          {organizations.length > 0 ? (
            <div className="space-y-3">
              {organizations.map((org, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{org.name}</h3>
                      <p className="text-white/70 text-sm">Joined {new Date(org.user_joined_at).toLocaleDateString()}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        org.user_role  === "admin"
                          ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                          : org.user_role  === "manager"
                            ? "bg-green-500/20 text-green-200 border border-green-500/30"
                            : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                      }`}
                    >
                      {org.user_role .charAt(0).toUpperCase() + org.user_role .slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70">You're not part of any organizations yet.</p>
              <button 
                onClick={() => setShowCreateOrgModal(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm transition-all duration-300"
              >
                Create Organization
              </button>
            </div>
          )}
        </div>


        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: '650ms' }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${750 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "join"
                        ? "bg-green-400"
                        : activity.type === "meeting"
                          ? "bg-blue-400"
                          : activity.type === "profile"
                            ? "bg-purple-400"
                            : "bg-orange-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-white/50 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '900ms' }}>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowCreateOrgModal(true)}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: '1000ms' }}
          >
            <Building2 className="w-6 h-6 mb-2" />
            <h3 className="font-medium mb-1">Create Organization</h3>
            <p className="text-white/70 text-sm">Start a new organization and invite team members</p>
          </button>
          <button 
            onClick={() => router.push('/create-meeting')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: '1100ms' }}
          >
            <Calendar className="w-6 h-6 mb-2" />
            <h3 className="font-medium mb-1">Schedule Meeting</h3>
            <p className="text-white/70 text-sm">Create a new meeting with your team</p>
          </button>
          <button 
            onClick={() => router.push('/users')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: '1200ms' }}
          >
            <Users className="w-6 h-6 mb-2" />
            <h3 className="font-medium mb-1">Invite Users</h3>
            <p className="text-white/70 text-sm">Add new members to your organizations</p>
          </button>
        </div>
      </div>
      
      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Organization Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                  rows={3}
                  placeholder="Organization description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createOrganization}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateOrgModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
