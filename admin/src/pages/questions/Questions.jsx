import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit, Trash2, X, Upload } from 'lucide-react'
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
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion
} from '../../services/admin/questionsService'
import { getLessons } from '../../services/admin/lessonsService'
import { uploadImage } from '../../services/admin/imagesService'

export function Questions() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [questions, setQuestions] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [formData, setFormData] = useState({
    questionText: '',
    questionImage: null,
    answerText: '',
    answerImage: null,
    lessonId: '',
    order: 1,
    difficulty: 'medium',
    isPremium: false,
  })
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
      const [questionsResponse, lessonsResponse] = await Promise.all([
        getQuestions({ limit: 1000 }),
        getLessons({ limit: 1000 })
      ])
      // Handle response structure - API.get returns data directly or wrapped
      const questionsData = questionsResponse?.questions || questionsResponse || []
      const lessonsData = lessonsResponse?.lessons || lessonsResponse || []
      
      setQuestions(Array.isArray(questionsData) ? questionsData : [])
      setLessons(Array.isArray(lessonsData) ? lessonsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate if question should be premium based on order (first 6 are free)
  const calculateIsPremium = (order) => order > 6

  const filteredQuestions = questions.filter(
    (question) => {
      if (!question) return false
      const query = (searchQuery || '').toLowerCase()
      if (!query) return true
      const questionText = (question.questionText || '').toLowerCase()
      const lessonName = (question.lessonName || question.lesson?.title || '').toLowerCase()
      return questionText.includes(query) || lessonName.includes(query)
    }
  )

  const handleOpenSlideOver = (question) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        questionText: question.questionText,
        questionImage: question.questionImage,
        answerText: question.answerText,
        answerImage: question.answerImage,
        lessonId: question.lessonId,
        order: question.order,
        difficulty: question.difficulty,
        isPremium: question.isPremium,
      })
    } else {
      setEditingQuestion(null)
      setFormData({
        questionText: '',
        questionImage: null,
        answerText: '',
        answerImage: null,
        lessonId: '',
        order: 1,
        difficulty: 'medium',
        isPremium: false,
      })
    }
    setIsSlideOverOpen(true)
  }

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false)
    setEditingQuestion(null)
    setFormData({
      questionText: '',
      questionImage: null,
      answerText: '',
      answerImage: null,
      lessonId: '',
      order: 1,
      difficulty: 'medium',
      isPremium: false,
    })
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    try {
      // Show loading state
      toast.loading(`Uploading ${type} image...`, { id: `upload-${type}` })
      
      const imageData = await uploadImage({
        image: file,
        title: `${type} image for question`,
        category: 'question'
      }, (progress) => {
        // Optional: show upload progress
        console.log(`Upload progress: ${progress}%`)
      })
      
      toast.dismiss(`upload-${type}`)
      
      if (imageData && imageData.url) {
        const imageObj = {
          url: imageData.url,
          publicId: imageData.publicId || ''
        }
        
        if (type === 'question') {
          setFormData((prev) => ({ ...prev, questionImage: imageObj }))
        } else {
          setFormData((prev) => ({ ...prev, answerImage: imageObj }))
        }
        toast.success(`${type} image uploaded successfully`)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      toast.dismiss(`upload-${type}`)
      console.error('Error uploading image:', error)
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      })
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to upload image'
      toast.error(errorMessage)
    }
  }

  const handleRemoveImage = (type) => {
    if (type === 'question') {
      setFormData((prev) => ({ ...prev, questionImage: null }))
    } else {
      setFormData((prev) => ({ ...prev, answerImage: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.lessonId) {
      toast.error('Please select a lesson')
      return
    }

    if (!formData.questionText || !formData.questionText.trim()) {
      toast.error('Question text is required')
      return
    }

    if (!formData.answerText || !formData.answerText.trim()) {
      toast.error('Answer text is required')
      return
    }

    if (formData.order < 1) {
      toast.error('Order must be at least 1')
      return
    }

    const lesson = lessons.find((l) => l._id === formData.lessonId)
    
    if (!lesson) {
      toast.error('Lesson not found')
      return
    }

    // Map subject slug to enum value
    const subjectSlug = String(lesson.subject || 'physics').toLowerCase().trim()
    const subjectMap = {
      'math': 'mathematics',
      'mathematics': 'mathematics',
      'physics': 'physics',
      'chemistry': 'chemistry',
      'biology': 'biology',
      'computer-science': 'computer-science',
      'cs': 'computer-science',
      'computer science': 'computer-science'
    }
    const mappedSubject = subjectMap[subjectSlug] || 'physics'

    // Auto-calculate isPremium based on order (first 6 free)
    const isPremium = calculateIsPremium(formData.order)

    setSubmitting(true)
    
    try {
      // Handle answer image
      let answerImageData = null
      if (formData.answerImage) {
        if (typeof formData.answerImage === 'string') {
          answerImageData = { url: formData.answerImage, publicId: '' }
        } else if (formData.answerImage.url) {
          answerImageData = {
            url: formData.answerImage.url,
            publicId: formData.answerImage.publicId || ''
          }
        }
      }

      // Map frontend form data to backend format
      const questionData = {
        questionText: formData.questionText.trim(),
        explanation: (formData.answerText || formData.explanation || '').trim(),
        lesson: formData.lessonId,
        subject: mappedSubject, // Use mapped subject
        class: '9th', // Default class since Lesson model doesn't have class field
        chapter: lesson.chapter || 1,
        difficulty: formData.difficulty || 'medium',
        order: formData.order || 1,
        isPremium: isPremium,
        isVisible: true,
        // Handle question image
        questionImage: formData.questionImage ? {
          url: typeof formData.questionImage === 'string' ? formData.questionImage : (formData.questionImage.url || formData.questionImage),
          publicId: formData.questionImage.publicId || ''
        } : null,
        // Create options array - include answer text as an option
        options: formData.options && formData.options.length > 0 ? formData.options.map((opt, index) => ({
          text: typeof opt === 'string' ? opt : (opt.text || opt),
          image: opt.image || (index === 0 && answerImageData ? answerImageData : null),
          isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : (index === 0)
        })) : [{
          text: formData.answerText || 'Answer',
          image: answerImageData,
          isCorrect: true
        }],
        correctAnswer: formData.correctAnswer !== undefined ? parseInt(formData.correctAnswer) : 0,
        type: formData.type || 'mcq',
        hint: formData.hint || null
      }
      
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, questionData)
        // Toast is already shown by API client
      } else {
        await createQuestion(questionData)
        // Toast is already shown by API client
      }
      await loadData()
      handleCloseSlideOver()
    } catch (error) {
      console.error('Failed to save question:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to save question'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this question?',
      'Delete Question'
    )
    if (!confirmed) return
    
    try {
      await deleteQuestion(id)
      // Toast is already shown by API client
      await loadData()
    } catch (error) {
      console.error('Failed to delete question:', error)
      toast.error(error.message || 'Failed to delete question')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500'
      case 'medium':
        return 'text-yellow-500'
      case 'hard':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
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
          <h1 className="text-2xl md:text-3xl font-bold">Questions</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all questions</p>
        </div>
        <Button onClick={() => handleOpenSlideOver()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-cursor="hover"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <p className="font-medium text-sm md:text-base break-words">{question.questionText}</p>
                    {question.questionImage && (
                      <div className="mt-2" style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        flexShrink: 0
                      }}>
                        <img
                          src={typeof question.questionImage === 'string' 
                            ? question.questionImage 
                            : question.questionImage.url}
                          alt="Question"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Lesson: {question.lessonName || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      Order: {question.order}
                    </span>
                    <span className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty.toUpperCase()}
                    </span>
                    {question.isPremium ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                        Premium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500">
                        Free
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Created: {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenSlideOver(question)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(question._id)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No questions found</div>
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
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-background border-b border-border p-4 md:p-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold flex-1 min-w-0 pr-2">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
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
                  <Label htmlFor="order">Question Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    required
                    data-cursor="hover"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.order <= 6 ? (
                      <span className="text-green-500">✓ This question will be FREE (first 6 questions)</span>
                    ) : (
                      <span className="text-amber-500">⚠ This question will be PREMIUM (order &gt; 6)</span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="Enter the question text..."
                    rows={4}
                    required
                    data-cursor="hover"
                  />
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="questionImage">Question Image (Optional)</Label>
                    {formData.questionImage ? (
                      <div className="relative group">
                        <img
                          src={typeof formData.questionImage === 'string' ? formData.questionImage : formData.questionImage.url}
                          alt="Question"
                          className="w-full max-h-48 object-contain rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage('question')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('question-image-upload')?.click()}
                        data-cursor="hover"
                        className="touch-manipulation min-h-[44px] md:min-h-0"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Question Image
                      </Button>
                    )}
                    <input
                      id="question-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'question')}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Answer</Label>
                  <Textarea
                    id="answerText"
                    value={formData.answerText}
                    onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
                    placeholder="Enter the answer text..."
                    rows={3}
                    required
                    data-cursor="hover"
                  />
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="answerImage">Answer Image (Optional)</Label>
                    {formData.answerImage ? (
                      <div className="relative group">
                        <img
                          src={typeof formData.answerImage === 'string' ? formData.answerImage : formData.answerImage.url}
                          alt="Answer"
                          className="w-full max-h-48 object-contain rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage('answer')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('answer-image-upload')?.click()}
                        data-cursor="hover"
                        className="touch-manipulation min-h-[44px] md:min-h-0"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Answer Image
                      </Button>
                    )}
                    <input
                      id="answer-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'answer')}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
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

                <div className="rounded-lg border p-4 bg-blue-500/5">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-500">
                    Auto Premium Rule
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    First 6 questions (order 1-6) are free. Questions from order 7+ are premium automatically.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button type="button" variant="outline" onClick={handleCloseSlideOver} className="flex-1 touch-manipulation min-h-[44px] md:min-h-0">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 touch-manipulation min-h-[44px] md:min-h-0" data-cursor="hover" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingQuestion ? 'Update' : 'Create')}
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
