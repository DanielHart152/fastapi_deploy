"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, Calendar, Shield, Zap, Globe, Lock, BarChart3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Video,
      title: "HD Video Meetings",
      description: "Crystal clear 4K video quality with advanced noise cancellation and real-time optimization.",
    },
    {
      icon: Users,
      title: "Unlimited Participants",
      description: "Host meetings with unlimited participants. Scale from 1-on-1 to enterprise-wide conferences.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered scheduling that finds the perfect time for all participants across time zones.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption, SSO integration, and compliance with SOC 2, GDPR, and HIPAA.",
    },
    {
      icon: Zap,
      title: "Instant Join",
      description: "One-click meeting access with no downloads required. Join from any device, anywhere.",
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description: "99.9% uptime with servers worldwide ensuring low latency and reliable connections.",
    },
    {
      icon: Lock,
      title: "Advanced Privacy",
      description: "Waiting rooms, meeting passwords, and granular permission controls for secure meetings.",
    },
    {
      icon: BarChart3,
      title: "Meeting Analytics",
      description: "Detailed insights on meeting engagement, participation, and productivity metrics.",
    },
  ]

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              perfect meetings
            </span>
          </h2>
          <p className="text-xl text-gray-300 text-pretty max-w-3xl mx-auto">
            Powerful features designed to make your meetings more productive, secure, and engaging than ever before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card hover:glow-effect transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
