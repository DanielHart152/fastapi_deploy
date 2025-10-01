"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Users, Plus } from "lucide-react"

export function OrganizationManager() {
  const { user, organizations, createOrganization, isLoading } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createOrganization(formData.name, formData.description)
      setFormData({ name: "", description: "" })
    } catch (error) {
      console.error('Failed to create organization:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Organizations</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Organization description"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(organizations || []).map((org) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-blue-500" />
                {org.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">{org.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  {org.members?.length || 0} members
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {user && org.members?.find(m => m.userId === user.id)?.role || 'member'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(organizations || []).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-gray-600">Create your first organization to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}