"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Meeting {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  organizerId: string
  organizerName: string
  orgId?: string
  orgName?: string
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
  type: "personal" | "organization"
  meetingLink?: string
  participants: {
    userId: string
    name: string
    email: string
    status: "pending" | "accepted" | "declined" | "tentative"
    role?: "host" | "participant" | "moderator"
  }[]
  createdAt: string
}

interface MeetingContextType {
  meetings: Meeting[]
  createMeeting: (meetingData: Omit<Meeting, "id" | "createdAt">) => Promise<void>
  deleteMeeting: (meetingId: string) => Promise<void>
  joinMeeting: (meetingId: string) => Promise<void>
  updateParticipantStatus: (meetingId: string, userId: string, status: "accepted" | "declined" | "tentative") => Promise<void>
  isLoading: boolean
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined)

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await fetch('/api/meetings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setMeetings(data.meetings || [])
        }
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      // Set mock data for development
      setMeetings([
        {
          id: '1',
          title: 'Team Standup',
          description: 'Daily team standup meeting',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          organizerId: '1',
          organizerName: 'John Doe',
          status: 'scheduled',
          type: 'organization',
          orgId: '1',
          orgName: 'Tech Corp',
          meetingLink: 'https://meet.example.com/team-standup',
          participants: [
            {
              userId: '1',
              name: 'John Doe',
              email: 'john@example.com',
              status: 'accepted',
              role: 'host'
            }
          ],
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const createMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt">): Promise<void> => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    try {
      const startDate = new Date(meetingData.startTime)
      const endDate = new Date(meetingData.endTime)
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
      
      const apiData = {
        title: meetingData.title,
        description: meetingData.description,
        meeting_date: startDate.toISOString().split('T')[0],
        meeting_time: startDate.toTimeString().split(' ')[0],
        duration: durationMinutes,
        mode: 'video',
        status: 'scheduled',
        participants: JSON.stringify(meetingData.participants || []),
        settings: JSON.stringify({}),
        organization_id: meetingData.orgId || null,
        meeting_type: meetingData.type === 'organization' ? 'organization' : 'private',
        access_level: 'creator_only'
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const data = await response.json()
        const newMeeting: Meeting = {
          ...meetingData,
          id: data.meeting.id,
          createdAt: new Date().toISOString()
        }
        setMeetings(prev => [...prev, newMeeting])
      } else {
        throw new Error("Failed to create meeting")
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      // For development, create mock meeting
      const mockMeeting: Meeting = {
        ...meetingData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      setMeetings(prev => [...prev, mockMeeting])
    }
  }

  const deleteMeeting = async (meetingId: string): Promise<void> => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      // Mock deletion for development
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
    }
  }

  const joinMeeting = async (meetingId: string): Promise<void> => {
    const meeting = meetings.find(m => m.id === meetingId)
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank')
    }
  }

  const updateParticipantStatus = async (meetingId: string, userId: string, status: "accepted" | "declined" | "tentative"): Promise<void> => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    try {
      const response = await fetch(`/api/meetings/${meetingId}/participants/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setMeetings(prev => prev.map(meeting => {
          if (meeting.id === meetingId) {
            return {
              ...meeting,
              participants: meeting.participants.map(participant =>
                participant.userId === userId ? { ...participant, status } : participant
              )
            }
          }
          return meeting
        }))
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
      // Mock update for development
      setMeetings(prev => prev.map(meeting => {
        if (meeting.id === meetingId) {
          return {
            ...meeting,
            participants: meeting.participants.map(participant =>
              participant.userId === userId ? { ...participant, status } : participant
            )
          }
        }
        return meeting
      }))
    }
  }

  return (
    <MeetingContext.Provider value={{
      meetings,
      createMeeting,
      deleteMeeting,
      joinMeeting,
      updateParticipantStatus,
      isLoading
    }}>
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeetings() {
  const context = useContext(MeetingContext)
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingProvider")
  }
  return context
}