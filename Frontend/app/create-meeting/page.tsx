"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Video,
  Calendar,
  Clock,
  Users,
  Settings,
  Lock,
  Globe,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Youtube,
  Eye,
  Mic,
  Brain,
  FileText,
  Hash,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreateMeetingPage() {
  const router = useRouter()
  const [meetingMode, setMeetingMode] = useState<"real-time" | "pre-recorded" | "preview">("real-time")
  const [isCreating, setIsCreating] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")
  const [rapporteur, setRapporteur] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [onAgenda, setOnAgenda] = useState(true)
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [decisionNumber, setDecisionNumber] = useState("")
  const [adaCode, setAdaCode] = useState("")

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const [enableTranscription, setEnableTranscription] = useState(true)
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(true)
  const [enableAISummary, setEnableAISummary] = useState(true)
  const [enableTopicExtraction, setEnableTopicExtraction] = useState(true)

  const [isRecording, setIsRecording] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [waitingRoom, setWaitingRoom] = useState(true)
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipant, setNewParticipant] = useState("")

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()])
      setNewParticipant("")
    }
  }

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p !== email))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const handleCreateMeeting = async () => {
    setIsCreating(true)
    
    try {
      const token = localStorage.getItem('token')
      const meetingData = {
        title: meetingTitle,
        description: meetingDescription,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        duration: parseInt(duration),
        mode: meetingMode,
        participants: participants,
        settings: {
          rapporteur,
          onAgenda,
          keywords,
          decisionNumber,
          adaCode,
          aiFeatures: {
            transcription: enableTranscription,
            speakerDiarization: enableSpeakerDiarization,
            aiSummary: enableAISummary,
            topicExtraction: enableTopicExtraction,
          },
          isRecording,
          isPrivate,
          waitingRoom,
          uploadFile: uploadFile?.name,
          youtubeUrl
        },
        meeting_type: isPrivate ? 'private' : 'public',
        access_level: isPrivate ? 'creator_only' : 'public'
      }
      
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(meetingData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create meeting')
      }
      
      const result = await response.json()
      
      if (meetingMode === 'pre-recorded') {
        // Handle file upload and processing
        if (uploadFile) {
          // Upload file to backend
          const uploadFormData = new FormData()
          uploadFormData.append('file', uploadFile)
          
          const uploadResponse = await fetch(`/api/meetings/${result.meeting.id}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: uploadFormData
          })
          
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            throw new Error(uploadError.error || 'File upload failed')
          }
          
          const uploadResult = await uploadResponse.json()
          
          // Start processing
          const processResponse = await fetch(`/api/meetings/${result.meeting.id}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              file_path: uploadResult.file_path
            })
          })
          
          if (!processResponse.ok) {
            const processError = await processResponse.json()
            throw new Error(processError.error || 'Processing failed')
          }
        } else if (youtubeUrl) {
          // Start processing with YouTube URL
          const processResponse = await fetch(`/api/meetings/${result.meeting.id}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              youtube_url: youtubeUrl
            })
          })
          
          if (!processResponse.ok) {
            const processError = await processResponse.json()
            throw new Error(processError.error || 'Processing failed')
          }
        }
        
        // Go to meeting analysis page
        router.push(`/meeting/${result.meeting.id}?processing=true`)
      } else {
        // Go to live meeting room
        router.push(`/room/${result.meeting.id}`)
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert(`Failed to create meeting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create AI-Powered Meeting
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Mode */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Meeting Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={meetingMode} onValueChange={(value) => setMeetingMode(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 glass-card bg-white/5">
                      <TabsTrigger value="real-time" className="data-[state=active]:bg-purple-500/30">
                        <Video className="w-4 h-4 mr-2" />
                        Real-time
                      </TabsTrigger>
                      <TabsTrigger value="pre-recorded" className="data-[state=active]:bg-purple-500/30">
                        <Upload className="w-4 h-4 mr-2" />
                        Pre-recorded
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-purple-500/30">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="real-time" className="mt-4">
                      <p className="text-gray-300 text-sm">
                        Create a live meeting with real-time AI transcription and analysis.
                      </p>
                    </TabsContent>

                    <TabsContent value="pre-recorded" className="mt-4 space-y-4">
                      <p className="text-gray-300 text-sm">
                        Upload a meeting recording or provide a YouTube URL for AI analysis.
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Upload Recording</Label>
                          <Input
                            type="file"
                            accept="video/*,audio/*"
                            onChange={handleFileUpload}
                            className="glass-card border-white/20 bg-white/5 text-white file:bg-purple-500/20 file:text-purple-300 file:border-0"
                          />
                          {uploadFile && <p className="text-sm text-green-400">Selected: {uploadFile.name}</p>}
                        </div>

                        <div className="text-center text-gray-400">or</div>

                        <div className="space-y-2">
                          <Label className="text-white">YouTube URL</Label>
                          <div className="flex gap-2">
                            <Youtube className="w-5 h-5 text-red-500 mt-2.5" />
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                      <p className="text-gray-300 text-sm">
                        Create a preview-only meeting for demonstration or review purposes.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Meeting Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Meeting Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter meeting title"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rapporteur" className="text-white">
                      Rapporteur *
                    </Label>
                    <Input
                      id="rapporteur"
                      placeholder="Person responsible for the meeting"
                      value={rapporteur}
                      onChange={(e) => setRapporteur(e.target.value)}
                      className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add meeting description or agenda"
                      value={meetingDescription}
                      onChange={(e) => setMeetingDescription(e.target.value)}
                      className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-white">
                        Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-white">
                        Time *
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white">
                        Duration
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20 bg-slate-800">
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Agenda Status</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch checked={onAgenda} onCheckedChange={setOnAgenda} />
                        <span className="text-white text-sm">{onAgenda ? "On the agenda" : "Off the agenda"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                        className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                      />
                      <Button
                        onClick={addKeyword}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      >
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>

                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30 pr-1"
                          >
                            #{keyword}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                              onClick={() => removeKeyword(keyword)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="decision-number" className="text-white">
                        Decision Number
                      </Label>
                      <Input
                        id="decision-number"
                        placeholder="e.g., DEC-2024-001"
                        value={decisionNumber}
                        onChange={(e) => setDecisionNumber(e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ada-code" className="text-white">
                        ADA Code
                      </Label>
                      <Input
                        id="ada-code"
                        placeholder="e.g., ADA-2024-15"
                        value={adaCode}
                        onChange={(e) => setAdaCode(e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI-Powered Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Real-time Transcription
                      </Label>
                      <p className="text-sm text-gray-400">Convert speech to text in real-time</p>
                    </div>
                    <Switch checked={enableTranscription} onCheckedChange={setEnableTranscription} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Speaker Diarization</Label>
                      <p className="text-sm text-gray-400">Identify and separate different speakers</p>
                    </div>
                    <Switch checked={enableSpeakerDiarization} onCheckedChange={setEnableSpeakerDiarization} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">AI Summary Generation</Label>
                      <p className="text-sm text-gray-400">Automatically generate meeting summaries</p>
                    </div>
                    <Switch checked={enableAISummary} onCheckedChange={setEnableAISummary} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Topic Extraction</Label>
                      <p className="text-sm text-gray-400">Extract and categorize discussion topics</p>
                    </div>
                    <Switch checked={enableTopicExtraction} onCheckedChange={setEnableTopicExtraction} />
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                      className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={addParticipant}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {participants.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-white">Invited Participants ({participants.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {participants.map((email) => (
                          <Badge
                            key={email}
                            variant="outline"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
                          >
                            {email}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                              onClick={() => removeParticipant(email)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Settings */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Meeting Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Enable Recording</Label>
                      <p className="text-sm text-gray-400">Automatically record this meeting</p>
                    </div>
                    <Switch checked={isRecording} onCheckedChange={setIsRecording} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Private Meeting</Label>
                      <p className="text-sm text-gray-400">Only invited participants can join</p>
                    </div>
                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Waiting Room</Label>
                      <p className="text-sm text-gray-400">Host must admit participants</p>
                    </div>
                    <Switch checked={waitingRoom} onCheckedChange={setWaitingRoom} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview - Right Column */}
            <div className="space-y-6">
              {/* Meeting Preview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Meeting Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center relative">
                    {meetingMode === "real-time" && <Video className="w-12 h-12 text-white/60" />}
                    {meetingMode === "pre-recorded" && <Upload className="w-12 h-12 text-white/60" />}
                    {meetingMode === "preview" && <Eye className="w-12 h-12 text-white/60" />}

                    <Badge className="absolute top-2 right-2 bg-purple-500/30 text-purple-300 border-purple-500/50">
                      {meetingMode.charAt(0).toUpperCase() + meetingMode.slice(1).replace("-", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-white">{meetingTitle || "Untitled Meeting"}</h3>
                      {meetingDescription && <p className="text-sm text-gray-300 mt-1">{meetingDescription}</p>}
                      {rapporteur && <p className="text-sm text-purple-300 mt-1">Rapporteur: {rapporteur}</p>}
                    </div>

                    <div className="space-y-2 text-sm">
                      {meetingDate && meetingTime && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          {new Date(`${meetingDate}T${meetingTime}`).toLocaleDateString()} at{" "}
                          {new Date(`${meetingDate}T${meetingTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        {duration} minutes
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4" />
                        {participants.length} participants
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {isPrivate ? "Private" : "Public"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {isRecording && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Recording</Badge>
                      )}
                      {waitingRoom && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Waiting Room</Badge>
                      )}
                      <Badge
                        className={`text-xs ${onAgenda ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"}`}
                      >
                        {onAgenda ? "On Agenda" : "Off Agenda"}
                      </Badge>
                      {enableTranscription && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          AI Transcription
                        </Badge>
                      )}
                      {enableAISummary && (
                        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs">AI Summary</Badge>
                      )}
                    </div>

                    {keywords.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-white text-xs">Keywords:</Label>
                        <div className="flex flex-wrap gap-1">
                          {keywords.slice(0, 3).map((keyword) => (
                            <Badge key={keyword} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              #{keyword}
                            </Badge>
                          ))}
                          {keywords.length > 3 && (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                              +{keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCreateMeeting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 glow-effect"
                  disabled={!meetingTitle || !meetingDate || !meetingTime || !rapporteur || isCreating}
                >
                  {isCreating ? 'Creating Meeting...' : 'Create AI Meeting'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full glass-card border-white/20 bg-transparent hover:bg-white/10"
                  onClick={() => {
                    // Save as draft functionality
                    const draftData = {
                      mode: meetingMode,
                      title: meetingTitle,
                      description: meetingDescription,
                      rapporteur,
                      date: meetingDate,
                      time: meetingTime,
                      duration,
                      onAgenda,
                      keywords,
                      decisionNumber,
                      adaCode,
                      participants,
                      isRecording,
                      isPrivate,
                      waitingRoom,
                      aiFeatures: {
                        transcription: enableTranscription,
                        speakerDiarization: enableSpeakerDiarization,
                        aiSummary: enableAISummary,
                        topicExtraction: enableTopicExtraction,
                      },
                      savedAt: new Date().toISOString(),
                      isDraft: true
                    }
                    localStorage.setItem('meetingDraft', JSON.stringify(draftData))
                    alert('Meeting saved as draft!')
                  }}
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
