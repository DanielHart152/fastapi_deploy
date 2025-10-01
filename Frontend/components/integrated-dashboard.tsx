"use client"

import { useState, useEffect } from "react"
import { useIntegratedAuth } from "@/lib/integrated-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Calendar, Clock, Plus, Settings } from "lucide-react"

export function IntegratedDashboard() {
  const { user, organizations, meetings, getMeetings } = useIntegratedAuth()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    getMeetings()
  }, [])

  const privateMeetings = meetings.filter(m => m.meeting_type === 'private')
  const organizationMeetings = meetings.filter(m => m.meeting_type === 'organization')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const MeetingCard = ({ meeting }: { meeting: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {meeting.meeting_type === 'organization' ? (
              <Building2 className="w-4 h-4 text-blue-500" />
            ) : (
              <Users className="w-4 h-4 text-gray-500" />
            )}
            <h3 className="font-semibold text-lg">{meeting.title}</h3>
          </div>
          <Badge className={getStatusColor(meeting.status)}>
            {meeting.status}
          </Badge>
        </div>
        
        {meeting.description && (
          <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(meeting.meeting_date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {meeting.meeting_time} ({meeting.duration}min)
          </div>
        </div>

        {meeting.organization_name && (
          <div className="flex items-center gap-1 text-sm text-blue-600 mb-3">
            <Building2 className="w-4 h-4" />
            {meeting.organization_name}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Created by {meeting.creator_name}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              View
            </Button>
            {meeting.created_by === user?.id && (
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Meeting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold">{meetings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Organizations</p>
                <p className="text-2xl font-bold">{organizations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">
                  {meetings.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {meetings.filter(m => m.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Meetings ({meetings.length})</TabsTrigger>
          <TabsTrigger value="private">Private ({privateMeetings.length})</TabsTrigger>
          <TabsTrigger value="organization">Organization ({organizationMeetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privateMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizationMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {meetings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
            <p className="text-gray-600 mb-4">Create your first meeting to get started</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}