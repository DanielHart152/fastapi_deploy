"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Navigation,
  Users,
  Clock,
  Building,
  Car,
  Search,
  Maximize2,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"

interface LocationMention {
  id: string
  location: string
  coordinates: { lat: number; lng: number }
  mentions: number
  context: string
  timestamp: string
  speakers: string[]
  category: "office" | "remote" | "travel" | "venue" | "client"
  importance: "high" | "medium" | "low"
}

interface LocationMapProps {
  mentions: LocationMention[]
  className?: string
}

// Dynamic import to avoid SSR issues
const MapComponent = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => (
    <div className="aspect-video rounded-lg bg-slate-800 flex items-center justify-center">
      <div className="text-white/60 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-2" />
        <p>Loading map...</p>
      </div>
    </div>
  )
})

export default function LocationMap({ mentions, className = "" }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationMention | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredMentions = mentions.filter((mention) => {
    const matchesSearch =
      mention.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mention.context.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterCategory === "all" || mention.category === filterCategory
    return matchesSearch && matchesFilter
  })

  const getCategoryIcon = (category: LocationMention["category"]) => {
    switch (category) {
      case "office":
        return <Building className="w-4 h-4" />
      case "remote":
        return <Users className="w-4 h-4" />
      case "travel":
        return <Car className="w-4 h-4" />
      case "venue":
        return <MapPin className="w-4 h-4" />
      case "client":
        return <Building className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: LocationMention["category"]) => {
    switch (category) {
      case "office":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "remote":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "travel":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "venue":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "client":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getImportanceColor = (importance: LocationMention["importance"]) => {
    switch (importance) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 pr-2 pl-2 rounded-lg glass-card border-white/20 bg-white/5 backdrop-blur-md text-white text-sm"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Categories</option>
            <option value="office" style={{ backgroundColor: '#1f2937', color: 'white' }}>Office</option>
            <option value="remote" style={{ backgroundColor: '#1f2937', color: 'white' }}>Remote</option>
            <option value="travel" style={{ backgroundColor: '#1f2937', color: 'white' }}>Travel</option>
            <option value="venue" style={{ backgroundColor: '#1f2937', color: 'white' }}>Venue</option>
            <option value="client" style={{ backgroundColor: '#1f2937', color: 'white' }}>Client</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="glass-card border-white/20 bg-transparent"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Controls - Show in fullscreen */}
      {isFullscreen && (
        <div className="fixed top-4 left-4 right-4 z-[60] flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg glass-card border-white/20 bg-white/5 backdrop-blur-md text-white text-sm"
              style={{ colorScheme: 'dark' }}
            >
              <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Categories</option>
              <option value="office" style={{ backgroundColor: '#1f2937', color: 'white' }}>Office</option>
              <option value="remote" style={{ backgroundColor: '#1f2937', color: 'white' }}>Remote</option>
              <option value="travel" style={{ backgroundColor: '#1f2937', color: 'white' }}>Travel</option>
              <option value="venue" style={{ backgroundColor: '#1f2937', color: 'white' }}>Venue</option>
              <option value="client" style={{ backgroundColor: '#1f2937', color: 'white' }}>Client</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="glass-card border-white/20 bg-transparent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      
        {/* Location List - Below Map */}
        {!isFullscreen && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Location Mentions ({filteredMentions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMentions.map((mention) => (
                  <div
                    key={mention.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedLocation?.id === mention.id
                        ? "bg-purple-500/20 border-purple-500/30 glow-effect"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedLocation(mention)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm">{mention.location}</h4>
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            {mention.mentions}x
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2">{mention.context}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mention.timestamp}
                      </div>
                      <div className="flex gap-1">
                        <Badge className={getCategoryColor(mention.category)} size="sm">{getCategoryIcon(mention.category)}</Badge>
                        <Badge className={getImportanceColor(mention.importance)} size="sm">{mention.importance}</Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMentions.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No locations found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
      <div className={`${isFullscreen ? 'fixed inset-0 z-[50] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'space-y-2'}`}>
        {/* Interactive Map - Full Width */}
        <Card className={`glass-card ${isFullscreen ? 'h-full border-0' : ''}`}>
          {!isFullscreen && (
            <CardHeader className="pl-8 pr-8 pt-4 pb-0">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  Location Map
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="glass-card border-white/20 bg-transparent"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className={isFullscreen ? 'h-full p-2 pt-20' : 'p-4'}>
            <div className={isFullscreen ? 'h-full' : 'h-26'}>
              <MapComponent 
                mentions={filteredMentions}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                isFullscreen={isFullscreen}
              />
            </div>

            {/* Selected Location Details - Show in fullscreen as overlay */}
            {selectedLocation && (
              <div className={`${isFullscreen ? 'absolute top-24 right-4 w-80 z-[999]  bg-black/60' : 'mt-4  bg-black/2'} p-4 rounded-lg backdrop-blur-md border border-white/20`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{selectedLocation.location}</h4>
                    <p className="text-gray-400 text-sm">{selectedLocation.context}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(selectedLocation.category)}>
                      {getCategoryIcon(selectedLocation.category)}
                      <span className="ml-1 capitalize">{selectedLocation.category}</span>
                    </Badge>
                    <Badge className={getImportanceColor(selectedLocation.importance)}>
                      {selectedLocation.importance}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Mentions:</span>
                    <span className="text-white ml-2 font-medium">{selectedLocation.mentions}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-white ml-2 font-medium">{selectedLocation.timestamp}</span>
                  </div>
                </div>

                {selectedLocation.speakers.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Mentioned by:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocation.speakers.map((speaker) => (
                        <Badge key={speaker} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Location Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Locations</p>
                <p className="text-2xl font-bold text-white">{mentions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Most Mentioned</p>
                <p className="text-lg font-bold text-white">
                  {mentions.reduce((max, mention) => (mention.mentions > max.mentions ? mention : max), mentions[0])
                    ?.location || "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-white">
                  {mentions.filter((m) => m.importance === "high").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
