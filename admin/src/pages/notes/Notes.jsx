import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react'
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
  useNotes,
  useLessons,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/hooks/useApi'
import { formatDate, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'

const NOTE_TYPES = [
  { value: 'summary', label: 'Summary' },
  { value: 'formula', label: 'Formula' },
  { value: 'definition', label: 'Definition' },
  { value: 'theorem', label: 'Theorem' },
  { value: 'example', label: 'Example' },
  { value: 'tips', label: 'Tips' },
]

const SUBJECTS = [
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'biology', label: 'Biology' },
  { value: 'computer-science', label: 'Computer Science' },
]

const CLASSES = [
  { value: '9th', label: '9th Grade' },
  { value: '10th', label: '10th Grade' },
  { value: '11th', label: '11th Grade' },
  { value: '12th', label: '12th Grade' },
]

export function Notes() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deleteNote, setDeleteNote] = useState(null)

  const { data, isLoading } = useNotes({
    page,
    limit: 10,
    search,
    subject: subjectFilter,
    type: typeFilter,
  })

  const { data: lessonsData } = useLessons({ limit: 100 })

  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
  const deleteMutation = useDeleteNote()

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
      content: '',
      summary: '',
      subject: 'physics',
      class: '9th',
      chapter: 1,
      type: 'summary',
      lesson: '',
      tags: '',
      isPremium: false,
      isVisible: true,
    },
  })

  const watchSubject = watch('subject')
  const watchClass = watch('class')
  const watchType = watch('type')
  const watchLesson = watch('lesson')
  const watchContent = watch('content')
  const watchIsPremium = watch('isPremium')
  const watchIsVisible = watch('isVisible')

  const openForm = (note = null) => {
    if (note) {
      setEditingNote(note)
      reset({
        title: note.title,
        content: note.content,
        summary: note.summary || '',
        subject: note.subject || 'physics',
        class: note.class || '9th',
        chapter: note.chapter || 1,
        type: note.type || 'summary',
        lesson: note.lesson?._id || note.lesson || '',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        isPremium: note.isPremium || false,
        isVisible: note.isVisible !== false,
      })
    } else {
      setEditingNote(null)
      reset({
        title: '',
        content: '',
        summary: '',
        subject: 'physics',
        class: '9th',
        chapter: 1,
        type: 'summary',
        lesson: '',
        tags: '',
        isPremium: false,
        isVisible: true,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingNote(null)
    reset()
  }

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        lesson: formData.lesson || null,
      }

      if (editingNote) {
        await updateMutation.mutateAsync({
          id: editingNote._id,
          data: payload,
        })
        toast.success('Note updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Note created successfully')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteNote) return
    try {
      await deleteMutation.mutateAsync(deleteNote._id)
      toast.success('Note deleted successfully')
      setDeleteNote(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const notes = data?.notes || []
  const totalPages = data?.totalPages || 1
  const lessons = lessonsData?.lessons || []

  return (
    <div>
      <PageHeader
        title="Standalone Notes"
        description="Create general notes not tied to specific lessons. For lesson-specific notes, edit them within the Lessons page."
        breadcrumbs={[{ label: 'Notes' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search notes..."
          className="sm:w-80"
        />
        <Select 
          value={subjectFilter || 'all'} 
          onValueChange={(value) => setSubjectFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={typeFilter || 'all'} 
          onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {NOTE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes found"
          description="Create notes with rich text, math formulas, and images"
          action={
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
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
                  <TableHead>Type</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{note.title}</div>
                        <div className="text-sm text-neutral-500 line-clamp-1">
                          {truncate(note.summary || note.content, 50)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{note.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{note.type}</Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {note.lesson?.title || '-'}
                    </TableCell>
                    <TableCell>
                      {note.isPremium && <Badge className="mr-1">Premium</Badge>}
                      <Badge variant={note.isVisible ? 'success' : 'secondary'}>
                        {note.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(note.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteNote(note)}
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
              {editingNote ? 'Edit Note' : 'Create Note'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g., Newton's Laws of Motion"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={watchSubject}
                  onValueChange={(value) => setValue('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  value={watchClass}
                  onValueChange={(value) => setValue('class', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chapter *</Label>
                <Input
                  type="number"
                  min="1"
                  {...register('chapter', {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watchType}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked Lesson (optional)</Label>
              <Select
                value={watchLesson || 'none'}
                onValueChange={(value) => setValue('lesson', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No lesson</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content * (supports Markdown + LaTeX)</Label>
              <RichTextEditor
                value={watchContent}
                onChange={(value) => setValue('content', value)}
                placeholder="Write your note content here. Use $formula$ for math."
                rows={12}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                {...register('summary')}
                placeholder="Brief summary of the note"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g., mechanics, motion, force"
              />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingNote ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteNote}
        onOpenChange={() => setDeleteNote(null)}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteNote?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
