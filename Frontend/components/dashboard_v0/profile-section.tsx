"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { User, Mail, Calendar, Building2, Crown, Shield, Edit, Save, X, Camera, Key, Bell } from "lucide-react"

export function ProfileSection() {
  const { user, organizations } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadProfileData()
  }, [])
  
  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData(data.profile)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const [editedUser, setEditedUser] = useState({
    name: profileData?.full_name || user?.name || "",
    email: profileData?.email || user?.email || "",
    company: profileData?.company || "",
    jobTitle: profileData?.job_title || "",
    phone: profileData?.phone_number || "",
    address: profileData?.address || ""
  })
  
  useEffect(() => {
    if (profileData) {
      setEditedUser({
        name: profileData.full_name || user?.name || "",
        email: profileData.email || user?.email || "",
        company: profileData.company || "",
        jobTitle: profileData.job_title || "",
        phone: profileData.phone_number || "",
        address: profileData.address || ""
      })
    }
  }, [profileData, user])
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editedUser.name,
          email: editedUser.email,
          company: editedUser.company,
          job_title: editedUser.jobTitle,
          phone_number: editedUser.phone,
          address: editedUser.address
        })
      })
      
      if (response.ok) {
        setIsEditing(false)
        await loadProfileData()
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setEditedUser({
      name: profileData?.full_name || user?.name || "",
      email: profileData?.email || user?.email || "",
      company: profileData?.company || "",
      jobTitle: profileData?.job_title || "",
      phone: profileData?.phone_number || "",
      address: profileData?.address || ""
    })
    setIsEditing(false)
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
        return "bg-purple-500/20 text-purple-200 border-purple-500/30"
      case "manager":
        return "bg-green-500/20 text-green-200 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-200 border-blue-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/70">Manage your personal information and account settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all duration-300">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={editedUser.company}
                    onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editedUser.jobTitle}
                    onChange={(e) => setEditedUser({ ...editedUser, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{profileData?.full_name || user?.name}</h2>
                <div className="flex items-center gap-2 text-white/70 mb-2">
                  <Mail className="w-4 h-4" />
                  {profileData?.email || user?.email}
                </div>
                {profileData?.company && (
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Building2 className="w-4 h-4" />
                    {profileData.company} {profileData.job_title && `- ${profileData.job_title}`}
                  </div>
                )}
                {profileData?.phone_number && (
                  <div className="text-white/70 mb-4">
                    📞 {profileData.phone_number}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20">
                    {user?.isPrivateUser ? "Private User" : "Organization User"}
                  </div>
                  {user?.orgMemberships && user.orgMemberships.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20">
                      {user.orgMemberships.length} Organization{user.orgMemberships.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organization Memberships */}
      {organizations.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Memberships
          </h3>
          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{org.name}</h4>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(org.user_role)}`}
                >
                  {getRoleIcon(org.user_role)}
                  {org.user_role?.charAt(0).toUpperCase() + org.user_role?.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white">{organizations.length || 0}</span>
          </div>
          <p className="text-white/80 font-medium">Organizations</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Crown className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white">
              {organizations.filter((org) => org.user_role === "admin").length || 0}
            </span>
          </div>
          <p className="text-white/80 font-medium">Admin Roles</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white">
              {organizations.filter((org) => org.user_role === "manager").length || 0}
            </span>
          </div>
          <p className="text-white/80 font-medium">Manager Roles</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveModal('password')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <Key className="w-6 h-6 mb-2" />
            <h4 className="font-medium mb-1">Change Password</h4>
            <p className="text-white/70 text-sm">Update your account password for security</p>
          </button>
          <button 
            onClick={() => setActiveModal('notifications')}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <Bell className="w-6 h-6 mb-2" />
            <h4 className="font-medium mb-1">Notification Settings</h4>
            <p className="text-white/70 text-sm">Manage your notification preferences</p>
          </button>
        </div>
      </div>
      
      {/* Password Change Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (passwordData.new !== passwordData.confirm) {
                      alert('Passwords do not match')
                      return
                    }
                    try {
                      const token = localStorage.getItem('token')
                      const response = await fetch('/api/profile/password', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          currentPassword: passwordData.current,
                          newPassword: passwordData.new
                        })
                      })
                      if (response.ok) {
                        setActiveModal(null)
                        setPasswordData({current: '', new: '', confirm: ''})
                        alert('Password updated successfully')
                      }
                    } catch (error) {
                      console.error('Failed to update password:', error)
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Email Notifications</span>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Meeting Reminders</span>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Organization Updates</span>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null)
                    alert('Notification settings saved')
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setActiveModal(null)}
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
