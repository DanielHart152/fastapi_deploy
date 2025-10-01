"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  Users,
  MessageSquare,
  Share2,
  MoreVertical,
  Volume2,
  VolumeX,
  Monitor,
  Hand,
  Copy,
  Clock,
  Brain,
  FileText,
  Download
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"


export default function MeetingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [meetingData, setMeetingData] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [transcriptSegments, setTranscriptSegments] = useState<any[]>([])
  const [aiSummary, setAiSummary] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const loadMeeting = async () => {
      console.log('Loading meeting with ID:', params.id)
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/meetings/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const meeting = data.meeting
          console.log('Found meeting from API:', meeting)
          
          setMeetingData(meeting)
          if (meeting.settings?.isRecording) {
            setIsRecording(true)
          }
          
          // Handle pre-recorded meeting processing
          if (meeting.mode === 'pre-recorded') {
            console.log('Pre-recorded meeting detected, starting processing...')
            handlePreRecordedProcessing(meeting)
            setIsVideoOn(false)
          } else {
            console.log('Real-time meeting, initializing camera...')
            initializeCamera()
          }
        } else {
          console.error('Meeting not found in API!')
          initializeCamera()
        }
      } catch (error) {
        console.error('Error loading meeting:', error)
        initializeCamera()
      }
    }
    
    loadMeeting()
  }, [params.id])

  const initializeCamera = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } else {
        setIsVideoOn(false)
      }
    } catch (error) {
      setIsVideoOn(false)
    }
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn
      }
    }
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
      }
    }
  }

  const endMeeting = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')
    const updatedMeetings = meetings.map((m: any) => 
      m.id === params.id ? { ...m, status: 'completed', endTime: new Date().toISOString() } : m
    )
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings))
    
    // For pre-recorded meetings, go to processing view
    if (meetingData?.mode === 'pre-recorded') {
      router.push(`/meeting/${params.id}?processing=true`)
    } else {
      router.push(`/meeting/${params.id}`)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: "You",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const handlePreRecordedProcessing = async (meeting: any) => {
    console.log('Starting pre-recorded processing for:', meeting.title)
    console.log('Meeting settings:', meeting.settings)
    
    try {
      const { apiClient } = await import('@/lib/api')
      
      // Check backend health
      try {
        await apiClient.healthCheck()
        console.log('- Backend is running')
      } catch (healthError) {
        console.error(' Backend not available:', healthError)
        alert('Backend server is not running. Please start the Flask backend on port 5000.')
        return
      }
      
      const tempFile = (window as any).tempUploadFile
      const youtubeUrl = meeting.settings?.youtubeUrl
      
      console.log('Temp file:', tempFile)
      console.log('YouTube URL:', youtubeUrl)
      
      if (!tempFile && !youtubeUrl) {
        console.warn('No file or YouTube URL found for processing')
        alert('No file uploaded or YouTube URL provided. Please go back and upload a file.')
        return
      }
      
      const formData = new FormData()
      formData.append('title', meeting.title)
      formData.append('description', meeting.description || '')
      
      if (tempFile) {
        console.log('- Uploading file:', tempFile.name, 'Size:', tempFile.size, 'Type:', tempFile.type)
        formData.append('file', tempFile)
      } else if (youtubeUrl) {
        console.log('- Using YouTube URL:', youtubeUrl)
        formData.append('youtube_url', youtubeUrl)
      }
      
      console.log('📤 Sending to backend...')
      const result = await apiClient.createPreRecordedMeeting(formData)
      console.log('📥 Backend response:', result)
      
      // Clean up temp file
      delete (window as any).tempUploadFile
      
      // Update meeting status
      const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')
      const updatedMeetings = meetings.map((m: any) => 
        m.id === meeting.id ? { ...m, status: 'processing', backendMeetingId: result.meeting_id } : m
      )
      localStorage.setItem('meetings', JSON.stringify(updatedMeetings))
      
      console.log('🔄 Starting status polling for:', result.meeting_id)
      pollProcessingStatus(result.meeting_id)
      
    } catch (error) {
      console.error('❌ Processing setup failed:', error)
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const pollProcessingStatus = async (backendMeetingId: string) => {
    try {
      const { apiClient } = await import('@/lib/api')
      
      const poll = async () => {
        try {
          const status = await apiClient.getMeetingStatus(backendMeetingId)
          
          if (status.status === 'completed') {
            // Load the processed data
            const data = await apiClient.getMeetingData(backendMeetingId)
            setTranscriptSegments(data.transcript)
            
            // Generate AI summary using OpenAI
            const summaryResponse = await fetch('/api/ai/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ segments: data.transcript.slice(0, 5) })
            })
            
            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json()
              if (summaryData.summaries?.[0]) {
                setAiSummary(summaryData.summaries[0].summary)
              }
            }
            
          } else if (status.status === 'failed') {
            console.error('Processing failed:', status.error)
          } else {
            // Continue polling
            setTimeout(poll, 3000)
          }
        } catch (error) {
          console.error('Status polling error:', error)
          setTimeout(poll, 5000) // Retry after longer delay
        }
      }
      
      poll()
    } catch (error) {
      console.error('Failed to start polling:', error)
    }
  }

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/room/${params.id}`
    navigator.clipboard.writeText(link)
    alert('Meeting link copied!')
  }

  if (!meetingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading meeting room...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="glass-card border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">{meetingData.title}</h1>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            {isRecording && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                ● Recording
              </Badge>
            )}
            {meetingData?.mode === 'pre-recorded' && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
                ● Processing
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyMeetingLink}
              className="glass-card border-white/20 bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-white/20 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <Card className="glass-card relative overflow-hidden flex-1 mb-4">
              <CardContent className="p-0 h-full">
                <div className="relative h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                  {isVideoOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="bg-purple-500/20 text-purple-400 text-2xl">
                          You
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-black/50 text-white">You (Host)</Badge>
                        {!isAudioOn && <MicOff className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-4 p-4 glass-card rounded-lg">
              <Button
                size="lg"
                variant={isAudioOn ? "default" : "destructive"}
                onClick={toggleAudio}
                className={isAudioOn ? "bg-white/20 hover:bg-white/30" : ""}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant={isVideoOn ? "default" : "destructive"}
                onClick={toggleVideo}
                className={isVideoOn ? "bg-white/20 hover:bg-white/30" : ""}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant={isScreenSharing ? "default" : "outline"}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className="glass-card border-white/20 bg-transparent"
              >
                <Monitor className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                variant={isHandRaised ? "default" : "outline"}
                onClick={() => setIsHandRaised(!isHandRaised)}
                className="glass-card border-white/20 bg-transparent"
              >
                <Hand className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                variant={isSpeakerOn ? "default" : "outline"}
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className="glass-card border-white/20 bg-transparent"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="glass-card border-white/20 bg-transparent"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                variant="destructive"
                onClick={endMeeting}
                className="bg-red-500 hover:bg-red-600"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-white/10 glass-card">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 glass-card bg-white/5 m-4 mb-0">
              <TabsTrigger value="chat" className="data-[state=active]:bg-purple-500/30">
                <MessageSquare className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="participants" className="data-[state=active]:bg-purple-500/30">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="transcript" className="data-[state=active]:bg-purple-500/30">
                <FileText className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-purple-500/30">
                <Brain className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-0">
              <div className="flex-1 mb-4 overflow-y-auto">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-400 text-sm">{msg.sender}</span>
                        <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="glass-card border-white/20 bg-white/5 text-white"
                />
                <Button onClick={sendMessage} size="sm">Send</Button>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="flex-1 p-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">You</div>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">Host</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transcript" className="flex-1 p-4 pt-0">
              <div className="text-center text-gray-400 py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Live transcription will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 p-4 pt-0">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Live AI Summary
                  </h4>
                  <p className="text-gray-400 text-sm">AI summary will be generated as the meeting progresses</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Quick Actions</h4>
                  <Button 
                    size="sm" 
                    className="w-full justify-start glass-card border-white/20 bg-transparent"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/ai/summarize', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            segments: [{ speaker: "You", text: "Meeting in progress..." }]
                          })
                        })
                        const data = await response.json()
                        if (data.summaries?.[0]) {
                          setAiSummary(data.summaries[0].summary)
                        }
                      } catch (error) {
                        console.error('Failed to generate summary:', error)
                      }
                    }}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Summary
                  </Button>
                  
                  <Button size="sm" className="w-full justify-start glass-card border-white/20 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export Transcript
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}