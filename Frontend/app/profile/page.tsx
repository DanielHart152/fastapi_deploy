"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoiceManagement } from "@/components/voice-management"
import { User, MapPin, Phone, Building, Briefcase, Camera, Save, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    company: '',
    organization: '',
    job_title: '',
    address: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        company: user.company || '',
        organization: user.organization || '',
        job_title: user.job_title || '',
        address: user.address || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.full_name,
          department: formData.organization,
          phone: formData.phone_number,
          bio: formData.address
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceprintSaved = async (voiceprintData: any) => {
    try {
      const response = await fetch('/api/profile/voice-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voicePrintData })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Voice print saved successfully!' })
      } else {
        throw new Error('Failed to save voice print')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save voice print' })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Complete your profile to enhance your meeting experience</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
                : 'bg-red-500/20 border border-red-500/30 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400 text-lg">
                        {formData.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" className="glass-card border-white/20 bg-transparent">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-gray-400 text-sm mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-white">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number" className="text-white">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone_number"
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className="pl-10 glass-card border-white/20 bg-white/5 text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_title" className="text-white">Job Title</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => handleInputChange('job_title', e.target.value)}
                          className="pl-10 glass-card border-white/20 bg-white/5 text-white"
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="pl-10 glass-card border-white/20 bg-white/5 text-white"
                          placeholder="Acme Corp"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="pl-10 glass-card border-white/20 bg-white/5 text-white resize-none"
                        placeholder="123 Main St, City, State, ZIP"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Voice Print Setup</CardTitle>
                <p className="text-gray-400 text-sm">
                  Set up your voice print for enhanced speaker identification in meetings
                </p>
              </CardHeader>
              <CardContent>
                <VoiceManagement onVoiceprintSaved={handleVoiceprintSaved} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}