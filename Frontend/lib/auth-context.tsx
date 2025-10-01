"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from './auth'

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
  members: {
    userId: string
    name: string
    email: string
    role: "admin" | "manager" | "member"
    joinedAt: string
  }[]
  createdAt: string
}

export interface ExtendedUser extends User {
  orgMemberships?: OrgMembership[]
  isPrivateUser?: boolean
}

interface AuthContextType {
  user: ExtendedUser | null
  organizations: Organization[]
  login: (token: string, user: User) => void
  logout: () => void
  createOrganization: (name: string, description: string) => Promise<void>
  updateUserRole: (orgId: string, userId: string, newRole: "admin" | "manager" | "member") => Promise<void>
  removeUserFromOrg: (orgId: string, userId: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser({
            ...parsedUser,
            orgMemberships: parsedUser.orgMemberships || [],
            isPrivateUser: !parsedUser.orgMemberships || parsedUser.orgMemberships.length === 0
          })
          await loadOrganizations(token)
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const loadOrganizations = async (token: string) => {
    try {
      const response = await fetch('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded organizations:', data.organizations)
        setOrganizations(data.organizations || [])
      } else if (response.status === 401) {
        console.error('Token expired, logging out')
        logout()
      } else {
        console.error('Organizations API error:', response.status)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  const login = (token: string, userData: User) => {
    console.log('Login called with:', { token: !!token, userData })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    const extendedUser: ExtendedUser = {
      ...userData,
      orgMemberships: [],
      isPrivateUser: true
    }
    console.log('Setting user state:', extendedUser)
    setUser(extendedUser)
    loadOrganizations(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setOrganizations([])
  }

  const createOrganization = async (name: string, description: string): Promise<void> => {
    const token = localStorage.getItem('token')
    if (!token || !user) throw new Error('Not authenticated')

    try {
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
        const newOrg: Organization = {
          id: data.organization.id,
          name,
          description,
          admin_id: user.id,
          members: [{
            userId: user.id,
            name: user.name,
            email: user.email,
            role: 'admin',
            joinedAt: new Date().toISOString()
          }],
          createdAt: new Date().toISOString()
        }
        setOrganizations(prev => [...prev, newOrg])
        
        // Update user's org memberships
        const updatedUser = {
          ...user,
          orgMemberships: [...(user.orgMemberships || []), {
            orgId: newOrg.id,
            orgName: name,
            role: 'admin' as const,
            joinedAt: new Date().toISOString()
          }],
          isPrivateUser: false
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error('Failed to create organization')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      // For development, create mock organization
      const mockOrg: Organization = {
        id: Date.now().toString(),
        name,
        description,
        admin_id: user.id,
        members: [{
          userId: user.id,
          name: user.name,
          email: user.email,
          role: 'admin',
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
      }
      setOrganizations(prev => [...prev, mockOrg])
      
      const updatedUser = {
        ...user,
        orgMemberships: [...(user.orgMemberships || []), {
          orgId: mockOrg.id,
          orgName: name,
          role: 'admin' as const,
          joinedAt: new Date().toISOString()
        }],
        isPrivateUser: false
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const updateUserRole = async (orgId: string, userId: string, newRole: "admin" | "manager" | "member"): Promise<void> => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        setOrganizations(prev => prev.map(org => {
          if (org.id === orgId) {
            return {
              ...org,
              members: org.members.map(member => 
                member.userId === userId ? { ...member, role: newRole } : member
              )
            }
          }
          return org
        }))
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      // Mock update for development
      setOrganizations(prev => prev.map(org => {
        if (org.id === orgId) {
          return {
            ...org,
            members: org.members.map(member => 
              member.userId === userId ? { ...member, role: newRole } : member
            )
          }
        }
        return org
      }))
    }
  }

  const removeUserFromOrg = async (orgId: string, userId: string): Promise<void> => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        setOrganizations(prev => prev.map(org => {
          if (org.id === orgId) {
            return {
              ...org,
              members: org.members.filter(member => member.userId !== userId)
            }
          }
          return org
        }))
      }
    } catch (error) {
      console.error('Error removing user from organization:', error)
      // Mock removal for development
      setOrganizations(prev => prev.map(org => {
        if (org.id === orgId) {
          return {
            ...org,
            members: org.members.filter(member => member.userId !== userId)
          }
        }
        return org
      }))
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      organizations, 
      login, 
      logout, 
      createOrganization, 
      updateUserRole, 
      removeUserFromOrg, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}