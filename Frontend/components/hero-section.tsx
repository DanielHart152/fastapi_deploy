"use client"

import { Button } from "@/components/ui/button"
import { Play, Users, Calendar, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      {/* Floating glass elements */}
      <div className="absolute top-20 left-10 w-32 h-32 glass-card rounded-full floating-animation opacity-30" />
      <div
        className="absolute top-40 right-20 w-24 h-24 glass-card rounded-lg floating-animation opacity-20"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-40 left-20 w-20 h-20 glass-card rounded-full floating-animation opacity-25"
        style={{ animationDelay: "4s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-sm text-purple-300">✨ New: AI-Powered Meeting Insights</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              The future of{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                cloud meetings
              </span>{" "}
              is here
            </h1>

            <p className="text-xl text-gray-300 text-pretty mb-8 max-w-2xl">
              Experience seamless collaboration with our liquid glass interface. Create, join, and manage meetings with
              unprecedented ease and style.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 glow-effect"
                onClick={async () => {
                  // Create instant meeting
                  const meetingData = {
                    title: `Quick Meeting - ${new Date().toLocaleDateString()}`,
                    description: 'Instant meeting started from homepage',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    duration: '60',
                    mode: 'real-time',
                    participants: [],
                    settings: {
                      onAgenda: false,
                      keywords: [],
                      decisionNumber: '',
                      adaCode: '',
                      aiFeatures: {
                        transcription: true,
                        speakerDiarization: true,
                        aiSummary: true,
                        topicExtraction: true,
                      },
                      isRecording: true,
                      isPrivate: false,
                      waitingRoom: false
                    }
                  }
                  
                  try {
                    const response = await fetch('/api/meetings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(meetingData)
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      window.location.href = `/room/${result.meeting.id}`
                    } else {
                      window.location.href = '/create-meeting'
                    }
                  } catch (error) {
                    window.location.href = '/create-meeting'
                  }
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Meeting
              </Button>
              <Link href="/join">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-white/20 hover:bg-white/10 bg-transparent"
                >
                  Join Meeting
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>50K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>1M+ Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>

          {/* Right Column - Glass Card Demo */}
          <div className="relative">
            <div className="glass-card p-8 rounded-2xl">
              <div className="space-y-6">
                {/* Meeting Preview */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                  <Play className="w-16 h-16 text-white/80" />
                  <div className="absolute top-4 left-4 glass-card px-3 py-1 rounded-full">
                    <span className="text-xs text-green-400">● LIVE</span>
                  </div>
                  <div className="absolute bottom-4 right-4 glass-card px-3 py-1 rounded-full">
                    <span className="text-xs">12 participants</span>
                  </div>
                </div>

                {/* Meeting Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Weekly Team Sync</h3>
                    <span className="text-sm text-purple-400">+150% engagement</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-400">98%</div>
                      <div className="text-xs text-gray-400">Uptime</div>
                    </div>
                    <div className="glass-card p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-pink-400">4K</div>
                      <div className="text-xs text-gray-400">Quality</div>
                    </div>
                    <div className="glass-card p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-400">AI</div>
                      <div className="text-xs text-gray-400">Powered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
