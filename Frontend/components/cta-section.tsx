"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50" />
      <div className="absolute inset-0 gradient-mesh opacity-40" />

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 glass-card rounded-full floating-animation opacity-20" />
      <div
        className="absolute bottom-10 right-10 w-16 h-16 glass-card rounded-lg floating-animation opacity-25"
        style={{ animationDelay: "3s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            Ready to transform your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              meeting experience?
            </span>
          </h2>

          <p className="text-xl text-gray-300 text-pretty mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using MeetFlow to collaborate more effectively and achieve better results.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href="/create-meeting">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 glow-effect px-8 py-4 text-lg"
              >
                Start Free Meeting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="glass-card border-white/20 hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <div className="text-gray-400 text-sm">Meetings Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
