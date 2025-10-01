"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  Download,
  FileText,
  Users,
  Share2,
  Clock,
  Calendar,
  ChevronRight,
  Home,
  Volume2,
  VolumeX,
  Pause,
  SkipForward,
  SkipBack,
  Maximize,
  Settings,
  Eye,
  Brain,
  Hash,
  Edit3,
  Save,
  X,
  Plus,
  MessageSquare,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  MapPin,
  Loader2,
  Upload,
  Music,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts"
import LocationMap from "@/components/location-map" // Added LocationMap import
import ProcessingStatus from "@/components/processing-status"
import FileUpload from "@/components/file-upload"
import EnhancedTranscript from "@/components/enhanced-transcript"
import EnhancedAudioPlayer from "@/components/enhanced-audio-player"

interface Topic {
  id: string
  title: string
  decisionNumber: string
  rapporteur: string
  date: string
  adaCode: string
  onAgenda: boolean
  keywords: string[]
  startTime: string
  endTime: string
  summary: string
  speakers: string[]
  status: "discussed" | "pending" | "decided"
  aiConfidence: number
}

const locationMentions = [
  {
    id: "1",
    location: "San Francisco Office",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    mentions: 3,
    context: "Team relocation discussion and hybrid work policy",
    timestamp: "00:15:30",
    speakers: ["Sarah Chen", "Mike Rodriguez"],
    category: "office" as const,
    importance: "high" as const,
  },
  {
    id: "2",
    location: "Remote Work Setup",
    coordinates: { lat: 37.7849, lng: -122.4094 },
    mentions: 5,
    context: "Discussion about remote work infrastructure and tools",
    timestamp: "00:22:15",
    speakers: ["Emily Watson", "David Kim", "Sarah Chen"],
    category: "remote" as const,
    importance: "high" as const,
  },
  {
    id: "3",
    location: "Conference Room B",
    coordinates: { lat: 37.7649, lng: -122.4294 },
    mentions: 2,
    context: "Next meeting venue planning",
    timestamp: "00:38:45",
    speakers: ["Sarah Chen"],
    category: "venue" as const,
    importance: "medium" as const,
  },
  {
    id: "4",
    location: "Client Site - NYC",
    coordinates: { lat: 40.7128, lng: -74.006 },
    mentions: 1,
    context: "Upcoming client visit and presentation planning",
    timestamp: "00:41:20",
    speakers: ["Mike Rodriguez"],
    category: "client" as const,
    importance: "medium" as const,
  },
  {
    id: "5",
    location: "Austin Tech Hub",
    coordinates: { lat: 30.2672, lng: -97.7431 },
    mentions: 2,
    context: "Potential expansion location discussion",
    timestamp: "00:28:10",
    speakers: ["Emily Watson", "David Kim"],
    category: "office" as const,
    importance: "low" as const,
  },
]

