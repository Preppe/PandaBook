"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { uploadFileWithProgress } from "@/lib/api"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"]
const ACCEPTED_AUDIO_TYPES = ["audio/mp3", "audio/mpeg", "audio/m4a"]

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  coverImage: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be less than 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Please upload a JPG or PNG image"
    ),
  audioFile: z
    .instanceof(File)
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file.type),
      "Please upload an MP3 or M4A audio file"
    ),
})

type FormData = z.infer<typeof formSchema>

export default function UploadPage() {
  const { toast } = useToast()
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [uploadController, setUploadController] = useState<AbortController | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
    },
  })

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      form.setValue("coverImage", file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      form.setValue("audioFile", file)
    }
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

  const onSubmit = async (data: FormData) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadSpeed(0)
    setTimeRemaining(0)

    // Create AbortController for cancellation
    const controller = new AbortController()
    setUploadController(controller)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('author', data.author)
      formData.append('description', data.description)
      formData.append('cover', data.coverImage)
      formData.append('audio', data.audioFile)

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
      form.reset()
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
    form.setValue("coverImage", undefined as any)
    setCoverPreview(null)
  }

  const removeAudioFile = () => {
    form.setValue("audioFile", undefined as any)
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Audiobook Details</CardTitle>
              <CardDescription>Fill in the information about your audiobook.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Author <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cover Image <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="cover-image"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border"
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
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audioFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Audio File <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="audio-file"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border"
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center justify-center p-4 relative w-full">
                              <div className="text-center">
                                <p className="font-medium truncate max-w-xs">{field.value.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(field.value.size / (1024 * 1024)).toFixed(2)} MB
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                {form.watch("audioFile") && form.watch("audioFile")?.size > 10 * 1024 * 1024 && (
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
                disabled={!isUploading && !form.formState.isValid}
              >
                {isUploading ? "Cancel Upload" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isUploading || !form.formState.isValid}>
                {isUploading ? "Uploading..." : "Upload Audiobook"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
