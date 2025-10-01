"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              touch
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <Card className="glass-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
              <CardContent className="p-6 flex items-center gap-4">
                <Mail className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Email</h3>
                  <p className="text-gray-300">support@openmeeting.com</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2">
              <CardContent className="p-6 flex items-center gap-4">
                <Phone className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Phone</h3>
                  <p className="text-gray-300">+1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <CardContent className="p-6 flex items-center gap-4">
                <MapPin className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Office</h3>
                  <p className="text-gray-300">123 Tech Street, San Francisco, CA 94105</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="First name" className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 transition-all duration-300" />
                <Input placeholder="Last name" className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 transition-all duration-300" />
              </div>
              <Input placeholder="Email" className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 transition-all duration-300" />
              <Input placeholder="Subject" className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 transition-all duration-300" />
              <Textarea placeholder="Message" rows={4} className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400 transition-all duration-300 resize-none" />
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}