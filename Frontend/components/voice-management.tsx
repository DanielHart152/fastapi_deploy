"use client"

import { Mic, Upload, Play, Pause, Square, Scissors, Save, Trash2, Volume2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface VoiceRecording {
  id: string
  name: string
  blob: Blob
  duration: number
  url: string
}

interface VoiceManagementProps {
  onVoiceprintSaved?: (voiceprintData: any) => void
}

export function VoiceManagement({ onVoiceprintSaved }: VoiceManagementProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [status, setStatus] = useState<string>("Ready to record or upload")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(blob)
        const newRecording: VoiceRecording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          blob,
          duration: recordingTime,
          url,
        }
        setRecordings((prev) => [...prev, newRecording])
        setCurrentRecording(newRecording)
        setStatus("Recording saved successfully")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setStatus("Recording in progress...")

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      setStatus("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type.startsWith("audio/") || file.type.startsWith("video/"))) {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)

      audio.onloadedmetadata = () => {
        const newRecording: VoiceRecording = {
          id: Date.now().toString(),
          name: file.name,
          blob: file,
          duration: audio.duration,
          url,
        }
        setRecordings((prev) => [...prev, newRecording])
        setCurrentRecording(newRecording)
        setDuration(audio.duration)
        setTrimEnd(audio.duration)
        setStatus("File uploaded successfully")
      }
    }
  }

  const playPause = () => {
    if (!currentRecording || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const saveVoiceprint = async () => {
    if (!currentRecording) return

    try {
      setStatus('Enrolling voice print...')
      
      const formData = new FormData()
      formData.append('audio', currentRecording.blob, 'voiceprint.wav')
      formData.append('speakerName', 'user_voice')
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/voice-print/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        onVoiceprintSaved?.(result.data)
        setStatus('Voice print enrolled successfully')
      } else {
        const error = await response.json()
        setStatus(`Enrollment failed: ${error.error}`)
      }
    } catch (error) {
      setStatus('Failed to enroll voice print')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (currentRecording && audioRef.current) {
      const audio = audioRef.current
      audio.src = currentRecording.url

      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => {
        setDuration(audio.duration)
        setTrimEnd(audio.duration)
      }
      const handleEnded = () => setIsPlaying(false)

      audio.addEventListener("timeupdate", updateTime)
      audio.addEventListener("loadedmetadata", updateDuration)
      audio.addEventListener("ended", handleEnded)

      return () => {
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("loadedmetadata", updateDuration)
        audio.removeEventListener("ended", handleEnded)
      }
    }
  }, [currentRecording])

  return (
    <div className="w-full p-6 rounded-2xl glass-card">
      <div className="mb-6">
        <h3 className="text-white font-semibold text-lg mb-2">Voice Management</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
          <span className="text-white/80 text-sm">{status}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              isRecording
                ? "bg-red-500/20 border border-red-400/30 hover:bg-red-500/30"
                : "bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium text-sm">Stop ({formatTime(recordingTime)})</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-sm">Record</span>
              </>
            )}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 transition-all"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">Upload</span>
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
      </div>

      {currentRecording && (
        <div className="space-y-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium text-sm">{currentRecording.name}</span>
            <span className="text-white/60 text-xs">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={playPause}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 hover:bg-green-500/30 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-green-400" />
              ) : (
                <Play className="w-4 h-4 text-green-400 ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveVoiceprint}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-400/30 hover:bg-green-500/30 transition-all"
          >
            <Save className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium text-sm">Save Voiceprint</span>
          </button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  )
}