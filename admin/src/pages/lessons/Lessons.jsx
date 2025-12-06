import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  ConfirmDialog,
  Pagination,
  SearchInput,
  EmptyState,
  PageSpinner,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import {
  useLessons,
  useSubjects,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/hooks/useApi'
import { formatDate, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function Lessons() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [deleteLesson, setDeleteLesson] = useState(null)

  const { data, isLoading } = useLessons({
    page,
    limit: 10,
    search,
    subject: subjectFilter,
  })

  const { data: subjectsData } = useSubjects({ limit: 100 })

  const createMutation = useCreateLesson()
  const updateMutation = useUpdateLesson()
  const deleteMutation = useDeleteLesson()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      subject: '',
      chapter: 1,
      order: 0,
      difficulty: 'medium',
      duration: 30,
      notesContent: '',
      notesSummary: '',
      isPremium: false,
      isVisible: true,
    },
  })

  const watchSubject = watch('subject')
  const watchDifficulty = watch('difficulty')
  const watchIsPremium = watch('isPremium')
  const watchIsVisible = watch('isVisible')
  const watchNotesContent = watch('notesContent')

  const openForm = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson)
      reset({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        subject: lesson.subject,
        chapter: lesson.chapter || 1,
        order: lesson.order || 0,
        difficulty: lesson.difficulty || 'medium',
        duration: lesson.duration || 30,
        notesContent: lesson.notes?.content || '',
        notesSummary: lesson.notes?.summary || '',
        isPremium: lesson.isPremium || false,
        isVisible: lesson.isVisible !== false,
      })
    } else {
      setEditingLesson(null)
      reset({
        title: '',
        description: '',
        content: '',
        subject: '',
        chapter: 1,
        order: 0,
        difficulty: 'medium',
        duration: 30,
        notesContent: '',
        notesSummary: '',
        isPremium: false,
        isVisible: true,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingLesson(null)
    reset()
  }

  const onSubmit = async (formData) => {
    console.log('=== FORM SUBMITTED ===')
    console.log('Form data:', formData)
    console.log('Editing lesson:', editingLesson)
    
    if (!formData.subject) {
      toast.error('Please select a subject')
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      subject: formData.subject,
      chapter: Number(formData.chapter) || 1,
      order: Number(formData.order) || 0,
      difficulty: formData.difficulty || 'medium',
      duration: Number(formData.duration) || 30,
      isPremium: Boolean(formData.isPremium),
      isVisible: formData.isVisible !== false,
    }

    // Only include notes if content exists
    if (formData.notesContent?.trim() || formData.notesSummary?.trim()) {
      payload.notes = {
        content: formData.notesContent?.trim() || '',
        summary: formData.notesSummary?.trim() || '',
      }
    }

    console.log('Payload to send:', payload)

    try {
      if (editingLesson) {
        console.log('Updating lesson:', editingLesson._id)
        const result = await updateMutation.mutateAsync({
          id: editingLesson._id,
          data: payload,
        })
        console.log('Update result:', result)
      } else {
        console.log('Creating new lesson')
        const result = await createMutation.mutateAsync(payload)
        console.log('Create result:', result)
      }
      closeForm()
    } catch (error) {
      console.error('=== ERROR ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error status:', error.status)
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteLesson) return
    try {
      await deleteMutation.mutateAsync(deleteLesson._id)
      toast.success('Lesson deleted successfully')
      setDeleteLesson(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const lessons = data?.lessons || []
  const totalPages = data?.totalPages || 1
  const subjects = subjectsData?.subjects || []

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Manage lessons across all subjects"
        breadcrumbs={[{ label: 'Lessons' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search lessons..."
          className="sm:w-80"
        />
        <Select 
          value={subjectFilter || 'all'} 
          onValueChange={(value) => setSubjectFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject._id} value={subject.slug || subject._id}>
                {subject.name} ({subject.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {lessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lessons found"
          description="Get started by creating your first lesson"
          action={
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {lesson.title}
                          {!lesson.isVisible && (
                            <EyeOff className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="text-sm text-neutral-500 line-clamp-1">
                          {truncate(lesson.description, 60)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lesson.subject}</Badge>
                    </TableCell>
                    <TableCell>{lesson.chapter}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lesson.difficulty === 'hard'
                            ? 'destructive'
                            : lesson.difficulty === 'easy'
                            ? 'success'
                            : 'secondary'
                        }
                      >
                        {lesson.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lesson.isPremium && <Badge className="mr-1">Premium</Badge>}
                      <Badge variant={lesson.isVisible ? 'success' : 'secondary'}>
                        {lesson.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(lesson.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(lesson)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteLesson(lesson)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4 border-b border-neutral-200 pb-6">
              <h3 className="text-sm font-semibold text-neutral-900">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={watchSubject}
                  onValueChange={(value) => setValue('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject.slug || subject._id}>
                        {subject.name} ({subject.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., Introduction to Newton's Laws"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Brief description of the lesson"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Lesson Content *</Label>
                <Textarea
                  id="content"
                  {...register('content', { required: 'Content is required' })}
                  placeholder="Main lesson content (supports Markdown)"
                  rows={6}
                  className="font-mono text-sm"
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter *</Label>
                  <Input
                    id="chapter"
                    type="number"
                    min="1"
                    {...register('chapter', {
                      required: 'Chapter is required',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Chapter must be at least 1' },
                    })}
                  />
                  {errors.chapter && (
                    <p className="text-sm text-red-600">{errors.chapter.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    {...register('order', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={watchDifficulty}
                    onValueChange={(value) => setValue('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    {...register('duration', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isVisible">Visible</Label>
                <Switch
                  id="isVisible"
                  checked={watchIsVisible}
                  onCheckedChange={(checked) => setValue('isVisible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPremium">Premium Content</Label>
                <Switch
                  id="isPremium"
                  checked={watchIsPremium}
                  onCheckedChange={(checked) => setValue('isPremium', checked)}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 border-b border-neutral-200 pb-6">
              <h3 className="text-sm font-semibold text-neutral-900">Lesson Notes (Optional)</h3>
              <p className="text-xs text-neutral-500">
                Add study notes that students can access with this lesson
              </p>

              <div className="space-y-2">
                <Label htmlFor="notesContent">Notes Content (supports Markdown + LaTeX)</Label>
                <RichTextEditor
                  value={watchNotesContent}
                  onChange={(value) => setValue('notesContent', value)}
                  placeholder="Write notes here. Use $formula$ for inline math, $$formula$$ for block math."
                  rows={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesSummary">Notes Summary</Label>
                <Textarea
                  id="notesSummary"
                  {...register('notesSummary')}
                  placeholder="Brief summary of the notes"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingLesson ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteLesson}
        onOpenChange={() => setDeleteLesson(null)}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deleteLesson?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