// Helper function to parse transcript
function parseTranscriptToSegments(transcript: string) {
  if (!transcript || typeof transcript !== 'string') return []
  
  const segments = []
  const lines = transcript.split('\n')
  
  lines.forEach(line => {
    if (line.trim() && line.includes('] ')) {
      try {
        const [timestampPart, content] = line.split('] ', 2)
        const timestamp = timestampPart.replace('[', '')
        const [start, end] = timestamp.split(' - ')
        
        if (content && content.includes(': ')) {
          const [speaker, text] = content.split(': ', 2)
          segments.push({
            speaker: speaker.trim(),
            text: text.trim(),
            timestamp,
            start,
            end
          })
        }
      } catch (e) {
        console.warn('Failed to parse line:', line)
      }
    }
  })
  
  return segments
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAgendaItem, setSelectedAgendaItem] = useState(0)
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [meetingData, setMeetingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [backendMeetingId, setBackendMeetingId] = useState<string | null>(null)
  const [transcriptData, setTranscriptData] = useState<any>(null)
  const [processingStarted, setProcessingStarted] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const analysisRef = useRef(false)
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const [hierarchicalTranscriptData, setHierarchicalTranscriptData] = useState<any>(null)
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const [playerDuration, setPlayerDuration] = useState(0)
  const [playerVolume, setPlayerVolume] = useState(1)


  // Move player when expanded state changes
  useEffect(() => {
    const movePlayer = () => {
      const player = document.querySelector('.enhanced-audio-player')
      const video = document.querySelector('video')
      if (!player && !video) return
      
      const footerContainer = document.getElementById('footer-video-container')
      const expandedContainer = document.getElementById('expanded-video-container')
      
      if (isPlayerExpanded && expandedContainer) {
        if (player && !expandedContainer.contains(player)) {
          expandedContainer.appendChild(player)
        } else if (video && !expandedContainer.contains(video)) {
          video.className = 'w-full h-full object-contain'
          expandedContainer.appendChild(video)
        }
      } else if (!isPlayerExpanded && footerContainer) {
        if (video && !footerContainer.contains(video)) {
          video.className = 'w-full h-full object-cover'
          footerContainer.appendChild(video)
        }
      }
    }
    
    setTimeout(movePlayer, 100)
  }, [isPlayerExpanded])

  const handlePreRecordedProcessing = async (meeting: any) => {
    console.log('Starting backend processing for pre-recorded meeting:', meeting.title)
    console.log('Meeting object:', meeting)
    console.log('Window tempUploadFile:', (window as any).tempUploadFile)
    
    try {
      const { apiClient } = await import('@/lib/api')
      
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
      
      console.log('Temp file found:', !!tempFile)
      console.log('YouTube URL found:', !!youtubeUrl)
      
      // Skip file check - backend will handle file processing automatically
      
      const formData = new FormData()
      formData.append('title', meeting.title)
      formData.append('description', meeting.description || '')
      
      // Add participant data for speaker recognition
      if (meeting.participants && meeting.participants.length > 0) {
        formData.append('participants', JSON.stringify(meeting.participants))
      }
      
      if (tempFile) {
        console.log('- Uploading file:', tempFile.name)
        formData.append('file', tempFile)
      } else if (youtubeUrl) {
        formData.append('youtube_url', youtubeUrl)
      }
      
      console.log('📤 Sending to backend...')
      const result = await apiClient.createPreRecordedMeeting(meeting.id, formData)
      console.log('📥 Backend response:', result)
      
      // Update the frontend meeting with the backend meeting ID
      const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')
      const updatedMeetings = meetings.map((m: any) => 
        m.id === meeting.id ? { ...m, backendMeetingId: result.meeting_id, status: 'processing' } : m
      )
      localStorage.setItem('meetings', JSON.stringify(updatedMeetings))
      
      // Update the meetingData state with the backend meeting ID
      setMeetingData((prev: any) => ({ ...prev, backendMeetingId: result.meeting_id }))
      setBackendMeetingId(result.meeting_id)
      
      delete (window as any).tempUploadFile
      
    } catch (error) {
      console.error('❌ Processing setup failed:', error)
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Load meeting data from database API
  useEffect(() => {
    const loadMeetingData = async () => {
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
          console.log('Loaded meeting from API:', meeting)
          console.log('Meeting settings:', meeting.settings)
          console.log('Backend meeting ID:', meeting.backend_meeting_id)
          
          setMeetingData(meeting)
          
          // Check if this is a processing meeting
          const urlParams = new URLSearchParams(window.location.search)
          const isProcessingParam = urlParams.get('processing') === 'true'
          
          if (meeting.mode === 'pre-recorded') {
            if (meeting.status === 'processing' || isProcessingParam) {
              setIsProcessing(true)
              // Start backend processing only if this is a new pre-recorded meeting
              if (isProcessingParam && !meeting.backend_meeting_id && !processingStarted) {
                console.log('🚀 About to call handlePreRecordedProcessing')
                setProcessingStarted(true)
                handlePreRecordedProcessing(meeting)
              } else {
                console.log('⚠️ Processing already started or no processing param')
                if (meeting.backend_meeting_id) {
                  setBackendMeetingId(meeting.backend_meeting_id)
                }
              }
            } else {
              // Load AI data from database
              if (meeting.hierarchical_data?.meeting?.speakerSegments) {
                // Store hierarchical data for enhanced transcript
                setHierarchicalTranscriptData(meeting.hierarchical_data)
                
                const segments = meeting.hierarchical_data.meeting.speakerSegments.map((segment: any, index: number) => ({
                  speaker: segment.speaker || `SPEAKER_${index}`,
                  text: segment.utterances?.map((u: any) => u.text).join(' ') || '',
                  timestamp: `${Math.floor(segment.utterances?.[0]?.startTimestamp || 0 / 60).toString().padStart(2, '0')}:${Math.floor((segment.utterances?.[0]?.startTimestamp || 0) % 60).toString().padStart(2, '0')}`
                }))
                setTranscriptData(segments)
              } else if (meeting.transcript_data) {
                try {
                  const parsed = JSON.parse(meeting.transcript_data)
                  setTranscriptData(parsed)
                } catch (error) {
                  console.error('Error parsing transcript data:', error)
                  setTranscriptData(null)
                }
              }
              
              if (meeting.topics_data) {
                try {
                  let topicsData = meeting.topics_data
                  if (typeof topicsData === 'string') {
                    topicsData = JSON.parse(topicsData)
                  }
                  
                  const topicsArray = Array.isArray(topicsData) ? topicsData : []
                  const formattedTopics = topicsArray.map((topic: any, index: number) => ({
                    id: topic.id || `topic_${index}`,
                    title: topic.title || `Topic ${index + 1}`,
                    decisionNumber: topic.decisionNumber || '',
                    rapporteur: meeting.created_by || 'Unknown',
                    date: meeting.meeting_date,
                    adaCode: topic.adaCode || '',
                    onAgenda: true,
                    keywords: topic.keywords || [],
                    startTime: topic.start_time || '00:00',
                    endTime: topic.end_time || '00:00',
                    summary: topic.summary || topic.description || 'AI-generated topic summary',
                    speakers: topic.speakers || [],
                    status: topic.status || 'discussed',
                    aiConfidence: topic.ai_confidence || topic.confidence || 0.8
                  }))
                  setTopics(formattedTopics)
                } catch (error) {
                  console.error('Error parsing topics data:', error)
                }
              }
              
              // Fallback to localStorage if database data not available
              if (!meeting.transcript_data && !meeting.topics_data) {
                const aiDataStr = localStorage.getItem(`aiData_${params.id}`)
                if (aiDataStr) {
                  try {
                    const aiData = JSON.parse(aiDataStr)
                    
                    if (aiData.transcript) {
                      setTranscriptData(aiData.transcript)
                    }
                    
                    if (aiData.topics) {
                      const topicsArray = Array.isArray(aiData.topics) ? aiData.topics : aiData.topics.topics || []
                      const formattedTopics = topicsArray.map((topic: any, index: number) => ({
                        id: topic.id || `topic_${index}`,
                        title: topic.title || topic.name || `Topic ${index + 1}`,
                        decisionNumber: topic.decisionNumber || '',
                        rapporteur: meeting.created_by || 'Unknown',
                        date: meeting.meeting_date,
                        adaCode: topic.adaCode || '',
                        onAgenda: true,
                        keywords: topic.keywords || [],
                        startTime: topic.start_time ? `${Math.floor(topic.start_time / 60).toString().padStart(2, '0')}:${Math.floor(topic.start_time % 60).toString().padStart(2, '0')}` : '00:00',
                        endTime: topic.end_time ? `${Math.floor(topic.end_time / 60).toString().padStart(2, '0')}:${Math.floor(topic.end_time % 60).toString().padStart(2, '0')}` : '00:00',
                        summary: topic.summary || topic.description || 'AI-generated topic summary',
                        speakers: topic.speakers || [],
                        status: topic.status || 'discussed',
                        aiConfidence: topic.ai_confidence || topic.confidence || 0.8
                      }))
                      setTopics(formattedTopics)
                    }
                  } catch (error) {
                    console.error('Error parsing AI data:', error)
                  }
                }
              }
            }
          }
        } else {
          console.error('Meeting not found in API')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error loading meeting data:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    
    loadMeetingData()
  }, [params.id, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading meeting...</div>
      </div>
    )
  }

  // Show error state if no meeting data
  if (!meetingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Meeting not found</div>
      </div>
    )
  }

  const meeting = {
    id: meetingData.id,
    title: meetingData.title || 'Untitled Meeting',
    date: meetingData.meeting_date ? new Date(meetingData.meeting_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Date not set',
    time: meetingData.meeting_time && meetingData.meeting_date && meetingData.duration ? 
      `${meetingData.meeting_time} - ${new Date(new Date(`${meetingData.meeting_date}T${meetingData.meeting_time}`).getTime() + parseInt(meetingData.duration) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 
      'Time not set',
    duration: meetingData.duration ? `${meetingData.duration} minutes` : '60 minutes',
    status: meetingData.status || 'scheduled',
    community: meetingData.created_by || meetingData.rapporteur || 'Team Meeting',
    participants: meetingData.participants?.length || 0,
    recordingUrl: "/placeholder.mp4",
    hasTranscript: true,
  }

  const agendaItems = [
    {
      id: 1,
      title: "Sprint Review",
      timestamp: "00:02:30",
      description: "Review of completed tasks and sprint goals achievement",
      duration: "8 minutes",
    },
    {
      id: 2,
      title: "Blockers Discussion",
      timestamp: "00:10:45",
      description: "Team members discuss current blockers and potential solutions",
      duration: "12 minutes",
    },
    {
      id: 3,
      title: "Next Sprint Planning",
      timestamp: "00:22:15",
      description: "Planning upcoming sprint tasks and resource allocation",
      duration: "15 minutes",
    },
    {
      id: 4,
      title: "Technical Debt Review",
      timestamp: "00:37:30",
      description: "Discussion on technical debt priorities and timeline",
      duration: "8 minutes",
    },
  ]

  const speakers = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Engineering Manager",
      avatar: "/professional-woman.png",
      speakingTime: "12m 30s",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "Senior Developer",
      avatar: "/man-developer.png",
      speakingTime: "8m 45s",
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "Product Designer",
      avatar: "/woman-designer.png",
      speakingTime: "6m 20s",
    },
    {
      id: 4,
      name: "David Kim",
      role: "DevOps Engineer",
      avatar: "/man-engineer.png",
      speakingTime: "5m 15s",
    },
  ]

  const transcriptSegments = transcriptData || [
    {
      speaker: "Sarah Chen",
      timestamp: "00:02:30",
      text: "Good morning everyone! Let's start with our sprint review. I'm happy to report that we completed 8 out of 10 planned story points this sprint.",
    },
    {
      speaker: "Mike Rodriguez",
      timestamp: "00:03:15",
      text: "The authentication module is now fully implemented and tested. We had some challenges with the OAuth integration, but those are resolved.",
    },
    {
      speaker: "Emily Watson",
      timestamp: "00:04:02",
      text: "From a design perspective, the new user onboarding flow is ready for development. I've updated all the mockups in Figma.",
    },
  ]

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    setTopics(topics.map((topic) => (topic.id === topicId ? { ...topic, ...updates } : topic)))
    setEditingTopic(null)
  }

  const addNewTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: "New Topic",
      decisionNumber: "",
      rapporteur: "",
      date: new Date().toISOString().split("T")[0],
      adaCode: "",
      onAgenda: true,
      keywords: [],
      startTime: "00:00:00",
      endTime: "00:00:00",
      summary: "",
      speakers: [],
      status: "pending",
      aiConfidence: 0,
    }
    setTopics([...topics, newTopic])
    setEditingTopic(newTopic.id)
  }

  const getStatusColor = (status: Topic["status"]) => {
    switch (status) {
      case "decided":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "discussed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: Topic["status"]) => {
    switch (status) {
      case "decided":
        return <CheckCircle className="w-4 h-4" />
      case "discussed":
        return <MessageSquare className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
      {/* Header Section */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-400 hover:text-white flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Meeting Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Meeting Title and Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{meeting.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meeting.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meeting.time}
                </div>
                <div className="text-purple-400">{meeting.community}</div>
                <div>{meeting.duration}</div>
                <Badge className={`${
                  meeting.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  meeting.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </Badge>
                {meetingData.onAgenda && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    On Agenda
                  </Badge>
                )}
              </div>
              {meetingData.description && (
                <p className="text-gray-300 text-sm mt-2 max-w-2xl">{meetingData.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                <Play className="w-4 h-4 mr-2" />
                Watch Recording
              </Button>
              <Button variant="outline" className="glass-card border-white/20 bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                View Transcript
              </Button>
              <Button variant="outline" className="glass-card border-white/20 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">


        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 glass-card bg-white/5 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-purple-500/30">
              <Brain className="w-4 h-4 mr-2" />
              AI Topics
            </TabsTrigger>
            <TabsTrigger value="transcript" className="data-[state=active]:bg-purple-500/30">
              <FileText className="w-4 h-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-purple-500/30">
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Show processing status for pre-recorded meetings */}
            {isProcessing && meetingData?.mode === 'pre-recorded' && backendMeetingId && (
              <div className="mb-8">
                <ProcessingStatus 
                  meetingId={backendMeetingId}
                  onComplete={async () => {
                    if (analysisRef.current) return
                    analysisRef.current = true
                    setAnalysisCompleted(true)
                    try {
                      // Get AI data from Flask backend
                      const { apiClient } = await import('@/lib/api')
                      const aiData = await apiClient.getMeetingData(backendMeetingId)
                      
                      // Enhanced AI analysis using OpenAI with proxy
                      console.log('🤖 Starting OpenAI analysis with proxy...')
                      
                      // Parse transcript for OpenAI analysis
                      const transcriptSegments = parseTranscriptToSegments(aiData.transcript)
                      
                      const enhancedAnalysis = await fetch('/api/ai/analyze-meeting', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          transcript: transcriptSegments,
                          meetingTitle: meetingData.title,
                          meetingDate: meetingData.meeting_date
                        })
                      })
                      
                      let finalTopics = []
                      let finalSummaries = []
                      let finalSpeakers = aiData.speakers
                      
                      if (enhancedAnalysis.ok) {
                        const enhanced = await enhancedAnalysis.json()
                        console.log('✅ OpenAI analysis SUCCESS:', enhanced)
                        finalTopics = enhanced.topics || []
                        finalSummaries = enhanced.summaries || []
                        finalSpeakers = enhanced.speakers || aiData.speakers
                      } else {
                        console.error('❌ OpenAI analysis failed:', enhancedAnalysis.status)
                        // Fallback to basic topics
                        finalTopics = aiData.topics?.topics || []
                      }
                      
                      // Update local state immediately with AI data
                      setTranscriptData(parseTranscriptToSegments(aiData.transcript))
                      
                      // Store hierarchical data if available
                      if (aiData.hierarchical_data) {
                        setHierarchicalTranscriptData(aiData.hierarchical_data)
                      }
                      
                      const formattedTopics = finalTopics.map((topic, index) => ({
                        id: topic.id || `topic_${index}`,
                        title: topic.title || `Topic ${index + 1}`,
                        decisionNumber: topic.decisionNumber || '',
                        rapporteur: meetingData.created_by || 'Unknown',
                        date: meetingData.meeting_date,
                        adaCode: topic.adaCode || '',
                        onAgenda: true,
                        keywords: topic.keywords || [],
                        startTime: topic.start_time || '00:00',
                        endTime: topic.end_time || '00:00',
                        summary: topic.summary || topic.description || 'AI-generated topic summary',
                        speakers: topic.speakers || [],
                        status: topic.status || 'discussed',
                        aiConfidence: topic.ai_confidence || topic.confidence || 0.8
                      }))
                      setTopics(formattedTopics)
                      
                      // Store in database
                      const token = localStorage.getItem('token')
                      await fetch(`/api/meetings/${params.id}/process`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          backendMeetingId,
                          transcriptData: JSON.stringify(transcriptSegments),
                          topicsData: JSON.stringify(finalTopics),
                          speakersData: JSON.stringify(finalSpeakers),
                          aiSummary: JSON.stringify({
                            summaries: finalSummaries,
                            overview: finalSummaries.filter(s => s.type === 'SUBSTANTIAL').map(s => s.summary).join(' ') || 'AI-generated meeting summary'
                          })
                        })
                      })
                      
                      // Also store in localStorage as backup
                      localStorage.setItem(`aiData_${params.id}`, JSON.stringify({
                        ...aiData,
                        topics: finalTopics,
                        summaries: finalSummaries,
                        speakers: finalSpeakers
                      }))
                      
                      // Helper function to parse transcript
                      function parseTranscriptToSegments(transcript) {
                        if (Array.isArray(transcript)) return transcript
                        
                        const segments = []
                        const lines = transcript.split('\n')
                        
                        lines.forEach(line => {
                          if (line.trim() && line.includes('] ')) {
                            try {
                              const [timestampPart, content] = line.split('] ', 2)
                              const timestamp = timestampPart.replace('[', '')
                              const [start, end] = timestamp.split(' - ')
                              
                              if (content && content.includes(': ')) {
                                const [speaker, text] = content.split(': ', 2)
                                segments.push({
                                  speaker: speaker.trim(),
                                  text: text.trim(),
                                  timestamp,
                                  start,
                                  end
                                })
                              }
                            } catch (e) {
                              console.warn('Failed to parse line:', line)
                            }
                          }
                        })
                        
                        return segments
                      }
                      
                      setIsProcessing(false)
                      // Remove processing parameter and reload
                      const url = new URL(window.location.href)
                      url.searchParams.delete('processing')
                      window.location.href = url.toString()
                    } catch (error) {
                      console.error('Failed to store AI results:', error)
                      setIsProcessing(false)
                    }
                  }}
                  onError={(error) => {
                    console.error('Processing failed:', error)
                    setIsProcessing(false)
                  }}
                />
              </div>
            )}
            
            {/* Show loading message while waiting for backend meeting ID */}
            {isProcessing && meetingData?.mode === 'pre-recorded' && !backendMeetingId && (
              <div className="mb-8 text-center">
                <div className="text-white text-lg">Starting AI processing...</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Meeting Agenda */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Meeting Agenda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agendaItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedAgendaItem === index
                              ? "bg-purple-500/20 border-purple-500/30 glow-effect"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                          onClick={() => setSelectedAgendaItem(index)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                  {item.timestamp}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                              <div className="text-xs text-purple-400">{item.duration}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Transcript Preview */}
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Transcript Preview
                      </CardTitle>
                      <Button variant="outline" size="sm" className="glass-card border-white/20 bg-transparent">
                        View Full Transcript
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(transcriptData || transcriptSegments).map((segment, index) => (
                        <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-purple-400">{segment.speaker}</span>
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                              {segment.timestamp}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{segment.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Right Column */}
              <div className="space-y-6">
                {/* Meeting Information */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Meeting Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Completed</Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-medium">{meeting.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Participants</div>
                        <div className="text-white font-medium">{meeting.participants}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Community</div>
                        <div className="text-purple-400 font-medium">{meeting.community}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Speakers List */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Speakers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {speakers.map((speaker) => (
                        <div
                          key={speaker.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.name} />
                            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                              {speaker.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{speaker.name}</div>
                            <div className="text-gray-400 text-xs">{speaker.role}</div>
                          </div>
                          <div className="text-xs text-purple-400">{speaker.speakingTime}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start glass-card border-white/20 bg-transparent hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Download Transcript
                    </Button>
                    <Button className="w-full justify-start glass-card border-white/20 bg-transparent hover:bg-white/10">
                      <Eye className="w-4 h-4 mr-2" />
                      View Attendees
                    </Button>
                    <Button className="w-full justify-start glass-card border-white/20 bg-transparent hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Meeting
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI-powered topic management tab */}
          <TabsContent value="topics">
            <div className="space-y-6">
              {/* Topics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI-Extracted Topics</h2>
                  <p className="text-gray-400">Automatically identified discussion topics with AI analysis</p>
                </div>
                <Button
                  onClick={addNewTopic}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              {/* Topics List */}
              <div className="space-y-4">
                {topics.length === 0 && !isProcessing ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">No AI Topics Available</h3>
                      <p className="text-gray-400">AI topic extraction will be available after meeting processing completes.</p>
                    </CardContent>
                  </Card>
                ) : topics.map((topic) => (
                  <Card key={topic.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {editingTopic === topic.id ? (
                              <Input
                                value={topic.title}
                                onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                                className="glass-card border-white/20 bg-white/5 text-white"
                              />
                            ) : (
                              <h3 className="text-xl font-semibold text-white">{topic.title}</h3>
                            )}
                            <Badge className={getStatusColor(topic.status)}>
                              {getStatusIcon(topic.status)}
                              <span className="ml-1 capitalize">{topic.status}</span>
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {topic.startTime} - {topic.endTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {topic.rapporteur}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              AI Confidence: {Math.round(topic.aiConfidence * 100)}%
                            </div>
                            <Badge
                              className={`text-xs ${topic.onAgenda ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"}`}
                            >
                              {topic.onAgenda ? "On Agenda" : "Off Agenda"}
                            </Badge>
                          </div>

                          {topic.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {topic.keywords.map((keyword) => (
                                <Badge
                                  key={keyword}
                                  className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                                >
                                  <Hash className="w-3 h-3 mr-1" />
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {editingTopic === topic.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => setEditingTopic(null)}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTopic(null)}
                                className="glass-card border-white/20 bg-transparent"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTopic(topic.id)}
                              className="glass-card border-white/20 bg-transparent"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {editingTopic === topic.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">Decision Number</Label>
                              <Input
                                value={topic.decisionNumber}
                                onChange={(e) => updateTopic(topic.id, { decisionNumber: e.target.value })}
                                className="glass-card border-white/20 bg-white/5 text-white"
                                placeholder="e.g., DEC-2024-001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">ADA Code</Label>
                              <Input
                                value={topic.adaCode}
                                onChange={(e) => updateTopic(topic.id, { adaCode: e.target.value })}
                                className="glass-card border-white/20 bg-white/5 text-white"
                                placeholder="e.g., ADA-2024-15"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Summary</Label>
                            <Textarea
                              value={topic.summary}
                              onChange={(e) => updateTopic(topic.id, { summary: e.target.value })}
                              className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 min-h-[100px]"
                              placeholder="AI-generated summary of the topic discussion..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {topic.decisionNumber && (
                              <div>
                                <span className="text-gray-400">Decision Number:</span>
                                <span className="text-white ml-2 font-medium">{topic.decisionNumber}</span>
                              </div>
                            )}
                            {topic.adaCode && (
                              <div>
                                <span className="text-gray-400">ADA Code:</span>
                                <span className="text-white ml-2 font-medium">{topic.adaCode}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-white font-medium mb-2">AI Summary</h4>
                            <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                              {topic.summary}
                            </p>
                          </div>

                          {topic.speakers.length > 0 && (
                            <div>
                              <h4 className="text-white font-medium mb-2">Speakers</h4>
                              <div className="flex flex-wrap gap-2">
                                {topic.speakers.map((speaker) => (
                                  <Badge
                                    key={speaker}
                                    className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  >
                                    {speaker}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Processing Status for Topics */}
              {isProcessing && (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">AI Analysis in Progress</h3>
                    <p className="text-gray-400">Extracting topics and generating summaries...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transcript">
            <EnhancedTranscript
              hierarchicalData={hierarchicalTranscriptData}
              transcriptData={transcriptData}
              onSeekToTime={(timestamp) => {
                let seekTime = Number(timestamp)
                if (!isFinite(seekTime) || seekTime < 0) return
                
                if (seekTime > 10000) {
                  seekTime = seekTime / 1000
                }
                
                setSeekToTime(seekTime)
                
                if (typeof window !== 'undefined' && (window as any).mediaControls?.seekToTime) {
                  (window as any).mediaControls.seekToTime(seekTime)
                  
                  setTimeout(() => {
                    if ((window as any).mediaControls?.playMedia) {
                      (window as any).mediaControls.playMedia()
                    }
                  }, 100)
                }
              }}
              onSaveTranscript={async (updatedData) => {
                try {
                  // Save updated transcript to database
                  const token = localStorage.getItem('token')
                  await fetch(`/api/meetings/${params.id}/transcript`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      transcriptData: JSON.stringify(updatedData.segments),
                      hierarchicalData: updatedData.hierarchicalData ? JSON.stringify(updatedData.hierarchicalData) : null
                    })
                  })
                  
                  // Update local state
                  setTranscriptData(updatedData.segments)
                  if (updatedData.hierarchicalData) {
                    setHierarchicalTranscriptData(updatedData.hierarchicalData)
                  }
                  
                  console.log('Transcript saved successfully')
                } catch (error) {
                  console.error('Failed to save transcript:', error)
                  alert('Failed to save transcript changes')
                }
              }}
              isProcessing={isProcessing}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Meeting Analytics</h2>
                  <p className="text-gray-400">Detailed insights and performance metrics</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics
                </Button>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Participation Rate</p>
                        <p className="text-2xl font-bold text-white">87%</p>
                        <p className="text-green-400 text-xs mt-1">+12% vs avg</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Decision Efficiency</p>
                        <p className="text-2xl font-bold text-white">2.7</p>
                        <p className="text-blue-400 text-xs mt-1">decisions/topic</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg Response Time</p>
                        <p className="text-2xl font-bold text-white">3.2s</p>
                        <p className="text-purple-400 text-xs mt-1">-0.8s vs avg</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Topic Coverage</p>
                        <p className="text-2xl font-bold text-white">94%</p>
                        <p className="text-pink-400 text-xs mt-1">agenda items</p>
                      </div>
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-pink-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Speaking Pattern Analysis */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Speaking Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {speakers.map((speaker, index) => (
                        <div key={speaker.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.name} />
                                <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                                  {speaker.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white text-sm font-medium">{speaker.name}</div>
                                <div className="text-gray-400 text-xs">{speaker.role}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-sm">{speaker.speakingTime}</div>
                              <div className="text-gray-400 text-xs">
                                {Math.round((Number.parseFloat(speaker.speakingTime) / 45) * 100)}%
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={Math.round((Number.parseFloat(speaker.speakingTime) / 45) * 100)}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interaction Heatmap */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Interaction Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {speakers.map((speaker1, i) =>
                        speakers.map((speaker2, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                              i === j
                                ? "bg-gray-500/20 text-gray-400"
                                : Math.random() > 0.5
                                  ? "bg-purple-500/30 text-purple-300"
                                  : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {i === j ? "—" : Math.floor(Math.random() * 10)}
                          </div>
                        )),
                      )}
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Low interaction</span>
                        <span>High interaction</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-4 h-2 bg-purple-500/10 rounded"></div>
                        <div className="w-4 h-2 bg-purple-500/20 rounded"></div>
                        <div className="w-4 h-2 bg-purple-500/30 rounded"></div>
                        <div className="w-4 h-2 bg-purple-500/40 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Topic Sentiment Timeline */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Sentiment Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { time: "0:00", sentiment: 0.7, topic: "Opening" },
                            { time: "5:00", sentiment: 0.8, topic: "Sprint Review" },
                            { time: "10:00", sentiment: 0.6, topic: "Blockers" },
                            { time: "20:00", sentiment: 0.4, topic: "Issues" },
                            { time: "30:00", sentiment: 0.7, topic: "Planning" },
                            { time: "40:00", sentiment: 0.8, topic: "Wrap-up" },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" />
                          <YAxis domain={[0, 1]} stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F3F4F6",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="sentiment"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Frequency */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Keyword Frequency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { word: "sprint", count: 23, trend: "+15%" },
                        { word: "technical", count: 18, trend: "+8%" },
                        { word: "optimization", count: 12, trend: "+22%" },
                        { word: "process", count: 11, trend: "-5%" },
                        { word: "team", count: 9, trend: "+3%" },
                        { word: "planning", count: 8, trend: "+12%" },
                      ].map((keyword, index) => (
                        <div
                          key={keyword.word}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-white font-medium">#{keyword.word}</div>
                              <div className="text-gray-400 text-xs">{keyword.count} mentions</div>
                            </div>
                          </div>
                          <Badge
                            className={`text-xs ${
                              keyword.trend.startsWith("+")
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {keyword.trend}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Analytics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI-Powered Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <h4 className="text-white font-medium">Meeting Efficiency</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        This meeting was 23% more efficient than average, with clear decision-making and focused
                        discussions.
                      </p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        High Performance
                      </Badge>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-medium">Participation Balance</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Good distribution of speaking time across participants. Consider encouraging quieter members.
                      </p>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Well Balanced</Badge>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <h4 className="text-white font-medium">Improvement Areas</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Some topics went over allocated time. Consider stricter time management for future meetings.
                      </p>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        Action Needed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locations">
            <div className="space-y-6">
              {/* Locations Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Location Analysis</h2>
                  <p className="text-gray-400">AI-extracted location mentions and geographic insights</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  <Download className="w-4 h-4 mr-2" />
                  Export Map Data
                </Button>
              </div>

              {/* Location Map Component */}
              <LocationMap mentions={locationMentions} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Meeting Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Meeting settings will be implemented here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Media Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Small Video Tile with Expand/Collapse */}
            <div className="relative w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0 group">
              <div id="footer-video-container" className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white/60" />
              </div>
              {/* Expand/Collapse Button */}
              <Button
                size="sm"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsPlayerExpanded(true)}
              >
                <Maximize className="w-2 h-2" />
              </Button>
            </div>


            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white p-1"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.mediaControls) {
                    if (isPlaying) {
                      window.mediaControls.pauseMedia()
                    } else {
                      window.mediaControls.playMedia()
                    }
                  }
                }}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-1"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.mediaControls?.seekToTime) {
                    window.mediaControls.seekToTime(Math.max(currentPlayTime - 10, 0))
                  }
                }}
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-1"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.mediaControls?.seekToTime) {
                    window.mediaControls.seekToTime(currentPlayTime + 10)
                  }
                }}
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-3">
              <span className="text-white text-xs min-w-[3rem]">
                {Math.floor(currentPlayTime / 60).toString().padStart(2, '0')}:{Math.floor(currentPlayTime % 60).toString().padStart(2, '0')}
              </span>
              <div 
                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const clickRatio = clickX / rect.width
                  const newTime = clickRatio * playerDuration
                  if (typeof window !== 'undefined' && window.mediaControls?.seekToTime) {
                    window.mediaControls.seekToTime(newTime)
                  }
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                  style={{ width: `${playerDuration ? (currentPlayTime / playerDuration) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-white text-xs min-w-[3rem]">
                {Math.floor(playerDuration / 60).toString().padStart(2, '0')}:{Math.floor(playerDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-1"
                onClick={() => {
                  const newVolume = playerVolume === 0 ? 1 : 0
                  setPlayerVolume(newVolume)
                  // Apply volume to actual media element
                  const media = document.querySelector('video, audio') as HTMLMediaElement
                  if (media) {
                    media.volume = newVolume
                  }
                }}
              >
                {playerVolume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
              <div 
                className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const newVolume = Math.max(0, Math.min(1, clickX / rect.width))
                  setPlayerVolume(newVolume)
                  // Apply volume to actual media element
                  const media = document.querySelector('video, audio') as HTMLMediaElement
                  if (media) {
                    media.volume = newVolume
                  }
                }}
              >
                <div className="h-full bg-white rounded-full" style={{ width: `${playerVolume * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Player Modal */}
      {isPlayerExpanded && (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
          <div className="relative w-screen/2 h-screen/2 max-w-full/2 max-h-full/2">
            <div id="expanded-video-container" className="w-full/2 h-full/2">
              {/* Video element will be moved here */}
            </div>
            <Button
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white z-50"
              onClick={() => {
                const video = document.querySelector('video')
                const footerContainer = document.getElementById('footer-video-container')
                if (video && footerContainer) {
                  video.className = 'w-full h-full object-cover'
                  footerContainer.appendChild(video)
                }
                setIsPlayerExpanded(false)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Audio Player */}
      <div className={isPlayerExpanded ? "" : "hidden"} id="main-player-container">
        <div className="enhanced-audio-player">
          <EnhancedAudioPlayer
            youtubeUrl={meetingData?.settings?.youtubeUrl}
            videoUrl={meetingData?.settings?.uploadFile ? `/api/meetings/${params.id}/file` : undefined}
            audioUrl={meetingData?.settings?.uploadFile && !meetingData.settings.uploadFile.includes('.mp4') && !meetingData.settings.uploadFile.includes('.webm') ? `/api/meetings/${params.id}/file` : undefined}
            onTimeUpdate={(time) => {
              setCurrentPlayTime(time)
              // Get duration from media element
              const media = document.querySelector('video, audio') as HTMLMediaElement
              if (media && media.duration && isFinite(media.duration)) {
                setPlayerDuration(media.duration)
              }
            }}
            onSeekTo={(time) => {
              setCurrentPlayTime(time)
            }}
            seekToTime={seekToTime}
          />
        </div>
      </div>
    </div>
  )
}
