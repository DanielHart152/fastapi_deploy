"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Video, VideoOff, Mic, MicOff, Settings, Users, Clock, Calendar, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function JoinMeetingPage() {
  const [meetingId, setMeetingId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  // Mock meeting data for preview
  const meetingPreview = {
    title: "Weekly Team Sync",
    host: "Sarah Chen",
    participants: 8,
    scheduledTime: "10:00 AM",
    date: "January 15, 2024",
    status: "live",
  }

  const handleJoinMeeting = async () => {
    setIsJoining(true)
    // Simulate joining process
    setTimeout(() => {
      setIsJoining(false)
      // Redirect to meeting room
      console.log("Joining meeting:", {
        meetingId,
        displayName,
        video: isVideoEnabled,
        audio: isAudioEnabled,
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 floating-animation">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 fade-in-up stagger-1">
            Join Meeting
          </h1>
          <p className="text-gray-300 fade-in-up stagger-2">Enter your meeting details to join</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Join Form - Left Column */}
          <Card className="glass-card fade-in-left stagger-3">
            <CardHeader>
              <CardTitle className="text-white">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 fade-in-up stagger-4">
                <Label htmlFor="meetingId" className="text-white">
                  Meeting ID *
                </Label>
                <Input
                  id="meetingId"
                  placeholder="Enter meeting ID or link"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 input-smooth"
                />
              </div>

              <div className="space-y-2 fade-in-up stagger-5">
                <Label htmlFor="displayName" className="text-white">
                  Your Name *
                </Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 input-smooth"
                />
              </div>

              {/* Audio/Video Settings */}
              <div className="space-y-4 fade-in-up stagger-4">
                <h3 className="text-white font-medium">Join Settings</h3>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 glass-card">
                  <div className="flex items-center gap-3">
                    {isVideoEnabled ? (
                      <Video className="w-5 h-5 text-green-400" />
                    ) : (
                      <VideoOff className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <Label className="text-white">Camera</Label>
                      <p className="text-sm text-gray-400">
                        {isVideoEnabled ? "Camera will be on" : "Camera will be off"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isVideoEnabled} onCheckedChange={setIsVideoEnabled} className="switch-smooth" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 glass-card">
                  <div className="flex items-center gap-3">
                    {isAudioEnabled ? (
                      <Mic className="w-5 h-5 text-green-400" />
                    ) : (
                      <MicOff className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <Label className="text-white">Microphone</Label>
                      <p className="text-sm text-gray-400">
                        {isAudioEnabled ? "Microphone will be on" : "Microphone will be muted"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isAudioEnabled} onCheckedChange={setIsAudioEnabled} className="switch-smooth" />
                </div>
              </div>

              <Button
                onClick={handleJoinMeeting}
                disabled={!meetingId || !displayName || isJoining}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 glow-effect btn-smooth fade-in-up stagger-5"
              >
                {isJoining ? (
                  "Joining..."
                ) : (
                  <>
                    Join Meeting
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center fade-in-up stagger-5">
                <Button variant="ghost" className="text-gray-400 hover:text-white btn-smooth">
                  <Settings className="w-4 h-4 mr-2" />
                  Audio & Video Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Preview - Right Column */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card className="glass-card fade-in-right stagger-3">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isVideoEnabled ? (
                      <div className="text-center fade-in">
                        <Video className="w-12 h-12 text-white/80 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">Camera Preview</p>
                      </div>
                    ) : (
                      <div className="text-center fade-in">
                        <VideoOff className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">Camera Off</p>
                      </div>
                    )}
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <Button
                      size="sm"
                      variant={isVideoEnabled ? "default" : "destructive"}
                      className="rounded-full w-10 h-10 p-0 btn-smooth"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    >
                      {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isAudioEnabled ? "default" : "destructive"}
                      className="rounded-full w-10 h-10 p-0 btn-smooth"
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    >
                      {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Info */}
            {meetingId && (
              <Card className="glass-card fade-in-right stagger-4">
                <CardHeader>
                  <CardTitle className="text-white">Meeting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2 fade-in-up stagger-1">{meetingPreview.title}</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2 fade-in-up stagger-2">
                        <Users className="w-4 h-4" />
                        Hosted by {meetingPreview.host}
                      </div>
                      <div className="flex items-center gap-2 fade-in-up stagger-3">
                        <Calendar className="w-4 h-4" />
                        {meetingPreview.date}
                      </div>
                      <div className="flex items-center gap-2 fade-in-up stagger-4">
                        <Clock className="w-4 h-4" />
                        {meetingPreview.scheduledTime}
                      </div>
                      <div className="flex items-center gap-2 fade-in-up stagger-5">
                        <Users className="w-4 h-4" />
                        {meetingPreview.participants} participants
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 fade-in">
                    ● {meetingPreview.status.charAt(0).toUpperCase() + meetingPreview.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="glass-card fade-in-right stagger-5">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p className="fade-in-up stagger-1">• Test your audio and video before joining</p>
                <p className="fade-in-up stagger-2">• Use a stable internet connection</p>
                <p className="fade-in-up stagger-3">• Join from a quiet environment</p>
                <p className="fade-in-up stagger-4">• Have good lighting for video calls</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
