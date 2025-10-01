"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  FileText, 
  Mic, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from "lucide-react"
import { apiClient, MeetingStatus } from "@/lib/api"

interface ProcessingStatusProps {
  meetingId: string
  onComplete?: () => void
  onError?: (error: string) => void
}

const stageIcons = {
  'queued': Loader2,
  'audio_processing': FileText,
  'speaker_diarization': Users,
  'transcription': Mic,
  'generating_summary': Brain,
  'completed': CheckCircle,
  'failed': AlertCircle
}

const stageLabels = {
  'queued': 'Queued for Processing',
  'audio_processing': 'Processing Audio File',
  'speaker_diarization': 'Identifying Speakers',
  'transcription': 'Transcribing Speech',
  'generating_summary': 'Generating Summary',
  'completed': 'Processing Complete',
  'failed': 'Processing Failed'
}

export default function ProcessingStatus({ meetingId, onComplete, onError }: ProcessingStatusProps) {
  const [status, setStatus] = useState<MeetingStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!meetingId || !isPolling) return

    const pollStatus = async () => {
      try {
        const currentStatus = await apiClient.getMeetingStatus(meetingId)
        console.log('backend-status:', currentStatus)
        setStatus(currentStatus)
        setError(null)

        if (currentStatus.status === 'completed') {
          console.log('< --- INFOMATION --- > Processing completed, stopping polling')
          setIsPolling(false)
          setTimeout(() => onComplete?.(), 100)
          return
        } else if (currentStatus.status === 'failed') {
          setIsPolling(false)
          const errorMessage = currentStatus.error || 'Processing failed'
          setError(errorMessage)
          onError?.(errorMessage)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get status'
        setError(errorMessage)
        setIsPolling(false)
        onError?.(errorMessage)
      }
    }

    // Initial poll
    pollStatus()

    // Set up polling interval
    const interval = setInterval(pollStatus, 2000)

    return () => clearInterval(interval)
  }, [meetingId, isPolling, onComplete, onError])

  const handleRetry = () => {
    setError(null)
    setIsPolling(true)
  }

  if (error) {
    return (
      <Card className="glass-card border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Processing Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">{error}</p>
          <Button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading status...
          </div>
        </CardContent>
      </Card>
    )
  }

  const IconComponent = stageIcons[status.stage as keyof typeof stageIcons] || Loader2
  const stageLabel = stageLabels[status.stage as keyof typeof stageLabels] || status.stage

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stage */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <IconComponent className={`w-6 h-6 ${
              status.status === 'processing' ? 'text-purple-400 animate-pulse' :
              status.status === 'completed' ? 'text-green-400' :
              status.status === 'failed' ? 'text-red-400' :
              'text-gray-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{stageLabel}</h3>
            <p className="text-gray-400 text-sm">
              {status.status === 'processing' ? 'In progress...' :
               status.status === 'completed' ? 'Successfully completed' :
               status.status === 'failed' ? 'Failed to process' :
               'Waiting to start...'}
            </p>
          </div>
          <Badge className={`${
            status.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            status.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            status.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{status.progress || 0}%</span>
          </div>
          <Progress 
            value={status.progress || 0} 
            className="h-2"
          />
        </div>

        {/* Processing Stages */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm">Processing Pipeline</h4>
          <div className="space-y-2">
            {[
              { key: 'audio_processing', label: 'Audio Processing' },
              { key: 'speaker_diarization', label: 'Speaker Diarization' },
              { key: 'transcription', label: 'Speech Transcription' },
              { key: 'generating_summary', label: 'AI Analysis & Summary' }
            ].map((stage, index) => {
              const isCompleted = status.status === 'completed' || 
                (status.status === 'processing' && 
                 ['audio_processing', 'speaker_diarization', 'transcription', 'generating_summary'].indexOf(status.stage) > 
                 ['audio_processing', 'speaker_diarization', 'transcription', 'generating_summary'].indexOf(stage.key))
              
              const isCurrent = status.stage === stage.key
              
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500/20 text-green-400' :
                    isCurrent ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isCompleted ? 'text-green-400' :
                    isCurrent ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estimated Time */}
        {status.status === 'processing' && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-sm">
              <Brain className="w-4 h-4 inline mr-2" />
              AI processing typically takes 2-5 minutes depending on file size
            </p>
          </div>
        )}

        {/* Success Message */}
        {status.status === 'completed' && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Processing completed successfully! You can now view the transcript and AI analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}