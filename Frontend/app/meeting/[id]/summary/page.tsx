"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  CheckCircle,
  Download,
  Share2,
  Calendar,
  MapPin,
  BarChart3,
  LucidePieChart,
  Activity,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  Pie, // Import Pie from recharts
} from "recharts"

export default function MeetingSummaryPage() {
  const [selectedMetric, setSelectedMetric] = useState("topics")

  // Mock data for the meeting summary
  const meetingSummary = {
    title: "Weekly Team Sync",
    date: "January 15, 2024",
    duration: "45 minutes",
    totalTopics: 4,
    decisionsCount: 2,
    participantsCount: 8,
    aiConfidence: 0.89,
    keyInsights: [
      "Sprint review process needs optimization",
      "Technical debt prioritization agreed upon",
      "20% sprint capacity allocated to debt reduction",
      "User research needed for new features",
    ],
    actionItems: [
      {
        id: 1,
        task: "Implement automated sprint reporting",
        assignee: "Sarah Chen",
        dueDate: "2024-01-22",
        priority: "high",
      },
      {
        id: 2,
        task: "Create technical debt reduction plan",
        assignee: "Mike Rodriguez",
        dueDate: "2024-01-20",
        priority: "medium",
      },
      {
        id: 3,
        task: "Conduct user research for dashboard features",
        assignee: "Emily Watson",
        dueDate: "2024-01-25",
        priority: "low",
      },
    ],
  }

  const topicBreakdown = [
    { name: "Sprint Review", duration: 8, decisions: 1, participants: 6 },
    { name: "Blockers", duration: 12, decisions: 0, participants: 4 },
    { name: "Planning", duration: 15, decisions: 0, participants: 8 },
    { name: "Tech Debt", duration: 8, decisions: 1, participants: 5 },
  ]

  const speakingTimeData = [
    { name: "Sarah Chen", time: 12.5, percentage: 28 },
    { name: "Mike Rodriguez", time: 8.7, percentage: 19 },
    { name: "Emily Watson", time: 6.3, percentage: 14 },
    { name: "David Kim", time: 5.2, percentage: 12 },
    { name: "Others", time: 12.3, percentage: 27 },
  ]

  const sentimentData = [
    { name: "Positive", value: 65, color: "#10B981" },
    { name: "Neutral", value: 28, color: "#6B7280" },
    { name: "Negative", value: 7, color: "#EF4444" },
  ]

  const engagementOverTime = [
    { time: "0-10min", engagement: 85 },
    { time: "10-20min", engagement: 92 },
    { time: "20-30min", engagement: 78 },
    { time: "30-40min", engagement: 88 },
    { time: "40-45min", engagement: 82 },
  ]

  const locationMentions = [
    { location: "San Francisco Office", mentions: 3, context: "Team relocation discussion" },
    { location: "Remote Work", mentions: 5, context: "Hybrid work policy" },
    { location: "Conference Room B", mentions: 2, context: "Next meeting venue" },
    { location: "Client Site - NYC", mentions: 1, context: "Upcoming client visit" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Meeting Summary</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meetingSummary.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meetingSummary.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  AI Confidence: {Math.round(meetingSummary.aiConfidence * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
              <Button variant="outline" className="glass-card border-white/20 bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Topics</p>
                  <p className="text-2xl font-bold text-white">{meetingSummary.totalTopics}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Decisions Made</p>
                  <p className="text-2xl font-bold text-white">{meetingSummary.decisionsCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Participants</p>
                  <p className="text-2xl font-bold text-white">{meetingSummary.participantsCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Confidence</p>
                  <p className="text-2xl font-bold text-white">{Math.round(meetingSummary.aiConfidence * 100)}%</p>
                </div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meetingSummary.keyInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-xs font-medium">{index + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Breakdown Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Topic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Bar dataKey="duration" fill="#8B5CF6" name="Duration (min)" />
                      <Bar dataKey="participants" fill="#EC4899" name="Active Participants" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Speaking Time Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LucidePieChart className="w-5 h-5" />
                  Speaking Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={speakingTimeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="percentage"
                        >
                          {speakingTimeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${250 + index * 30}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F3F4F6",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {speakingTimeData.map((speaker, index) => (
                      <div key={speaker.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(${250 + index * 30}, 70%, 60%)` }}
                          />
                          <span className="text-white text-sm">{speaker.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm font-medium">{speaker.time}m</div>
                          <div className="text-gray-400 text-xs">{speaker.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Over Time */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Engagement Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Area type="monotone" dataKey="engagement" stroke="#8B5CF6" fill="url(#colorEngagement)" />
                      <defs>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Items */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meetingSummary.actionItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white text-sm font-medium">{item.task}</h4>
                        <Badge
                          className={`text-xs ${
                            item.priority === "high"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : item.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        <div>Assigned to: {item.assignee}</div>
                        <div>Due: {item.dueDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.map((sentiment) => (
                    <div key={sentiment.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{sentiment.name}</span>
                        <span className="text-gray-400 text-sm">{sentiment.value}%</span>
                      </div>
                      <Progress
                        value={sentiment.value}
                        className="h-2"
                        style={{
                          backgroundColor: "#374151",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Mentions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Mentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationMentions.map((location, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white text-sm font-medium">{location.location}</h4>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {location.mentions}x
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{location.context}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Average Speaking Time</span>
                  <span className="text-white font-medium">5.6 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Most Active Speaker</span>
                  <span className="text-white font-medium">Sarah Chen</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Topics per Hour</span>
                  <span className="text-white font-medium">5.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Decision Rate</span>
                  <span className="text-white font-medium">50%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
