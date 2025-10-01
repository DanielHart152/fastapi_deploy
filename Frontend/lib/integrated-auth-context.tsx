"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { query } from "./db"

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company?: string
  organization?: string
  avatar_url?: string
  orgMemberships: OrgMembership[]
}

export interface OrgMembership {
  orgId: string
  orgName: string
  role: "admin" | "manager" | "member"
  joinedAt: string
}

export interface Organization {
  id: string
  name: string
  description: string
  admin_id: string
  created_at: string
  members: OrgMember[]
}

export interface OrgMember {
  userId: string
  name: string
  email: string
  role: "admin" | "manager" | "member"
  joinedAt: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  meeting_date: string
  meeting_time: string
  duration: number
  mode: string
  status: string
  meeting_type: "private" | "organization"
  organization_id?: string
  organization_name?: string
  created_by: string
  creator_name: string
  participants: string[]
  created_at: string
}

interface AuthContextType {
  user: User | null
  organizations: Organization[]
  meetings: Meeting[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  createOrganization: (name: string, description: string) => Promise<string>
  joinOrganization: (orgId: string) => Promise<boolean>
  updateUserRole: (orgId: string, userId: string, role: "admin" | "manager" | "member") => Promise<boolean>
  createMeeting: (meetingData: any, organizationId?: string) => Promise<string>
  getMeetings: (organizationId?: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function IntegratedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token and load user data
      loadUserData(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        await loadOrganizations(token)
        await getMeetings()
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrganizations = async (token: string) => {
    try {
      const response = await fetch('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.token)
        setUser(data.user)
        await loadOrganizations(data.token)
        await getMeetings()
        return true
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setOrganizations([])
    setMeetings([])
    localStorage.removeItem("token")
  }

  const createOrganization = async (name: string, description: string): Promise<string> => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    })

    if (response.ok) {
      const data = await response.json()
      await loadOrganizations(token)
      return data.organization.id
    }
    throw new Error("Failed to create organization")
  }

  const joinOrganization = async (orgId: string): Promise<boolean> => {
    const token = localStorage.getItem("token")
    if (!token) return false

    const response = await fetch(`/api/organizations/${orgId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      await loadOrganizations(token)
      return true
    }
    return false
  }

  const updateUserRole = async (orgId: string, userId: string, role: "admin" | "manager" | "member"): Promise<boolean> => {
    const token = localStorage.getItem("token")
    if (!token) return false

    const response = await fetch(`/api/organizations/${orgId}/members/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    })

    if (response.ok) {
      await loadOrganizations(token)
      return true
    }
    return false
  }

  const createMeeting = async (meetingData: any, organizationId?: string): Promise<string> => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Not authenticated")

    const payload = {
      ...meetingData,
      meeting_type: organizationId ? 'organization' : 'private',
      organization_id: organizationId
    }

    const response = await fetch('/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      const data = await response.json()
      await getMeetings()
      return data.meeting.id
    }
    throw new Error("Failed to create meeting")
  }

  const getMeetings = async (organizationId?: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    const url = organizationId 
      ? `/api/meetings?organization_id=${organizationId}`
      : '/api/meetings'

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      const data = await response.json()
      setMeetings(data.meetings)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        meetings,
        login,
        logout,
        createOrganization,
        joinOrganization,
        updateUserRole,
        createMeeting,
        getMeetings,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useIntegratedAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useIntegratedAuth must be used within an IntegratedAuthProvider")
  }
  return context
}