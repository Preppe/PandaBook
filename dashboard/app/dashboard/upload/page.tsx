"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { uploadFileWithProgress } from "@/lib/api"

export default function UploadPage() {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [uploadController, setUploadController] = useState<AbortController | null>(null)
  const [errors, setErrors] = useState<{
    title?: string
    author?: string
    description?: string
    coverImage?: string
    audioFile?: string
  }>({})

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.includes("image/jpeg") && !file.type.includes("image/png")) {
        setErrors((prev) => ({ ...prev, coverImage: "Please upload a JPG or PNG image" }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, coverImage: "Image must be less than 5MB" }))
        return
      }

      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
      setErrors((prev) => ({ ...prev, coverImage: undefined }))
    }
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.includes("audio/mp3") && !file.type.includes("audio/mpeg") && !file.type.includes("audio/m4a")) {
        setErrors((prev) => ({ ...prev, audioFile: "Please upload an MP3 or M4A audio file" }))
        return
      }

      // File size validation removed - no more 100MB limit

      setAudioFile(file)
      setErrors((prev) => ({ ...prev, audioFile: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: {
      title?: string
      author?: string
      description?: string
      coverImage?: string
      audioFile?: string
    } = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!author.trim()) {
      newErrors.author = "Author is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (!coverImage) {
      newErrors.coverImage = "Cover image is required"
    }

    if (!audioFile) {
      newErrors.audioFile = "Audio file is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadSpeed(0)
    setTimeRemaining(0)

    // Create AbortController for cancellation
    const controller = new AbortController()
    setUploadController(controller)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('author', author)
      formData.append('description', description)
      if (coverImage) formData.append('cover', coverImage)
      if (audioFile) formData.append('audio', audioFile)

      await uploadFileWithProgress('/books', formData, {
        onProgress: (progress) => {
          setUploadProgress(progress)
        },
        onSpeedUpdate: (speed) => {
          setUploadSpeed(speed)
        },
        onTimeRemaining: (timeRemaining) => {
          setTimeRemaining(timeRemaining)
        },
        chunkSize: 10 * 1024 * 1024, // 10MB chunks for better performance
        signal: controller.signal,
      })

      // Reset form
      setTitle("")
      setAuthor("")
      setDescription("")
      setCoverImage(null)
      setAudioFile(null)
      setCoverPreview(null)

      toast({
        title: "Upload successful",
        description: "Your audiobook has been uploaded successfully.",
      })
    } catch (error) {
      if (controller.signal.aborted) {
        // Upload was cancelled, don't show error toast
        return
      }
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload audiobook",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setUploadSpeed(0)
      setTimeRemaining(0)
      setUploadController(null)
    }
  }

  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverPreview(null)
  }

  const removeAudioFile = () => {
    setAudioFile(null)
  }

  const cancelUpload = () => {
    if (uploadController) {
      uploadController.abort()
      setUploadController(null)
    }
    setIsUploading(false)
    setUploadProgress(0)
    setUploadSpeed(0)
    setTimeRemaining(0)
    toast({
      title: "Upload cancelled",
      description: "The upload has been cancelled.",
      variant: "destructive",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Audiobook</h1>
        <p className="text-muted-foreground">Add a new audiobook to your library.</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Audiobook Details</CardTitle>
            <CardDescription>Fill in the information about your audiobook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={errors.author ? "border-destructive" : ""}
              />
              {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "border-destructive" : ""}
                rows={4}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover-image">
                Cover Image <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="cover-image"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 ${
                        errors.coverImage ? "border-destructive" : "border-border"
                      }`}
                    >
                      {coverPreview ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={coverPreview || "/placeholder.svg"}
                            alt="Cover preview"
                            fill
                            className="object-contain p-2"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={removeCoverImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-redpanda-fur" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">JPG or PNG (Max 5MB)</p>
                        </div>
                      )}
                      <Input
                        id="cover-image"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                    </label>
                  </div>
                  {errors.coverImage && <p className="text-sm text-destructive mt-1">{errors.coverImage}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-file">
                Audio File <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="audio-file"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 ${
                    errors.audioFile ? "border-destructive" : "border-border"
                  }`}
                >
                  {audioFile ? (
                    <div className="flex flex-col items-center justify-center p-4 relative w-full">
                      <div className="text-center">
                        <p className="font-medium truncate max-w-xs">{audioFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={removeAudioFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-redpanda-fur" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">MP3 or M4A</p>
                    </div>
                  )}
                  <Input
                    id="audio-file"
                    type="file"
                    accept=".mp3,.m4a"
                    className="hidden"
                    onChange={handleAudioFileChange}
                  />
                </label>
              </div>
              {errors.audioFile && <p className="text-sm text-destructive mt-1">{errors.audioFile}</p>}
            </div>

            {isUploading && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Uploading your audiobook...</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3 bg-muted [&>div]:bg-redpanda-fur" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {uploadSpeed > 0 && `${formatBytes(uploadSpeed)}/s`}
                  </span>
                  <span>
                    {timeRemaining > 0 && `${formatTime(timeRemaining)} remaining`}
                  </span>
                </div>
                {audioFile && audioFile.size > 10 * 1024 * 1024 && (
                  <div className="text-xs text-muted-foreground">
                    Large file detected - using optimized chunked upload
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={isUploading ? cancelUpload : undefined}
              disabled={!isUploading && (Object.keys(errors).length > 0 || !title || !author || !description || !coverImage || !audioFile)}
            >
              {isUploading ? "Cancel Upload" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Audiobook"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
