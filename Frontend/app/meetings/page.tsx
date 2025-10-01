"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Video, Plus, Search, Calendar, Clock, Users, MoreVertical,
  Play, Download, FileText, Eye, Settings, Trash2, Edit
} from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  description?: string
  meeting_date: string
  meeting_time: string
  duration: number
  mode: string
  status: string
  participants: string[]
  creator_name: string
  created_at: string
}

export default function MeetingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    loadMeetings()
  }, [filterStatus, searchQuery])

  const loadMeetings = async () => {
    try {
      setIsTransitioning(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '20') // Limit to 20 meetings
      params.append('page', '1')   // First page only

      const response = await fetch(`/api/meetings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        console.log('Meetings from API:', data.meetings?.length || 0)
        // Add small delay for smooth transition
        setTimeout(() => {
          setMeetings(data.meetings || [])
          setIsTransitioning(false)
        }, 150)
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      setIsTransitioning(false)
    } finally {
      setLoading(false)
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadMeetings()
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="glass-card border-b border-white/10 sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  My Meetings
                </h1>
              </div>
              <Link href="/create-meeting">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  New Meeting
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'scheduled', 'live', 'completed', 'processing'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status 
                    ? "bg-purple-500 hover:bg-purple-600" 
                    : "glass-card border-white/20"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className={`space-y-4 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            {meetings.map((meeting, index) => {
              const { date, time } = formatDateTime(meeting.meeting_date, meeting.meeting_time)
              return (
                <Card 
                  key={meeting.id} 
                  className="glass-card hover:glow-effect transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link href={`/meeting/${meeting.id}`}>
                            <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer">
                              {meeting.title}
                            </h3>
                          </Link>
                          <Badge className={`${getStatusColor(meeting.status)} border`}>
                            {meeting.status === "live" && "● "}
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {meeting.mode}
                          </Badge>
                        </div>

                        {meeting.description && (
                          <p className="text-gray-300 text-sm mb-3">{meeting.description}</p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-300 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.participants.length} participants
                          </div>
                          <div className="text-purple-400">
                            {meeting.creator_name} • {meeting.duration}min
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {meeting.status === "live" && (
                            <Link href={`/meeting/${meeting.id}`}>
                              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                                <Play className="w-4 h-4 mr-1" />
                                Join Live
                              </Button>
                            </Link>
                          )}

                          {meeting.status === "scheduled" && (
                            <Link href={`/meeting/${meeting.id}`}>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Play className="w-4 h-4 mr-1" />
                                Start Meeting
                              </Button>
                            </Link>
                          )}

                          {(meeting.status === "completed" || meeting.status === "processing") && (
                            <Link href={`/meeting/${meeting.id}`}>
                              <Button size="sm" variant="outline" className="glass-card border-white/20 bg-transparent">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                          )}

                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="glass-card border-white/20 bg-transparent"
                            onClick={() => router.push(`/meeting/${meeting.id}?tab=transcript`)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Transcript
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="glass-card border-white/20 bg-transparent"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token')
                                const response = await fetch(`/api/meetings/${meeting.id}/export`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                                if (response.ok) {
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `${meeting.title}-export.pdf`
                                  a.click()
                                }
                              } catch (error) {
                                console.error('Export failed:', error)
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/20">
                          <DropdownMenuItem className="text-white hover:bg-white/10">
                            <Link href={`/meeting/${meeting.id}`} className="flex items-center w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-white/10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-white/10">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-500/20"
                            onClick={() => deleteMeeting(meeting.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Meeting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {meetings.length === 0 && !isTransitioning && (
            <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No meetings found</h3>
              <p className="text-gray-400 mb-4">
                {filterStatus === 'all' ? 'Create your first meeting to get started' : `No ${filterStatus} meetings found`}
              </p>
              <Link href="/create-meeting">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meeting
                </Button>
              </Link>
            </div>
          )}
          
          {isTransitioning && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading meetings...</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}