import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, FileText, Sparkles, Upload, Eye, RefreshCw } from 'lucide-react'
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import {
  useQuestions,
  useSubjects,
  useLessons,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useGenerateQuestions,
  useUploadQuestionsPDF,
} from '@/hooks/useQuestionApi'
import { formatDate, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'hard', label: 'Hard', color: 'destructive' },
]

const SOURCES = [
  { value: 'manual', label: 'Manual' },
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'ai_generated', label: 'AI Generated' },
]

export function Questions() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [deleteQuestion, setDeleteQuestion] = useState(null)
  const [previewQuestion, setPreviewQuestion] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState([])

  // Queries
  const { data, isLoading } = useQuestions({
    page,
    limit: 15,
    search,
    subject: subjectFilter,
    difficulty: difficultyFilter,
    source: sourceFilter,
  })
  const { data: subjectsData } = useSubjects({ limit: 100 })
  const { data: lessonsData } = useLessons({ limit: 500 })

  // Mutations
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()
  const deleteMutation = useDeleteQuestion()
  const generateMutation = useGenerateQuestions()
  const uploadMutation = useUploadQuestionsPDF()

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: '',
      section: '',
      lesson: '',
      questionText: '',
      answerText: '',
      explanation: '',
      marks: 1,
      difficulty: 'medium',
      source: 'manual',
      tags: '',
    },
  })

  const watchSubject = watch('subject')
  const watchLesson = watch('lesson')
  const watchDifficulty = watch('difficulty')
  const watchSource = watch('source')
  const watchQuestionText = watch('questionText')
  const watchAnswerText = watch('answerText')

  const openForm = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      reset({
        subject: question.subject,
        section: question.section?._id || '',
        lesson: question.lesson?._id || question.lesson,
        questionText: question.questionText,
        answerText: question.answerText,
        explanation: question.explanation || '',
        marks: question.marks || 1,
        difficulty: question.difficulty || 'medium',
        source: question.source || 'manual',
        tags: question.tags?.join(', ') || '',
      })
    } else {
      setEditingQuestion(null)
      reset({
        subject: '',
        section: '',
        lesson: '',
        questionText: '',
        answerText: '',
        explanation: '',
        marks: 1,
        difficulty: 'medium',
        source: 'manual',
        tags: '',
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingQuestion(null)
    reset()
  }

  const onSubmit = async (formData) => {
    if (!formData.subject || !formData.lesson) {
      toast.error('Please select a subject and lesson')
      return
    }

    const payload = {
      subject: formData.subject,
      section: formData.section || null,
      lesson: formData.lesson,
      questionText: formData.questionText,
      answerText: formData.answerText,
      explanation: formData.explanation || '',
      marks: Number(formData.marks) || 1,
      difficulty: formData.difficulty,
      source: formData.source,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }

    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({ id: editingQuestion._id, data: payload })
        toast.success('Question updated')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Question created')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteQuestion) return
    try {
      await deleteMutation.mutateAsync(deleteQuestion._id)
      toast.success('Question deleted')
      setDeleteQuestion(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  // AI Generation handler
  const handleGenerate = async (genData) => {
    try {
      const result = await generateMutation.mutateAsync(genData)
      setGeneratedQuestions(result.generatedQuestions || [])
      toast.success(`Generated ${result.generatedQuestions?.length || 0} questions`)
    } catch (error) {
      toast.error(error.message || 'Generation failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const questions = data?.questions || []
  const totalPages = data?.pagination?.pages || 1
  const subjects = subjectsData?.subjects || []
  const lessons = lessonsData?.lessons || []

  return (
    <div>
      <PageHeader
        title="Questions Manager"
        description="Create, manage, and generate questions with AI"
        breadcrumbs={[{ label: 'Questions' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
            <Button variant="outline" onClick={() => setIsGenerateOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search questions..."
          className="sm:w-80"
        />
        <Select value={subjectFilter || 'all'} onValueChange={(v) => setSubjectFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s._id} value={s.slug}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter || 'all'} onValueChange={(v) => setDifficultyFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter || 'all'} onValueChange={(v) => setSourceFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions Table */}
      {questions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No questions found"
          description="Create your first question or generate with AI"
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsGenerateOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button onClick={() => openForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Question</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm font-medium line-clamp-2">
                          {truncate(question.questionText, 120)}
                        </p>
                        {question.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {question.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{question.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          question.difficulty === 'hard' ? 'destructive' :
                          question.difficulty === 'easy' ? 'success' : 'warning'
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {question.source === 'ai_generated' ? 'AI' :
                         question.source === 'past_paper' ? 'Paper' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPreviewQuestion(question)
                            setIsPreviewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteQuestion(question)}
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
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create Question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Subject & Lesson Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={watchSubject} onValueChange={(v) => setValue('subject', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s.slug}>{s.name} ({s.level})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lesson *</Label>
                <Select value={watchLesson} onValueChange={(v) => setValue('lesson', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons
                      .filter(l => !watchSubject || l.subject === watchSubject)
                      .map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label>Question Text * (supports Markdown + LaTeX)</Label>
              <RichTextEditor
                value={watchQuestionText}
                onChange={(v) => setValue('questionText', v)}
                rows={6}
              />
              {errors.questionText && (
                <p className="text-sm text-red-600">{errors.questionText.message}</p>
              )}
            </div>

            {/* Answer Text */}
            <div className="space-y-2">
              <Label>Answer Text * (supports Markdown + LaTeX)</Label>
              <RichTextEditor
                value={watchAnswerText}
                onChange={(v) => setValue('answerText', v)}
                rows={4}
              />
              {errors.answerText && (
                <p className="text-sm text-red-600">{errors.answerText.message}</p>
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                {...register('explanation')}
                placeholder="Detailed explanation for students..."
                rows={3}
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  min="1"
                  {...register('marks', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={watchDifficulty} onValueChange={(v) => setValue('difficulty', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={watchSource} onValueChange={(v) => setValue('source', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input {...register('tags')} placeholder="algebra, equations" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingQuestion ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <AIGenerateDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        subjects={subjects}
        lessons={lessons}
        onGenerate={handleGenerate}
        isLoading={generateMutation.isPending}
        generatedQuestions={generatedQuestions}
      />

      {/* Upload PDF Dialog */}
      <UploadPDFDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        subjects={subjects}
        lessons={lessons}
        onUpload={uploadMutation.mutateAsync}
        isLoading={uploadMutation.isPending}
      />

      {/* Preview Dialog */}
      <QuestionPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        question={previewQuestion}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteQuestion}
        onOpenChange={() => setDeleteQuestion(null)}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

// AI Generate Dialog Component
function AIGenerateDialog({ open, onOpenChange, subjects, lessons, onGenerate, isLoading, generatedQuestions }) {
  const [genSubject, setGenSubject] = useState('')
  const [genLesson, setGenLesson] = useState('')
  const [genDifficulty, setGenDifficulty] = useState('medium')
  const [genCount, setGenCount] = useState(5)

  const handleGenerate = () => {
    onGenerate({
      subject: genSubject,
      lesson: genLesson,
      difficulty: genDifficulty,
      numberOfQuestions: genCount,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Questions with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={genSubject} onValueChange={setGenSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s.slug}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lesson/Topic</Label>
              <Select value={genLesson} onValueChange={setGenLesson}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons
                    .filter(l => !genSubject || l.subject === genSubject)
                    .map((l) => (
                      <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={genDifficulty} onValueChange={setGenDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!genSubject || !genLesson || isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Questions'}
          </Button>

          {/* Generated Questions Preview */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">Generated Questions ({generatedQuestions.length})</h4>
              {generatedQuestions.map((q, i) => (
                <Card key={i}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Question {i + 1}</span>
                      <Badge>{q.difficulty}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm mb-2">{truncate(q.questionText, 200)}</p>
                    <p className="text-xs text-neutral-500">
                      Answer: {truncate(q.answerText, 100)}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full" variant="outline">
                Save All Questions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Upload PDF Dialog Component
function UploadPDFDialog({ open, onOpenChange, subjects, lessons, onUpload, isLoading }) {
  const [uploadSubject, setUploadSubject] = useState('')
  const [uploadLesson, setUploadLesson] = useState('')
  const [file, setFile] = useState(null)

  const handleUpload = async () => {
    if (!file || !uploadSubject || !uploadLesson) {
      toast.error('Please fill all fields and select a file')
      return
    }

    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('subject', uploadSubject)
    formData.append('lesson', uploadLesson)

    try {
      await onUpload(formData)
      toast.success('PDF processed successfully')
    } catch (error) {
      toast.error(error.message || 'Upload failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Questions PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={uploadSubject} onValueChange={setUploadSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s.slug}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lesson</Label>
            <Select value={uploadLesson} onValueChange={setUploadLesson}>
              <SelectTrigger>
                <SelectValue placeholder="Select lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons
                  .filter(l => !uploadSubject || l.subject === uploadSubject)
                  .map((l) => (
                    <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>PDF File</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !uploadSubject || !uploadLesson || isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Upload & Extract'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Question Preview Dialog Component
function QuestionPreviewDialog({ open, onOpenChange, question }) {
  if (!question) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-neutral-500">Question</Label>
            <div className="mt-1 p-4 bg-neutral-50 rounded-lg">
              <p className="whitespace-pre-wrap">{question.questionText}</p>
            </div>
          </div>

          <div>
            <Label className="text-neutral-500">Answer</Label>
            <div className="mt-1 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="whitespace-pre-wrap">{question.answerText}</p>
            </div>
          </div>

          {question.explanation && (
            <div>
              <Label className="text-neutral-500">Explanation</Label>
              <div className="mt-1 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="whitespace-pre-wrap">{question.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 text-sm text-neutral-500">
            <span>Marks: {question.marks}</span>
            <span>Difficulty: {question.difficulty}</span>
            <span>Source: {question.source}</span>
          </div>

          {question.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {question.tags.map((tag, i) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

