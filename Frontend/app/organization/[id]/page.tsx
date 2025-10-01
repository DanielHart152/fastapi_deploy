"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMeetings } from "@/lib/meeting-context"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Users,
  Calendar,
  Bell,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Crown,
  Shield,
  User,
  Clock,
  MapPin,
  Video,
  Phone,
  Play,
  FileText,
  Download,
  Eye,
} from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "member"
  joinedAt: string
  lastActive: string
  avatar?: string
}

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: "video" | "audio" | "in-person"
  location?: string
  organizer: string
  participants: string[]
  status: "upcoming" | "ongoing" | "completed"
}

interface Notification {
  id: string
  title: string
  message: string
  type: "announcement" | "meeting" | "member" | "system"
  priority: "high" | "medium" | "low"
  createdAt: string
  createdBy: string
  read: boolean
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null)
  const [showMeetingMenu, setShowMeetingMenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    mode: "video",
  })
  const [organization, setOrganization] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [orgMeetings, setOrgMeetings] = useState<any[]>([])

  const { user, isLoading } = useAuth()
  const { meetings, createMeeting, joinMeeting } = useMeetings()
  const router = useRouter()
  const params = useParams()
  const orgId = params.id as string

  useEffect(() => {
    if (orgId) {
      loadOrganizationData()
    }
  }, [orgId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMeetingMenu || showRoleMenu) {
        setShowMeetingMenu(null)
        setShowRoleMenu(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMeetingMenu, showRoleMenu])

  const loadOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch organization details
      const orgResponse = await fetch(`/api/organizations/${orgId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
        setMembers(orgData.organization.members || [])
      }
      
      // Fetch organization meetings
      const meetingsResponse = await fetch(`/api/meetings?organization_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setOrgMeetings(meetingsData.meetings || [])
      }
    } catch (error) {
      console.error('Failed to load organization data:', error)
    }
  }





  const notifications: Notification[] = [
    {
      id: "1",
      title: "New Team Member",
      message: "Emily Davis has joined the organization",
      type: "member",
      priority: "medium",
      createdAt: "2024-12-20T10:30:00Z",
      createdBy: "John Smith",
      read: false,
    },
    {
      id: "2",
      title: "Meeting Reminder",
      message: "Weekly Team Standup starts in 1 hour",
      type: "meeting",
      priority: "high",
      createdAt: "2024-12-20T08:00:00Z",
      createdBy: "System",
      read: true,
    },
  ]

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
          style={{ backgroundImage: "url(/images/gradient-background.jpg)" }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "members", label: "Members", icon: Users },
    { id: "meetings", label: "Meetings", icon: Calendar },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />
      case "manager":
        return <Shield className="w-4 h-4 text-blue-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "manager":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "ongoing":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{members.length}</p>
              <p className="text-white/70 text-sm">Total Members</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{orgMeetings.length}</p>
              <p className="text-white/70 text-sm">Total Meetings</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-white/70 text-sm">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-2xl font-bold text-white">{notifications.filter((n) => !n.read).length}</p>
              <p className="text-white/70 text-sm">Unread Notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
              <Bell className="w-5 h-5 text-white/70" />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{notification.title}</p>
                <p className="text-white/70 text-xs">{notification.message}</p>
              </div>
              <span className="text-white/50 text-xs">{new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Upcoming Meetings</h3>
          <button 
            onClick={() => setActiveTab('meetings')}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {orgMeetings
            .filter((m) => m.status === "scheduled")
            .slice(0, 3)
            .map((meeting) => (
              <div key={meeting.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm truncate">{meeting.title}</h4>
                    <span className={`px-2 py-1 rounded-md text-xs border flex-shrink-0 ml-2 ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mb-2 line-clamp-2">{meeting.description}</p>
                  <div className="flex items-center gap-4 text-white/50 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meeting.meeting_time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {(typeof meeting.participants === 'string' ? 
                        (meeting.participants.startsWith('[') ? JSON.parse(meeting.participants || '[]') : [meeting.participants]) : 
                        meeting.participants || []).length} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {meeting.duration}min
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/room/${meeting.id}`)}
                  className="px-3 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 text-xs transition-all duration-300 flex-shrink-0"
                >
                  Join
                </button>
              </div>
            ))}
          {orgMeetings.filter((m) => m.status === "scheduled").length === 0 && (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-2" />
              <p className="text-white/70 text-sm">No upcoming meetings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMembers = () => (
    <div className="space-y-6">
      {/* Members Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Members</h2>
          <p className="text-white/70">Manage organization members and their roles</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{member.name}</h3>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-white/70 text-sm">{member.email}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-white/50 text-xs">Joined {member.joinedAt}</span>
                    <span className="text-white/50 text-xs">Active {member.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-xs border ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </span>
                <div className="relative">
                  <button 
                    onClick={() => setShowRoleMenu(showRoleMenu === member.id ? null : member.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showRoleMenu === member.id && (
                    <div className="absolute right-0 bottom-full mb-1 w-48 p-2 rounded-xl bg-black/70 backdrop-blur-xl border border-white/20 shadow-2xl z-[9999]">
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-white/70 text-xs font-medium border-b border-white/20">
                          Change Role
                        </div>
                        {["admin", "manager", "member"].map((role) => (
                          <button
                            key={role}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token')
                                const response = await fetch(`/api/organizations/${orgId}/members/${member.id}/role`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ role })
                                })
                                if (response.ok) {
                                  await loadOrganizationData()
                                  setShowRoleMenu(null)
                                }
                              } catch (error) {
                                console.error('Failed to update role:', error)
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/15 ${
                              member.role === role
                                ? "bg-white/10 text-white"
                                : "text-white/80 hover:text-white"
                            }`}
                          >
                            {getRoleIcon(role)}
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMeetings = () => {
    const filteredOrgMeetings = orgMeetings.filter((meeting) => {
      const matchesSearch = meeting.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "all" || meeting.status === filterStatus
      return matchesSearch && matchesFilter
    })

    const handleCreateMeeting = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user) return

      try {
        const startDate = new Date(newMeeting.startTime)
        const endDate = new Date(newMeeting.endTime)
        const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
        
        const token = localStorage.getItem('token')
        const response = await fetch('/api/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newMeeting.title,
            description: newMeeting.description,
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().split(' ')[0],
            duration: durationMinutes.toString(),
            mode: newMeeting.mode,
            participants: [user.email],
            settings: {
              organizerId: user.id,
              organizerName: user.name
            },
            organization_id: orgId
          })
        })
        
        if (response.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error('Failed to create meeting:', error)
      }
      
      setNewMeeting({ title: "", description: "", startTime: "", endTime: "", mode: "video" })
      setShowCreateForm(false)
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "live":
          return "bg-red-500/20 text-red-400 border-red-500/30"
        case "upcoming":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        case "completed":
          return "bg-green-500/20 text-green-400 border-green-500/30"
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }
    }

    const filteredMeetings = meetings.filter((meeting) => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "all" || meeting.status === filterStatus
      return matchesSearch && matchesFilter
    })

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Meetings</h2>
            <p className="text-white/70">Manage organization meetings</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold text-white">127</div>
            <p className="text-white/70 text-sm">Total Meetings</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold text-white">1,234</div>
            <p className="text-white/70 text-sm">Active Participants</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold text-white">89.5</div>
            <p className="text-white/70 text-sm">Meeting Hours</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold text-white">45</div>
            <p className="text-white/70 text-sm">Recordings</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div className="flex gap-2">
            {["all", "live", "upcoming", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showCreateForm && (
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Meeting Mode</label>
                <select
                  value={newMeeting.mode}
                  onChange={(e) => setNewMeeting({ ...newMeeting, mode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Only</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 transition-all duration-300"
                >
                  <Calendar className="w-4 h-4" />
                  Create Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {filteredOrgMeetings.map((meeting) => (
            <div key={meeting.id} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer">
                      {meeting.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(meeting.status)}`}>
                      {meeting.status === "live" && "● "}
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-white/70 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {meeting.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {Array.isArray(meeting.participants) ? meeting.participants.length : meeting.participants} participants
                    </div>
                    <div className="text-purple-400">
                      {meeting.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.status === "scheduled" && (
                      <button 
                        onClick={() => router.push(`/room/${meeting.id}`)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-200 border border-green-500/30 text-sm"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </button>
                    )}
                    {meeting.status === "ongoing" && (
                      <button 
                        onClick={() => router.push(`/room/${meeting.id}`)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Join Live
                      </button>
                    )}
                    {meeting.hasRecording && (
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-white border border-white/20 text-sm">
                        <Play className="w-4 h-4" />
                        Watch Recording
                      </button>
                    )}
                    {meeting.hasTranscript && (
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-white border border-white/20 text-sm">
                        <FileText className="w-4 h-4" />
                        View Transcript
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMeetingMenu(showMeetingMenu === meeting.id ? null : meeting.id)
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMeetingMenu === meeting.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 bottom-full mb-1 w-48 p-2 rounded-xl bg-black/70 backdrop-blur-xl border border-white/20 shadow-2xl z-[9999]"
                    >
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            router.push(`/room/${meeting.id}`)
                            setShowMeetingMenu(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/15 text-white/80 hover:text-white"
                        >
                          <Video className="w-4 h-4" />
                          Join Meeting
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/room/${meeting.id}`)
                            setShowMeetingMenu(null)
                            alert('Meeting link copied!')
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/15 text-white/80 hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                          Copy Link
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this meeting?')) {
                              try {
                                const token = localStorage.getItem('token')
                                await fetch(`/api/meetings/${meeting.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                                await loadOrganizationData()
                                setShowMeetingMenu(null)
                              } catch (error) {
                                console.error('Failed to delete meeting:', error)
                              }
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                          <FileText className="w-4 h-4" />
                          Delete Meeting
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrgMeetings.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No meetings found</h3>
            <p className="text-white/70">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    )
  }

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Notifications Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-white/70">Manage organization announcements and updates</p>
        </div>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Post Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
              notification.read ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-medium">{notification.title}</h3>
                  <span className={`px-2 py-1 rounded-md text-xs border ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                  {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <p className="text-white/70 text-sm mb-3">{notification.message}</p>
                <div className="flex items-center gap-4 text-white/50 text-xs">
                  <span>By {notification.createdBy}</span>
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  <span className="capitalize">{notification.type}</span>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Organization Settings</h2>
        <p className="text-white/70">Manage organization preferences and configuration</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Organization Name</label>
              <input
                type="text"
                defaultValue={organization.name}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
              <textarea
                defaultValue={organization.description}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Member Permissions */}
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Member Permissions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Allow members to create meetings</p>
                <p className="text-white/70 text-sm">Members can schedule their own meetings</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded bg-white/10 border border-white/20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Allow members to invite others</p>
                <p className="text-white/70 text-sm">Members can send invitations to join</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded bg-white/10 border border-white/20" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/20">
          <h3 className="text-lg font-medium text-white mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white transition-all duration-300">
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "members":
        return renderMembers()
      case "meetings":
        return renderMeetings()
      case "notifications":
        return renderNotifications()
      case "settings":
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 fade-in">
            <button
              onClick={() => router.push("/dashboard_v0")}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{organization?.name || 'Loading...'}</h1>
              <p className="text-white/70">{organization?.description || ''}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="fade-in-up stagger-4">{renderContent()}</div>
        </div>
      </div>

      {/* Modals would go here - simplified for brevity */}
    </div>
  )
}
