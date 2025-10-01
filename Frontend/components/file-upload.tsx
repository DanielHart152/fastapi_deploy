"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, Play, Video, Music, FileText, Image } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile?: File | null
  accept?: string
  maxSize?: number // in MB
}

export default function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  accept = "*/*",
  maxSize = 500 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase()
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-blue-400" />
    if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-green-400" />
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-purple-400" />
    if (type.includes('text') || type.includes('document')) return <FileText className="w-8 h-8 text-orange-400" />
    return <File className="w-8 h-8 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    onFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleRemoveFile = () => {
    setUploadProgress(0)
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <Card 
          className={`glass-card border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragging 
              ? 'border-purple-400 bg-purple-500/10' 
              : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-purple-500/20' : 'bg-white/10'
              }`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">
                  {isDragging ? 'Drop your file here' : 'Upload Media File'}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-gray-500 text-xs">
                  Supports: Video (MP4, AVI, MOV), Audio (MP3, WAV, M4A), Documents (PDF, TXT)
                  <br />
                  Maximum file size: {maxSize}MB
                </p>
              </div>

              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{selectedFile.name}</h4>
                <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}
                
                {uploadProgress === 100 && (
                  <p className="text-xs text-green-400 mt-1">- Upload complete</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith('video/') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-card border-white/20 bg-transparent"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className="glass-card border-white/20 bg-transparent hover:bg-red-500/20 hover:border-red-500/30"
                  onClick={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}