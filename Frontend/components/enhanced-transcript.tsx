"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Play, 
  Pause, 
  Edit3, 
  Save, 
  X, 
  Volume2, 
  Download,
  Search,
  Filter,
  Clock,
  User,
  Loader2
} from "lucide-react"

interface Word {
  text: string
  startTimestamp: number
  endTimestamp: number
  confidence: number
}

interface Utterance {
  text: string
  startTimestamp: number
  endTimestamp: number
  confidence: number
  drift: number
  words: Word[]
}

interface SpeakerSegment {
  speakerTagId: string
  startTimestamp: number
  endTimestamp: number
  utterances: Utterance[]
}

interface HierarchicalData {
  meeting: {
    speakerSegments: SpeakerSegment[]
  }
}

interface TranscriptSegment {
  speaker: string
  text: string
  timestamp: string
  start: string
  end: string
  startTimestamp?: number
  endTimestamp?: number
  confidence?: number
  words?: Word[]
}

interface EnhancedTranscriptProps {
  hierarchicalData?: HierarchicalData
  transcriptData?: TranscriptSegment[]
  onSeekToTime?: (timestamp: number) => void
  onSaveTranscript?: (updatedData: any) => void
  isProcessing?: boolean
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return "text-green-400"
  if (confidence >= 0.6) return "text-yellow-400"
  if (confidence >= 0.4) return "text-orange-400"
  return "text-red-400"
}

const getConfidenceBackground = (confidence: number): string => {
  if (confidence >= 0.8) return "bg-green-500/10"
  if (confidence >= 0.6) return "bg-yellow-500/10"
  if (confidence >= 0.4) return "bg-orange-500/10"
  return "bg-red-500/10"
}

