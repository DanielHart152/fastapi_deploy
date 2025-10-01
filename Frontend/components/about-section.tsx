"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              OpenMeeting
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make remote collaboration seamless, secure, and accessible for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Our Story</h3>
            <p className="text-gray-300 leading-relaxed">
              Founded in 2024, OpenMeeting was born from the need for better remote communication tools. 
              We believe that distance shouldn't be a barrier to meaningful collaboration and connection.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our team of passionate developers and designers work tirelessly to create the most intuitive, 
              secure, and feature-rich meeting platform available.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="glass-card text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white">10M+</div>
                <div className="text-gray-300 text-sm">Active Users</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2">
              <CardContent className="p-6">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-gray-300 text-sm">Uptime</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-gray-300 text-sm">Countries</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}