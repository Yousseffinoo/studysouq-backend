import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
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
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const LEVELS = [
  { value: 'O-Level', label: 'O-Level (IGCSE)', description: 'Has lessons directly' },
  { value: 'A-Level', label: 'A-Level', description: 'Has subsections with lessons' },
]

export function Subjects() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [deleteSubject, setDeleteSubject] = useState(null)

  const { data, isLoading, error } = useSubjects({
    page,
    limit: 10,
    search,
    level: levelFilter,
  })

  const createMutation = useCreateSubject()
  const updateMutation = useUpdateSubject()
  const deleteMutation = useDeleteSubject()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      level: 'O-Level',
      color: '#000000',
      isActive: true,
      order: 0,
    },
  })

  const watchLevel = watch('level')
  const watchIsActive = watch('isActive')

  const openForm = (subject = null) => {
    if (subject) {
      setEditingSubject(subject)
      reset({
        name: subject.name,
        description: subject.description,
        level: subject.level,
        color: subject.color || '#000000',
        isActive: subject.isActive,
        order: subject.order || 0,
      })
    } else {
      setEditingSubject(null)
      reset({
        name: '',
        description: '',
        level: 'O-Level',
        color: '#000000',
        isActive: true,
        order: 0,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSubject(null)
    reset()
  }

  const onSubmit = async (formData) => {
    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({
          id: editingSubject._id,
          data: formData,
        })
        toast.success('Subject updated successfully')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Subject created successfully')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteSubject) return
    try {
      await deleteMutation.mutateAsync(deleteSubject._id)
      toast.success('Subject deleted successfully')
      setDeleteSubject(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const subjects = data?.subjects || []
  const totalPages = data?.totalPages || 1

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage O-Level and A-Level subjects"
        breadcrumbs={[{ label: 'Subjects' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subjects..."
          className="sm:w-80"
        />
        <Select 
          value={levelFilter || 'all'} 
          onValueChange={(value) => setLevelFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="O-Level">O-Level</SelectItem>
            <SelectItem value="A-Level">A-Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects found"
          description="Get started by creating your first subject"
          action={
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: subject.color || '#000' }}
                        />
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-sm text-neutral-500 line-clamp-1">
                            {subject.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subject.level === 'A-Level' ? 'default' : 'secondary'}>
                        {subject.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subject.isActive ? 'success' : 'secondary'}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(subject.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteSubject(subject)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Edit Subject' : 'Create Subject'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Physics"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                placeholder="Brief description of the subject"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={watchLevel}
                onValueChange={(value) => setValue('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div>{level.label}</div>
                        <div className="text-xs text-neutral-500">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                {watchLevel === 'O-Level'
                  ? 'O-Level subjects have lessons directly attached'
                  : 'A-Level subjects have subsections that contain lessons'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    {...register('color')}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    {...register('color')}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={watchIsActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
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
                {editingSubject ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteSubject}
        onOpenChange={() => setDeleteSubject(null)}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteSubject?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
