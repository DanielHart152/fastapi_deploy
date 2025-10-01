"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  Building2,
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Mail,
  MoreVertical,
  UserPlus,
  UserMinus,
  Check,
  ExternalLink,
  Calendar,
  Bell,
  Activity,
  TrendingUp,
} from "lucide-react"

export function OrganizationsSection() {
  const { user, organizations, createOrganization, updateUserRole, removeUserFromOrg } = useAuth()
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgDescription, setNewOrgDescription] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const userOrgs = user?.orgMemberships || []

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setIsCreating(true)
    try {
      await createOrganization(newOrgName, newOrgDescription)
      setNewOrgName("")
      setNewOrgDescription("")
      setShowCreateForm(false)
    } catch (error) {
      console.error("Failed to create organization:", error)
    }
    setIsCreating(false)
  }

  const handleRoleChange = async (orgId: string, userId: string, newRole: "admin" | "manager" | "member") => {
    await updateUserRole(orgId, userId, newRole)
    setShowRoleMenu(null)
  }

  const handleRemoveUser = async (orgId: string, userId: string) => {
    if (window.confirm("Are you sure you want to remove this user from the organization?")) {
      await removeUserFromOrg(orgId, userId)
    }
  }

  const handleViewOrganization = (orgId: string) => {
    router.push(`/organization/${orgId}`)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />
      case "manager":
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
      case "manager":
        return "bg-green-500/20 text-green-200 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-200 border-blue-500/30"
    }
  }

  const canManageUser = (orgId: string, targetUserId: string) => {
    if (!user) return false
    const userMembership = user.orgMemberships.find((m) => m.orgId === orgId)
    if (!userMembership) return false

    // Admins can manage everyone except themselves
    if (userMembership.role === "admin" && targetUserId !== user.id) return true

    // Managers can manage members but not admins or other managers
    if (userMembership.role === "manager") {
      const org = organizations.find((o) => o.id === orgId)
      const targetMember = org?.members.find((m) => m.userId === targetUserId)
      return targetMember?.role === "member" && targetUserId !== user.id
    }

    return false
  }

  const getAvailableRoles = (orgId: string, currentUserRole: string) => {
    const userMembership = user?.orgMemberships.find((m) => m.orgId === orgId)
    if (!userMembership) return []

    if (userMembership.role === "admin") {
      return ["admin", "manager", "member"]
    }

    if (userMembership.role === "manager" && currentUserRole === "member") {
      return ["member", "manager"]
    }

    return []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Organizations</h1>
          <p className="text-white/70">Manage your organizations and team members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </div>

      {/* Create Organization Form */}
      {showCreateForm && (
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
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
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organizations Grid */}
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {organizations.map((userOrg) => {
            const org = organizations.find((o) => o.id === userOrg.id)
            if (!org) return null

            const isSelected = selectedOrg === org.id
            const userRole = userOrg.user_role
            const canManage = userRole === "admin" || userRole === "manager"

            return (
              <div
                key={org.id}
                className={`p-6 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
                  isSelected ? "bg-white/20 border-white/30" : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
                onClick={() => setSelectedOrg(isSelected ? null : org.id)}
              >
                {/* Organization Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{org.name}</h3>
                      <p className="text-white/70 text-sm">{org.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}
                    >
                      {getRoleIcon(userRole)}
                      {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewOrganization(org.id)
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 hover:scale-110"
                      title="View Organization"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Organization Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-white">{org.members?.length || 0}</div>
                    <div className="text-white/70 text-xs">Members</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-white">
                      {org.members?.filter((m) => m.role === "admin").length || 0}
                    </div>
                    <div className="text-white/70 text-xs">Admins</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-white">24</div>
                    <div className="text-white/70 text-xs">Meetings</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-white">5</div>
                    <div className="text-white/70 text-xs">Projects</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewOrganization(org.id)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Activity className="w-4 h-4" />
                    Dashboard
                  </button>
                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowInviteForm(true)
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isSelected ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-6 pt-4 border-t border-white/20 space-y-4">
                    {/* Recent Activity */}
                    <div className={`transform transition-all duration-300 ${
                      isSelected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`} style={{ transitionDelay: isSelected ? '200ms' : '0ms' }}>
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Recent Activity
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Team meeting scheduled</p>
                            <p className="text-white/50 text-xs">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <Users className="w-4 h-4 text-green-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">New member joined</p>
                            <p className="text-white/50 text-xs">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <Bell className="w-4 h-4 text-orange-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Announcement posted</p>
                            <p className="text-white/50 text-xs">3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Members Preview */}
                    <div className="transform transition-all duration-300 delay-200">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Members ({org.members?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {(org.members || []).slice(0, 3).map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="text-white font-medium text-sm flex items-center gap-2">
                                  {member.name}
                                  {member.userId === user?.id && <span className="text-white/50 text-xs">(You)</span>}
                                </div>
                                <div className="text-white/70 text-xs">{member.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Role Badge */}
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(member.role)}`}
                              >
                                {getRoleIcon(member.role)}
                                {member.role}
                              </div>

                              {/* Role Management Menu */}
                              {canManageUser(org.id, member.userId) && (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowRoleMenu(showRoleMenu === member.userId ? null : member.userId)
                                    }}
                                    className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {/* Role Menu Dropdown */}
                                  {showRoleMenu === member.userId && (
                                    <div className="absolute right-0 top-full mt-1 w-48 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl z-50">
                                      <div className="space-y-1">
                                        <div className="px-3 py-2 text-white/70 text-xs font-medium border-b border-white/20">
                                          Change Role
                                        </div>
                                        {getAvailableRoles(org.id, member.role).map((role) => (
                                          <button
                                            key={role}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleRoleChange(org.id, member.userId, role as any)
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/15 ${
                                              member.role === role
                                                ? "bg-white/10 text-white"
                                                : "text-white/80 hover:text-white"
                                            }`}
                                          >
                                            {getRoleIcon(role)}
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                            {member.role === role && <Check className="w-3 h-3 ml-auto" />}
                                          </button>
                                        ))}
                                        <div className="border-t border-white/20 pt-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleRemoveUser(org.id, member.userId)
                                              setShowRoleMenu(null)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-red-500/20 transition-all duration-300"
                                          >
                                            <UserMinus className="w-4 h-4" />
                                            Remove from Organization
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {(org.members?.length || 0) > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrganization(org.id)
                            }}
                            className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm transition-all duration-300"
                          >
                            View all {org.members?.length || 0} members
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role Permissions Info */}
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h5 className="text-white font-medium text-sm mb-2">Role Permissions</h5>
                      <div className="space-y-2 text-xs text-white/70">
                        <div className="flex items-center gap-2">
                          <Crown className="w-3 h-3 tex-yellow-400" />
                          <span className="font-medium text-purple-200">Admin:</span>
                          <span>Full access - manage all members, settings, and organization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-green-400" />
                          <span className="font-medium text-green-200">Manager:</span>
                          <span>Manage meetings, invite members, moderate content</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-blue-400" />
                          <span className="font-medium text-blue-200">Member:</span>
                          <span>Join meetings, view content, participate in discussions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-center">
          <Building2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Organizations Yet</h3>
          <p className="text-white/70 mb-6">Create your first organization to start collaborating with your team.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Organization
          </button>
        </div>
      )}

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Invite Team Member</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Handle invite logic here
                setInviteEmail("")
                setShowInviteForm(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="w-4 h-4" />
                  Send Invite
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close role menu */}
      {showRoleMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowRoleMenu(null)}
          onKeyDown={(e) => e.key === "Escape" && setShowRoleMenu(null)}
        />
      )}
    </div>
  )
}