export default function EnhancedTranscript({ 
  hierarchicalData, 
  transcriptData, 
  onSeekToTime,
  onSaveTranscript,
  isProcessing = false
}: EnhancedTranscriptProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSegment, setEditingSegment] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("all")
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [speakers, setSpeakers] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [currentPlayingSegment, setCurrentPlayingSegment] = useState<string | null>(null)
  
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Convert hierarchical data to transcript segments
  const convertHierarchicalToSegments = useCallback((data: HierarchicalData): TranscriptSegment[] => {
    const convertedSegments: TranscriptSegment[] = []
    
    data.meeting.speakerSegments.forEach((speakerSegment, segmentIndex) => {
      speakerSegment.utterances.forEach((utterance, utteranceIndex) => {
        const segmentId = `${segmentIndex}-${utteranceIndex}`
        const startMinutes = Math.floor(utterance.startTimestamp / 60)
        const startSeconds = Math.floor(utterance.startTimestamp % 60)
        const endMinutes = Math.floor(utterance.endTimestamp / 60)
        const endSeconds = Math.floor(utterance.endTimestamp % 60)
        
        convertedSegments.push({
          speaker: speakerSegment.speakerTagId,
          text: utterance.text,
          timestamp: `${startMinutes.toString().padStart(2, '0')}:${startSeconds.toString().padStart(2, '0')} - ${endMinutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`,
          start: `${startMinutes.toString().padStart(2, '0')}:${startSeconds.toString().padStart(2, '0')}`,
          end: `${endMinutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`,
          startTimestamp: utterance.startTimestamp,
          endTimestamp: utterance.endTimestamp,
          confidence: utterance.confidence,
          words: utterance.words
        })
      })
    })
    
    return convertedSegments.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0))
  }, [])

  // Initialize segments and speakers
  useEffect(() => {
    let processedSegments: TranscriptSegment[] = []
    
    if (hierarchicalData?.meeting?.speakerSegments) {
      processedSegments = convertHierarchicalToSegments(hierarchicalData)
    } else if (transcriptData) {
      processedSegments = transcriptData
    }
    
    setSegments(processedSegments)
    
    // Extract unique speakers
    const uniqueSpeakers = Array.from(new Set(processedSegments.map(s => s.speaker)))
    setSpeakers(uniqueSpeakers)
  }, [hierarchicalData, transcriptData, convertHierarchicalToSegments])

  // Filter segments based on search and speaker selection
  const filteredSegments = segments.filter(segment => {
    const matchesSearch = searchTerm === "" || 
      segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.speaker.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpeaker = selectedSpeaker === "all" || segment.speaker === selectedSpeaker
    
    return matchesSearch && matchesSpeaker
  })

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (segment.startTimestamp !== undefined && onSeekToTime) {
      // Validate and convert timestamp
      let seekTime = Number(segment.startTimestamp)
      
      // Convert milliseconds to seconds if needed
      if (seekTime > 10000) {
        seekTime = seekTime / 1000
      }
      
      // Ensure valid number
      if (isFinite(seekTime) && seekTime >= 0) {
        onSeekToTime(seekTime)
        setCurrentPlayingSegment(`${segment.speaker}-${seekTime}`)
        
        // Scroll to segment if not visible
        const segmentId = `${segment.speaker}-${seekTime}`
        const segmentElement = segmentRefs.current[segmentId]
        if (segmentElement) {
          segmentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }

  const handleEditSegment = (segmentIndex: number, field: 'text' | 'speaker', value: string) => {
    const updatedSegments = [...segments]
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      [field]: value
    }
    setSegments(updatedSegments)
    setHasUnsavedChanges(true)
  }

  const handleSaveChanges = async () => {
    if (onSaveTranscript) {
      // Convert back to hierarchical format if needed
      const updatedData = {
        segments,
        hierarchicalData: hierarchicalData ? {
          meeting: {
            speakerSegments: convertSegmentsToHierarchical(segments)
          }
        } : null
      }
      
      await onSaveTranscript(updatedData)
      setHasUnsavedChanges(false)
      setIsEditMode(false)
      setEditingSegment(null)
    }
  }

  const convertSegmentsToHierarchical = (segments: TranscriptSegment[]): SpeakerSegment[] => {
    const speakerMap = new Map<string, SpeakerSegment>()
    
    segments.forEach(segment => {
      if (!speakerMap.has(segment.speaker)) {
        speakerMap.set(segment.speaker, {
          speakerTagId: segment.speaker,
          startTimestamp: segment.startTimestamp || 0,
          endTimestamp: segment.endTimestamp || 0,
          utterances: []
        })
      }
      
      const speakerSegment = speakerMap.get(segment.speaker)!
      speakerSegment.utterances.push({
        text: segment.text,
        startTimestamp: segment.startTimestamp || 0,
        endTimestamp: segment.endTimestamp || 0,
        confidence: segment.confidence || 0.8,
        drift: 0,
        words: segment.words || []
      })
      
      // Update segment timestamps
      speakerSegment.startTimestamp = Math.min(speakerSegment.startTimestamp, segment.startTimestamp || 0)
      speakerSegment.endTimestamp = Math.max(speakerSegment.endTimestamp, segment.endTimestamp || 0)
    })
    
    return Array.from(speakerMap.values())
  }

  const renderWordWithConfidence = (word: Word, wordIndex: number) => {
    return (
      <span
        key={wordIndex}
        className={`${getConfidenceColor(word.confidence)} ${getConfidenceBackground(word.confidence)} px-1 rounded transition-colors duration-200 hover:bg-opacity-20`}
        title={`Confidence: ${Math.round(word.confidence * 100)}%`}
      >
        {word.text}
      </span>
    )
  }

  if (isProcessing) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Processing Transcript</h3>
          <p className="text-gray-400">Enhanced transcript with word-level confidence will be available after processing completes.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transcript Controls */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Enhanced Transcript
              {hierarchicalData && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  Word-level Confidence
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Unsaved Changes
                </Badge>
              )}
              {isEditMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingSegment(null)
                      setHasUnsavedChanges(false)
                      // Reset segments to original data
                      if (hierarchicalData) {
                        setSegments(convertHierarchicalToSegments(hierarchicalData))
                      }
                    }}
                    className="glass-card border-white/20 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Mode
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="glass-card border-white/20 bg-transparent"
                onClick={() => {
                  // Download transcript
                  const transcriptText = segments.map(s => 
                    `[${s.timestamp}] ${s.speaker}: ${s.text}`
                  ).join('\n')
                  
                  const blob = new Blob([transcriptText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'transcript.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-card border-white/20 bg-white/5 text-white pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="glass-card border-white/20 bg-white/5 text-white px-3 py-2 rounded-md"
              >
                <option value="all">All Speakers</option>
                {speakers.map(speaker => (
                  <option key={speaker} value={speaker}>{speaker}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transcript Segments */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
            {filteredSegments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No transcript segments found.</p>
              </div>
            ) : (
              filteredSegments.map((segment, index) => {
                const segmentId = `${segment.speaker}-${segment.startTimestamp || index}`
                const isCurrentlyPlaying = currentPlayingSegment === segmentId
                const isEditing = editingSegment === segmentId

                return (
                  <div
                    key={segmentId}
                    ref={el => segmentRefs.current[segmentId] = el}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isCurrentlyPlaying
                        ? "bg-purple-500/20 border-purple-500/30 glow-effect"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      if (!isEditMode) {
                        handleSegmentClick(segment)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Speaker and badges */}
                      <div className="flex-shrink-0">
                        {isEditMode ? (
                          <Input
                            value={segment.speaker}
                            onChange={(e) => handleEditSegment(index, 'speaker', e.target.value)}
                            className="glass-card border-white/20 bg-white/5 text-purple-400 font-medium w-24 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium text-purple-400 text-sm">{segment.speaker}</span>
                        )}
                      </div>

                      {/* Content and controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-5">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-white/20 text-gray-300 cursor-pointer hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSegmentClick(segment)
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {segment.timestamp}
                          </Badge>
                          {segment.confidence && (
                            <Badge 
                              className={`text-xs ${getConfidenceColor(segment.confidence)} ${getConfidenceBackground(segment.confidence)} border-current/30`}
                            >
                              {Math.round(segment.confidence * 100)}%
                            </Badge>
                          )}
                          {!isEditMode && segment.startTimestamp && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (segment.startTimestamp !== undefined && onSeekToTime) {
                                  let seekTime = Number(segment.startTimestamp)
                                  
                                  if (seekTime > 10000) {
                                    seekTime = seekTime / 1000
                                  }
                                  
                                  if (isFinite(seekTime) && seekTime >= 0) {
                                    onSeekToTime(seekTime)
                                    setTimeout(() => {
                                      const media = document.querySelector('video, audio') as HTMLMediaElement
                                      if (media) {
                                        media.play().catch(console.warn)
                                      }
                                    }, 100)
                                  }
                                }
                              }}
                              className="glass-card border-white/20 bg-transparent text-xs hover:bg-purple-500/20 h-6 px-2"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                          )}
                        </div>
                        
                        {/* Transcript Text */}
                        <div className="text-gray-300 text-sm leading-snug">
                          {isEditMode && isEditing ? (
                            <Textarea
                              value={segment.text}
                              onChange={(e) => handleEditSegment(index, 'text', e.target.value)}
                              className="glass-card border-white/20 bg-white/5 text-white min-h-[60px]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : hierarchicalData && segment.words && segment.words.length > 0 ? (
                            <div className="space-x-1">
                              {segment.words.map((word, wordIndex) => (
                                <span key={wordIndex}>
                                  {renderWordWithConfidence(word, wordIndex)}
                                  {wordIndex < segment.words!.length - 1 && ' '}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p>{segment.text}</p>
                          )}
                        </div>
                      </div>

                      {/* Edit controls */}
                      {isEditMode && (
                        <div className="flex-shrink-0">
                          {isEditing ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSegment(null)
                              }}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 h-6 w-6 p-0"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSegment(segmentId)
                              }}
                              className="glass-card border-white/20 bg-transparent h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Confidence Legend */}
          {hierarchicalData && (
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-white font-medium mb-3">Word Confidence Legend</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 rounded"></div>
                  <span className="text-green-400">High (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/20 rounded"></div>
                  <span className="text-yellow-400">Medium (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500/20 rounded"></div>
                  <span className="text-orange-400">Low (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/20 rounded"></div>
                  <span className="text-red-400">Very Low (&lt;40%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}