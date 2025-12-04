import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
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
  getLessons, 
  createLesson, 
  updateLesson, 
  deleteLesson
} from '../../services/admin/lessonsService'
import { getSubjects } from '../../services/admin/subjectsService'

// Note: Subjects are now fetched from database
export function Lessons() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [lessons, setLessons] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: undefined, // Use undefined instead of empty string
    chapter: 1,
    order: 1,
    difficulty: 'medium',
    duration: 30,
    videoUrl: '',
    isPremium: false,
    isVisible: true,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await Promise.all([
          loadSubjects(),
          loadLessons()
        ])
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true)
      const response = await getSubjects({ limit: 100, status: 'active' })
      const subjectsData = response.data?.subjects || response.subjects || response.data || []
      setSubjects(subjectsData)
      // Set default subject if none selected and subjects available
      if ((!formData.subject || formData.subject.trim() === '') && subjectsData.length > 0) {
        // Find first valid subject with non-empty value
        const validSubject = subjectsData.find(s => {
          const val = s.slug || s._id || s.name?.toLowerCase()
          return val && val.trim() !== ''
        })
        if (validSubject) {
          const defaultSubject = validSubject.slug || validSubject._id || validSubject.name?.toLowerCase()
          if (defaultSubject && defaultSubject.trim() !== '') {
            setFormData(prev => ({ ...prev, subject: defaultSubject }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setSubjectsLoading(false)
    }
  }

  const loadLessons = async () => {
    try {
      setLoading(true)
      const response = await getLessons({ limit: 1000 })
      // Handle different response structures
      const lessonsData = response.data?.lessons || response.lessons || response.data || []
      setLessons(Array.isArray(lessonsData) ? lessonsData : [])
    } catch (error) {
      console.error('Failed to load lessons:', error)
      toast.error('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || lesson.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleOpenDialog = (lesson) => {
    if (lesson) {
      setEditingLesson(lesson)
      // Get subject - match by slug or find by name
      let subjectValue = ''
      if (lesson.subject) {
        const matchedSubject = subjects.find(s => 
          s.slug === lesson.subject || 
          s._id === lesson.subject || 
          s.name?.toLowerCase() === lesson.subject?.toLowerCase()
        )
        subjectValue = matchedSubject ? (matchedSubject.slug || matchedSubject._id) : lesson.subject
      }
      
      setFormData({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        subject: subjectValue,
        chapter: lesson.chapter,
        order: lesson.order,
        difficulty: lesson.difficulty,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl || '',
        isPremium: lesson.isPremium,
        isVisible: lesson.isVisible,
      })
    } else {
      setEditingLesson(null)
      // Get default subject - ensure it's not empty
      let defaultSubject = ''
      if (subjects.length > 0) {
        const firstSubject = subjects[0]
        defaultSubject = firstSubject.slug || firstSubject._id || firstSubject.name?.toLowerCase() || ''
        // If still empty, try to find a valid subject
        if (!defaultSubject || defaultSubject.trim() === '') {
          const validSubject = subjects.find(s => {
            const val = s.slug || s._id || s.name?.toLowerCase()
            return val && val.trim() !== ''
          })
          defaultSubject = validSubject ? (validSubject.slug || validSubject._id || validSubject.name?.toLowerCase() || '') : ''
        }
      }
      setFormData({
        title: '',
        description: '',
        content: '',
        subject: defaultSubject || undefined, // Use undefined instead of empty string
        chapter: 1,
        order: 1,
        difficulty: 'medium',
        duration: 30,
        videoUrl: '',
        isPremium: false,
        isVisible: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingLesson(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validation
    if (!formData.title || !formData.title.trim()) {
      toast.error('Lesson title is required')
      return
    }

    if (!formData.description || !formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    if (!formData.content || !formData.content.trim()) {
      toast.error('Content is required')
      return
    }

    if (formData.chapter < 1) {
      toast.error('Chapter must be at least 1')
      return
    }

    if (formData.order < 1) {
      toast.error('Order must be at least 1')
      return
    }

    // Ensure content is not empty (use description if content is empty)
    if (!formData.content || !formData.content.trim()) {
      formData.content = formData.description || formData.title || 'Lesson content'
    }

    // Validate subject
    if (!formData.subject || (typeof formData.subject === 'string' && formData.subject.trim() === '')) {
      toast.error('Subject is required')
      return
    }

    setSubmitting(true)
    
    try {
      // Prepare lesson data - ensure no class field is sent
      const lessonData = {
        title: formData.title,
        description: formData.description,
        content: formData.content || formData.description || formData.title || 'Lesson content',
        subject: formData.subject,
        chapter: formData.chapter,
        order: formData.order,
        difficulty: formData.difficulty,
        duration: formData.duration,
        videoUrl: formData.videoUrl || '',
        isPremium: formData.isPremium,
        isVisible: formData.isVisible,
      }
      
      if (editingLesson) {
        await updateLesson(editingLesson._id, lessonData)
        // Toast is already shown by API client
      } else {
        await createLesson(lessonData)
        // Toast is already shown by API client
      }
      await loadLessons()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save lesson:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = 'Failed to save lesson'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ')
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this lesson?',
      'Delete Lesson'
    )
    if (!confirmed) return
    
    try {
      await deleteLesson(id)
      // Toast is already shown by API client
      await loadLessons()
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      toast.error('Failed to delete lesson')
    }
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
          <h1 className="text-2xl md:text-3xl font-bold">Lessons</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all lessons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
              <DialogDescription>
                {editingLesson ? 'Update lesson details' : 'Create a new lesson'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Newton's Laws of Motion"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Lesson content (required)"
                    required
                    rows={4}
                    data-cursor="hover"
                  />
                  <p className="text-xs text-muted-foreground">
                    Detailed lesson content. This field is required.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  {subjectsLoading ? (
                    <div className="flex items-center justify-center p-2 border rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Select
                      value={formData.subject && formData.subject.trim() !== '' ? formData.subject : undefined}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger data-cursor="hover">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects && subjects.length > 0 ? (
                          subjects
                            .filter((subject) => {
                              // Filter out subjects without valid values
                              const value = subject.slug || subject._id || subject.name?.toLowerCase()
                              return value && value.trim() !== ''
                            })
                            .map((subject) => {
                              const subjectValue = subject.slug || subject._id || subject.name?.toLowerCase() || 'unknown'
                              const subjectName = subject.name || subject.slug || 'Unknown'
                              return (
                                <SelectItem key={subjectValue} value={subjectValue}>
                                  {subjectName}
                                </SelectItem>
                              )
                            })
                        ) : (
                          <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Chapter</Label>
                    <Input
                      id="chapter"
                      type="number"
                      min="1"
                      value={formData.chapter}
                      onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })}
                      required
                      data-cursor="hover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      required
                      data-cursor="hover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                      data-cursor="hover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    data-cursor="hover"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPremium"
                      checked={formData.isPremium}
                      onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isPremium" className="font-normal">Premium</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isVisible" className="font-normal">Visible</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  Cancel
                </Button>
                <Button type="submit" data-cursor="hover" disabled={submitting} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  {submitting ? 'Saving...' : (editingLesson ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-cursor="hover"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-cursor="hover">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects && subjects.length > 0 ? (
                  subjects
                    .filter((subject) => {
                      // Filter out subjects without valid values
                      const value = subject.slug || subject._id || subject.name?.toLowerCase()
                      return value && value.trim() !== ''
                    })
                    .map((subject) => {
                      const subjectValue = subject.slug || subject._id || subject.name?.toLowerCase() || 'unknown'
                      const subjectName = subject.name || subject.slug || 'Unknown'
                      return (
                        <SelectItem key={subjectValue} value={subjectValue}>
                          {subjectName}
                        </SelectItem>
                      )
                    })
                ) : (
                  <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base break-words">{lesson.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                      {(() => {
                        const matchedSubject = subjects.find(s => 
                          s.slug === lesson.subject || 
                          s._id === lesson.subject ||
                          s.name?.toLowerCase() === lesson.subject?.toLowerCase()
                        )
                        return matchedSubject?.name || lesson.subject?.toString().replace('-', ' ') || 'Unknown'
                      })()}
                    </span>
                    {lesson.isPremium && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs">
                        Premium
                      </span>
                    )}
                    {!lesson.isVisible && (
                      <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 text-xs">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">{lesson.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chapter {lesson.chapter} • Order: {lesson.order} • {lesson.duration} min
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(lesson)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(lesson._id)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredLessons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No lessons found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
