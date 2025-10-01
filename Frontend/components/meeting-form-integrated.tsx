"use client"

import { useState } from "react"
import { useIntegratedAuth } from "@/lib/integrated-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Lock } from "lucide-react"

interface MeetingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function MeetingFormIntegrated({ onSuccess, onCancel }: MeetingFormProps) {
  const { user, organizations, createMeeting, isLoading } = useIntegratedAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    mode: "video",
    isOrganizationMeeting: false,
    organizationId: "",
    participants: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const meetingId = await createMeeting(
        {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          mode: formData.mode,
          participants: formData.participants
        },
        formData.isOrganizationMeeting ? formData.organizationId : undefined
      )
      
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Create New Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Type Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {formData.isOrganizationMeeting ? (
                <Building2 className="w-5 h-5 text-blue-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <Label className="text-base font-medium">
                  {formData.isOrganizationMeeting ? "Organization Meeting" : "Private Meeting"}
                </Label>
                <p className="text-sm text-gray-600">
                  {formData.isOrganizationMeeting 
                    ? "Visible to organization members" 
                    : "Only visible to you and invited participants"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isOrganizationMeeting}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ 
                  ...prev, 
                  isOrganizationMeeting: checked,
                  organizationId: checked ? "" : ""
                }))
              }
              disabled={organizations.length === 0}
            />
          </div>

          {/* Organization Selection */}
          {formData.isOrganizationMeeting && (
            <div className="space-y-2">
              <Label htmlFor="organization">Select Organization</Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, organizationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic Meeting Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter meeting title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Meeting Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="audio">Audio Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Meeting description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Meeting"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}