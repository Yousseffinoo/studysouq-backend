import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit, Trash2, X, Upload, ImageIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import toast from 'react-hot-toast'
import { useConfirm } from '../../components/ui/confirm-dialog'
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote
} from '../../services/admin/notesService'
import { getLessons } from '../../services/admin/lessonsService'

export function Notes() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [notes, setNotes] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [formData, setFormData] = useState({
    lessonId: '',
    notesText: '',
    notesImages: [],
    isPremium: true,
  })
  const [imageFiles, setImageFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (isMounted) {
        await loadData()
      }
    }
    
    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notesResponse, lessonsResponse] = await Promise.all([
        getNotes({ limit: 1000 }),
        getLessons({ limit: 1000 })
      ])
      
      // Handle response structure - API.get returns data directly or wrapped
      const notesData = notesResponse?.notes || notesResponse || []
      const lessonsData = lessonsResponse?.lessons || lessonsResponse || []
      
      // Map backend fields to frontend format
      const mappedNotes = (Array.isArray(notesData) ? notesData : []).map(note => ({
        ...note,
        notesText: note.content || note.notesText || '', // Map content to notesText
        lessonName: note.lesson?.title || note.lessonName || 'Unknown Lesson', // Map lesson.title to lessonName
        lessonId: note.lesson?._id || note.lesson || note.lessonId || '', // Map lesson._id to lessonId
        notesImages: note.images || note.notesImages || [] // Map images to notesImages
      }))
      
      setNotes(mappedNotes)
      setLessons(Array.isArray(lessonsData) ? lessonsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(
    (note) => {
      if (!note) return false
      const query = (searchQuery || '').toLowerCase()
      if (!query) return true // Show all if no search query
      const lessonName = (note.lessonName || note.lesson?.title || '').toLowerCase()
      const notesText = (note.notesText || note.content || '').toLowerCase()
      return lessonName.includes(query) || notesText.includes(query)
    }
  )

  const handleOpenSlideOver = (note) => {
    if (note) {
      setEditingNote(note)
      setFormData({
        lessonId: note.lessonId || note.lesson?._id || note.lesson || '',
        notesText: note.notesText || note.content || '',
        notesImages: note.notesImages || note.images || [],
        isPremium: note.isPremium !== undefined ? note.isPremium : true,
      })
    } else {
      setEditingNote(null)
      setFormData({
        lessonId: '',
        notesText: '',
        notesImages: [],
        isPremium: true,
      })
    }
    setImageFiles([])
    setIsSlideOverOpen(true)
  }

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false)
    setEditingNote(null)
    setFormData({
      lessonId: '',
      notesText: '',
      notesImages: [],
      isPremium: true,
    })
    setImageFiles([])
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files])
      // Convert to base64 for preview (in production, you'd upload to cloud storage)
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            notesImages: [...prev.notesImages, reader.result],
          }))
        }
        reader.readAsDataURL(file)
      })
      toast.success('Images added successfully')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      notesImages: prev.notesImages.filter((_, i) => i !== index),
    }))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.lessonId) {
      toast.error('Please select a lesson')
      return
    }

    if (!formData.notesText || !formData.notesText.trim()) {
      toast.error('Notes content is required')
      return
    }

    const lesson = lessons.find((l) => l._id === formData.lessonId)
    
    if (!lesson) {
      toast.error('Lesson not found')
      return
    }

    setSubmitting(true)
    
    try {
      // Map frontend form data to backend format
      const noteData = {
        title: lesson.title || 'Untitled Note', // Use lesson title as note title
        content: formData.notesText, // Map notesText to content
        lesson: formData.lessonId, // Map lessonId to lesson
        subject: lesson.subject || 'physics', // Get from lesson
        class: lesson.class || '9th', // Get from lesson
        chapter: lesson.chapter || 1, // Get from lesson
        type: 'summary', // Default type
        isPremium: formData.isPremium !== undefined ? formData.isPremium : true,
        isVisible: true,
        // Map images - backend expects array of {url, caption, publicId}
        images: (formData.notesImages || []).map((img, index) => ({
          url: typeof img === 'string' ? img : img.url || img,
          caption: img.caption || '',
          publicId: img.publicId || ''
        }))
      }
      
      if (editingNote) {
        await updateNote(editingNote._id, noteData)
        // Toast is already shown by API client
      } else {
        await createNote(noteData)
        // Toast is already shown by API client
      }
      await loadData()
      handleCloseSlideOver()
    } catch (error) {
      console.error('Failed to save note:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to save note'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this note?',
      'Delete Note'
    )
    if (!confirmed) return
    
    try {
      await deleteNote(id)
      // Toast is already shown by API client
      await loadData()
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error(error.message || 'Failed to delete note')
    }
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notes</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage premium lesson notes</p>
        </div>
        <Button onClick={() => handleOpenSlideOver()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-cursor="hover"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm md:text-base break-words">{note.lessonName || 'Unknown Lesson'}</p>
                      {note.isPremium && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                      {stripHtml(note.notesText || note.content || '')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                    {(note.notesImages?.length > 0 || note.images?.length > 0) && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        {(note.notesImages || note.images || []).length} image(s)
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenSlideOver(note)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note._id)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notes found. All notes are premium by default.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={handleCloseSlideOver}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-3xl bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-background border-b border-border p-4 md:p-6 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-xl md:text-2xl font-bold">
                    {editingNote ? 'Edit Note' : 'Add New Note'}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Notes are premium-only content
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseSlideOver} className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex-shrink-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="lesson">Lesson</Label>
                  <Select
                    value={formData.lessonId}
                    onValueChange={(value) => setFormData({ ...formData, lessonId: value })}
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue placeholder="Select a lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson._id} value={lesson._id}>
                          {lesson.title} ({lesson.subject} - {lesson.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notesText">Notes Content</Label>
                  <Textarea
                    id="notesText"
                    value={formData.notesText}
                    onChange={(e) => setFormData({ ...formData, notesText: e.target.value })}
                    placeholder="Enter notes content (supports HTML/Markdown)..."
                    rows={12}
                    required
                    className="font-mono text-sm"
                    data-cursor="hover"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use HTML tags for formatting. For math formulas, use LaTeX or upload images.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Notes Images (Math formulas, diagrams, etc.)</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        data-cursor="hover"
                        className="touch-manipulation min-h-[44px] md:min-h-0"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Images
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.notesImages.length} image(s) uploaded
                      </span>
                    </div>
                    
                    {formData.notesImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.notesImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative group rounded-lg border overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Note image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-amber-500/5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <span className="text-sm font-medium">Premium Content</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All notes are premium-only and only accessible to subscribed users.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseSlideOver}
                    className="flex-1 touch-manipulation min-h-[44px] md:min-h-0"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 touch-manipulation min-h-[44px] md:min-h-0" data-cursor="hover" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingNote ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}
