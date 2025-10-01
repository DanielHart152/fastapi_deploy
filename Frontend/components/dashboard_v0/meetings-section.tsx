"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMeetings } from "@/lib/meeting-context"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Video,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Edit,
  Trash2,
  Mic,
  MapPin,
} from "lucide-react"

export function MeetingsSection() {
  const { user, organizations } = useAuth()
  const { meetings, createMeeting, deleteMeeting, joinMeeting, updateParticipantStatus } = useMeetings()
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "past">("all")

  // Form state
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    type: "personal" as "personal" | "organization",
    orgId: "",
    mode: "video" as "video" | "audio" | "in-person",
    participants: [] as string[],
    settings: {} as any
  })

  const userMeetings = meetings.filter(
    (meeting) => {
      if (meeting.organizerId === user?.id) return true
      if (meeting.orgId && user?.orgMemberships.some((org) => org.orgId === meeting.orgId)) return true
      
      // Handle participants - could be array or JSON string
      const participants = Array.isArray(meeting.participants) 
        ? meeting.participants 
        : typeof meeting.participants === 'string' 
          ? JSON.parse(meeting.participants || '[]')
          : []
      
      return participants.some((p: any) => 
        typeof p === 'string' ? p === user?.email : p.userId === user?.id
      )
    }
  )

  const filteredMeetings = userMeetings.filter((meeting) => {
    const now = new Date()
    const startTime = new Date(meeting.startTime)
    const endTime = new Date(meeting.endTime)

    switch (filter) {
      case "today":
        return startTime.toDateString() === now.toDateString()
      case "upcoming":
        return startTime > now
      case "past":
        return endTime < now
      default:
        return true
    }
  })

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const startDate = new Date(newMeeting.startTime)
    const endDate = new Date(newMeeting.endTime)
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
    
    try {
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
          meeting_date: startDate.toISOString().split('T')[0],
          meeting_time: startDate.toTimeString().split(' ')[0],
          duration: durationMinutes,
          mode: newMeeting.mode,
          participants: JSON.stringify([user.email, ...newMeeting.participants]),
          settings: JSON.stringify({
            organizerId: user.id,
            organizerName: user.name,
            meetingLink: `https://meet.example.com/${newMeeting.title.toLowerCase().replace(/\s+/g, "-")}`,
            ...newMeeting.settings
          }),
          organization_id: newMeeting.type === "organization" ? newMeeting.orgId : null,
          meeting_type: newMeeting.type === "organization" ? 'organization' : 'private',
          access_level: 'creator_only'
        })
      })
      
      if (response.ok) {
        setNewMeeting({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          type: "personal",
          orgId: "",
          mode: "video",
          participants: [],
          settings: {}
        })
        setShowCreateForm(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "ongoing":
        return <Play className="w-4 h-4 text-green-400" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-gray-400" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-200 border-blue-500/30"
      case "ongoing":
        return "bg-green-500/20 text-green-200 border-green-500/30"
      case "completed":
        return "bg-gray-500/20 text-gray-200 border-gray-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-200 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Meetings</h1>
          <p className="text-white/70">Manage your personal and organization meetings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "today", "upcoming", "past"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              filter === filterOption
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15 hover:text-white"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Schedule New Meeting</h2>
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Enter meeting title"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Meeting Type</label>
                <select
                  value={newMeeting.type}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, type: e.target.value as "personal" | "organization" })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                >
                  <option value="personal">Personal Meeting</option>
                  <option value="organization">Organization Meeting</option>
                </select>
              </div>
            </div>

            {newMeeting.type === "organization" && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Organization</label>
                <select
                  value={newMeeting.orgId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, orgId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                >
                  <option value="">Select Organization</option>
                  {user?.orgMemberships.map((org) => (
                    <option key={org.orgId} value={org.orgId}>
                      {org.orgName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Meeting description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={newMeeting.startTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={newMeeting.endTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Meeting Mode</label>
              <select
                value={newMeeting.mode}
                onChange={(e) => setNewMeeting({ ...newMeeting, mode: e.target.value as "video" | "audio" | "in-person" })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
              >
                <option value="video">Video Call</option>
                <option value="audio">Audio Only</option>
                <option value="in-person">In Person</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
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

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => {
            const isSelected = selectedMeeting === meeting.id
            const isOrganizer = meeting.created_by === user?.id
            const orgInfo = meeting.org_id ? organizations.find(org => org.id === meeting.org_id) : null

            return (
              <div
                key={meeting.id}
                className={`p-6 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  isSelected ? "bg-white/20 border-white/30" : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
                onClick={() => setSelectedMeeting(isSelected ? null : meeting.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{meeting.title}</h3>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(meeting.status)}`}
                      >
                        {getStatusIcon(meeting.status)}
                        {meeting.status}
                      </div>
                      {orgInfo && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30">
                          <Building2 className="w-3 h-3" />
                          {orgInfo.name}
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-3">{meeting.description}</p>
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.meeting_time} ({meeting.duration}min)
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(typeof meeting.participants === 'string' ? JSON.parse(meeting.participants || '[]') : meeting.participants || []).length} participants
                      </div>
                      <div className="flex items-center gap-1">
                        {meeting.mode === 'video' ? <Video className="w-4 h-4" /> : 
                         meeting.mode === 'audio' ? <Mic className="w-4 h-4" /> : 
                         <User className="w-4 h-4" />}
                        {meeting.mode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.status === "scheduled" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/room/${meeting.id}`)
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 transition-all duration-300"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </button>
                    )}
                    {isOrganizer && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('Delete this meeting?')) {
                              try {
                                const token = localStorage.getItem('token')
                                await fetch(`/api/meetings/${meeting.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                                window.location.reload()
                              } catch (error) {
                                console.error('Failed to delete meeting:', error)
                              }
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-center">
          <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Meetings Found</h3>
          <p className="text-white/70 mb-6">
            {filter === "all"
              ? "You don't have any meetings scheduled yet."
              : `No meetings found for ${filter} filter.`}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mx-auto"
          >
            <Plus className="w-5 h-5" />
            Schedule Your First Meeting
          </button>
        </div>
      )}
    </div>
  )
}