"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Settings,
  RotateCcw,
  RotateCw
} from "lucide-react"

interface EnhancedAudioPlayerProps {
  audioUrl?: string
  videoUrl?: string
  youtubeUrl?: string
  onTimeUpdate?: (currentTime: number) => void
  onSeekTo?: (time: number) => void
  seekToTime?: number
  className?: string
}

export default function EnhancedAudioPlayer({
  audioUrl,
  videoUrl,
  youtubeUrl,
  onTimeUpdate,
  onSeekTo,
  seekToTime,
  className = ""
}: EnhancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const youtubeRef = useRef<HTMLIFrameElement>(null)
  const lastSeekTimeRef = useRef<number | undefined>(undefined)

  // Get current media element
  const getMediaElement = () => {
    if (youtubeUrl) return null // YouTube handled separately
    if (videoUrl) return videoRef.current
    if (audioUrl) return audioRef.current
    return null
  }

  // Format time display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (youtubeUrl && youtubeRef.current) {
      // YouTube iframe control via postMessage
      const command = isPlaying ? 'pauseVideo' : 'playVideo'
      youtubeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${command}","args":""}`,
        '*'
      )
      setIsPlaying(!isPlaying)
      return
    }

    const media = getMediaElement()
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play().catch(console.warn)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, youtubeUrl])

  // Handle seeking
  const handleSeek = useCallback((time: number) => {
    if (!isFinite(time) || time < 0) return
    

    const seekTime = Math.max(0, duration ? Math.min(time, duration) : time)
    console.log("Handle_seek duriation:", duration, time, seekTime);
    
    if (youtubeUrl && youtubeRef.current) {
      youtubeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${seekTime}, true]}`,
        '*'
      )
      setCurrentTime(seekTime)
      if (onSeekTo) onSeekTo(seekTime)
      return
    }

    const media = getMediaElement()
    if (!media) return
    
    try {
      media.currentTime = seekTime
      setCurrentTime(seekTime)
      if (onSeekTo) onSeekTo(seekTime)
    } catch (error) {
      console.warn('Failed to seek:', error)
    }
  }, [youtubeUrl, duration, onSeekTo])

  // Skip forward/backward
  const skipForward = () => handleSeek(Math.min(currentTime + 10, duration))
  const skipBackward = () => handleSeek(Math.max(currentTime - 10, 0))

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    
    if (youtubeUrl && youtubeRef.current) {
      youtubeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"setVolume","args":[${vol * 100}]}`,
        '*'
      )
    } else {
      const media = getMediaElement()
      if (media) media.volume = vol
    }
    setIsMuted(vol === 0)
  }

  // Toggle mute
  const toggleMute = () => {
    if (youtubeUrl && youtubeRef.current) {
      const command = isMuted ? 'unMute' : 'mute'
      youtubeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${command}","args":""}`,
        '*'
      )
      setIsMuted(!isMuted)
    } else {
      const media = getMediaElement()
      if (media) {
        if (isMuted) {
          media.volume = volume
          setIsMuted(false)
        } else {
          media.volume = 0
          setIsMuted(true)
        }
      }
    }
  }

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    
    if (youtubeUrl && youtubeRef.current) {
      youtubeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"setPlaybackRate","args":[${rate}]}`,
        '*'
      )
    } else {
      const media = getMediaElement()
      if (media) media.playbackRate = rate
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('=== CLICKED  audioRef.current:', audioRef.current, videoRef.current); // <-- NEW
    e.stopPropagation();
    e.preventDefault();         // ← add this
    e.nativeEvent.stopImmediatePropagation(); // ← and this
    
    if (!progressRef.current || !duration) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickRatio = clickX / rect.width
    const newTime = clickRatio * duration
    
    console.log("ProgressBar Clicked", newTime)

    handleSeek(newTime)
  }

  // Handle external seek requests (from transcript)
  useEffect(() => {
    if (seekToTime !== undefined && seekToTime !== lastSeekTimeRef.current) {
      lastSeekTimeRef.current = seekToTime
      handleSeek(seekToTime)
    }
  }, [seekToTime, handleSeek])

  // Media event handlers
  useEffect(() => {
    if (youtubeUrl) {
      // YouTube API message listener
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://www.youtube.com') return
        
        try {
          const data = JSON.parse(event.data)
          if (data.event === 'video-progress') {
            setCurrentTime(data.info.currentTime)
            setDuration(data.info.duration)
            if (onTimeUpdate) onTimeUpdate(data.info.currentTime)
          }
        } catch (e) {}
      }
      
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }

    // Set up event listeners after a short delay to ensure refs are ready
    const setupMediaListeners = () => {
      const media = getMediaElement()
      if (!media) return

      const handleTimeUpdate = () => {
        const time = media.currentTime
        setCurrentTime(time)
        if (onTimeUpdate) onTimeUpdate(time)
      }

      const handleLoadedMetadata = () => {
        setDuration(media.duration)
      }

      const handleEnded = () => setIsPlaying(false)
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      media.addEventListener('timeupdate', handleTimeUpdate)
      media.addEventListener('loadedmetadata', handleLoadedMetadata)
      media.addEventListener('ended', handleEnded)
      media.addEventListener('play', handlePlay)
      media.addEventListener('pause', handlePause)

      return () => {
        media.removeEventListener('timeupdate', handleTimeUpdate)
        media.removeEventListener('loadedmetadata', handleLoadedMetadata)
        media.removeEventListener('ended', handleEnded)
        media.removeEventListener('play', handlePlay)
        media.removeEventListener('pause', handlePause)
      }
    }

    const timer = setTimeout(setupMediaListeners, 100)
    return () => clearTimeout(timer)
  }, [youtubeUrl, videoUrl, audioUrl, onTimeUpdate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Don't handle shortcuts when typing
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skipBackward()
          break
        case 'ArrowRight':
          e.preventDefault()
          skipForward()
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange([Math.min(volume + 0.1, 1)])
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange([Math.max(volume - 0.1, 0)])
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlayPause, skipBackward, skipForward, volume, toggleMute])

  // Expose controls to global window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.mediaControls = {
        seekToTime: handleSeek,
        playMedia: togglePlayPause,
        pauseMedia: togglePlayPause
      }
    }
  }, [handleSeek, togglePlayPause])

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="p-0">
        <div ref={containerRef} className="relative">
          {/* Media Element */}
          {youtubeUrl ? (
            <div className="aspect-video bg-black rounded-t-lg relative overflow-hidden">
              <iframe
                ref={youtubeRef}
                className="w-full h-full"
                src={`${youtubeUrl.replace('watch?v=', 'embed/')}?enablejsapi=1&origin=${window.location.origin}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : videoUrl ? (
            <div className="aspect-video bg-black rounded-t-lg relative overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={videoUrl}
                preload="metadata"
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              />
            </div>
          ) : audioUrl ? (
            <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-t-lg relative overflow-hidden flex items-center justify-center">
              {/* <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                className="hidden"
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              /> */}
              {audioUrl && (
                <>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    preload="metadata"
                    style={{ width: 0, height: 0, opacity: 0 }} // invisible but present
                    onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                  />
                  <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-t-lg relative overflow-hidden flex items-center justify-center">
                    <div className="text-center">
                      <Volume2 className="w-16 h-16 text-white/60 mx-auto mb-4" />
                      <p className="text-white/80">Audio Player</p>
                    </div>
                  </div>
                </>
              )}
              <div className="text-center">
                <Volume2 className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-white/80">Audio Player</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-t-lg relative overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-white/80">No media file available</p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 relative"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Skip Backward */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={skipBackward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                {/* Play/Pause */}
                <Button
                  size="sm"
                  onClick={togglePlayPause}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                {/* Skip Forward */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={skipForward}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Time Display */}
                <div className="text-white text-sm ml-4">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Playback Rate */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlaybackRateChange(Math.max(0.5, playbackRate - 0.25))}
                    className="text-white hover:bg-white/20 text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <span className="text-white text-sm min-w-[3rem] text-center">
                    {playbackRate}x
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlaybackRateChange(Math.min(2, playbackRate + 0.25))}
                    className="text-white hover:bg-white/20 text-xs"
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Settings */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Fullscreen (for video) */}
                {(videoUrl || youtubeUrl) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (containerRef.current) {
                        if (!isFullscreen) {
                          containerRef.current.requestFullscreen()
                        } else {
                          document.exitFullscreen()
                        }
                        setIsFullscreen(!isFullscreen)
                      }
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-400 flex flex-wrap gap-4">
            <span><kbd className="bg-white/10 px-1 rounded">Space</kbd> Play/Pause</span>
            <span><kbd className="bg-white/10 px-1 rounded">←/→</kbd> Skip 10s</span>
            <span><kbd className="bg-white/10 px-1 rounded">↑/↓</kbd> Volume</span>
            <span><kbd className="bg-white/10 px-1 rounded">M</kbd> Mute</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}