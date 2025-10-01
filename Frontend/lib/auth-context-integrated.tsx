"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  full_name: string
  role: string
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
  member_count: number
  role: string
}

interface AuthContextType {
  user: User | null
  organizations: Organization[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  createOrganization: (name: string, description: string) => Promise<string>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      loadUserData(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUserData = async (token: string) => {
    try {
      const userResponse = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        await loadOrganizations(token)
      }
    } catch (error) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        login,
        logout,
        createOrganization,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}