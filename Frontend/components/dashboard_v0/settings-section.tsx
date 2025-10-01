"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Bell, Shield, Moon, Sun, Key, Trash2, Download, Eye, EyeOff, Save } from "lucide-react"

export function SettingsSection() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      meetings: true,
      organizations: true,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showOrganizations: true,
    },
    appearance: {
      theme: "dark",
      language: "en",
    },
    security: {
      twoFactor: false,
      sessionTimeout: "24h",
    },
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords don't match")
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
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        })
      })
      
      if (response.ok) {
        alert('Password changed successfully')
        setPasswordForm({ current: "", new: "", confirm: "" })
        setShowPasswordForm(false)
      }
    } catch (error) {
      console.error('Failed to change password:', error)
    }
  }

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'user-data-export.json'
        a.click()
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/profile/delete', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          localStorage.removeItem('token')
          window.location.href = '/'
        }
      } catch (error) {
        console.error('Failed to delete account:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70">Manage your account preferences and security settings</p>
      </div>

      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-white/70 text-sm">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleSettingChange("notifications", "email", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Push Notifications</h3>
              <p className="text-white/70 text-sm">Receive push notifications in your browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleSettingChange("notifications", "push", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Meeting Reminders</h3>
              <p className="text-white/70 text-sm">Get notified about upcoming meetings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.meetings}
                onChange={(e) => handleSettingChange("notifications", "meetings", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Organization Updates</h3>
              <p className="text-white/70 text-sm">Notifications about organization changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.organizations}
                onChange={(e) => handleSettingChange("notifications", "organizations", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Profile Visibility</h3>
              <p className="text-white/70 text-sm">Make your profile visible to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.profileVisible}
                onChange={(e) => handleSettingChange("privacy", "profileVisible", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Show Email Address</h3>
              <p className="text-white/70 text-sm">Display your email in your public profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => handleSettingChange("privacy", "showEmail", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Show Organizations</h3>
              <p className="text-white/70 text-sm">Display your organization memberships</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showOrganizations}
                onChange={(e) => handleSettingChange("privacy", "showOrganizations", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">Theme</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleSettingChange("appearance", "theme", "light")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  settings.appearance.theme === "light"
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => handleSettingChange("appearance", "theme", "dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  settings.appearance.theme === "dark"
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2">Language</h3>
            <select
              value={settings.appearance.language}
              onChange={(e) => handleSettingChange("appearance", "language", e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Two-Factor Authentication</h3>
              <p className="text-white/70 text-sm">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => handleSettingChange("security", "twoFactor", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
            </label>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2">Session Timeout</h3>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange("security", "sessionTimeout", e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
            >
              <option value="1h">1 Hour</option>
              <option value="8h">8 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>

            {showPasswordForm && (
              <form
                onSubmit={handlePasswordChange}
                className="mt-4 space-y-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Export Data</h3>
              <p className="text-white/70 text-sm">Download a copy of your account data</p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium text-red-200">Delete Account</h3>
              <p className="text-white/70 text-sm">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
