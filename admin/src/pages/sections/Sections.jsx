import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
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
  useSections,
  useSubjects,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
} from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Sections() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [deleteSection, setDeleteSection] = useState(null)

  const { data, isLoading } = useSections({
    page,
    limit: 10,
    search,
    subjectId: subjectFilter,
  })

  // Get A-Level subjects only for the dropdown
  const { data: subjectsData } = useSubjects({ limit: 100, level: 'A-Level' })

  const createMutation = useCreateSection()
  const updateMutation = useUpdateSection()
  const deleteMutation = useDeleteSection()

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
      subjectId: '',
      isActive: true,
      isPremium: false,
      order: 0,
    },
  })

  const watchSubjectId = watch('subjectId')
  const watchIsActive = watch('isActive')
  const watchIsPremium = watch('isPremium')

  const openForm = (section = null) => {
    if (section) {
      setEditingSection(section)
      reset({
        name: section.name || section.sectionName,
        description: section.description || '',
        subjectId: section.subjectId || section.subject?._id,
        isActive: section.isActive,
        isPremium: section.isPremium || false,
        order: section.order || 0,
      })
    } else {
      setEditingSection(null)
      reset({
        name: '',
        description: '',
        subjectId: '',
        isActive: true,
        isPremium: false,
        order: 0,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSection(null)
    reset()
  }

  const onSubmit = async (formData) => {
    if (!formData.subjectId) {
      toast.error('Please select a subject')
      return
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        subjectId: formData.subjectId,
        isActive: formData.isActive,
        isPremium: formData.isPremium,
        order: formData.order,
      }

      if (editingSection) {
        await updateMutation.mutateAsync({
          id: editingSection._id,
          data: payload,
        })
        toast.success('Subsection updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Subsection created successfully')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteSection) return
    try {
      await deleteMutation.mutateAsync(deleteSection._id)
      toast.success('Subsection deleted successfully')
      setDeleteSection(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const sections = data?.sections || []
  const totalPages = data?.totalPages || 1
  const subjects = subjectsData?.subjects || []

  return (
    <div>
      <PageHeader
        title="Subsections"
        description="Manage subsections for A-Level subjects"
        breadcrumbs={[{ label: 'Subsections' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subsection
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subsections..."
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
              <SelectItem key={subject._id} value={subject._id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {sections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subsections found"
          description="Subsections are used to organize lessons within A-Level subjects"
          action={
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subsection
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{section.name || section.sectionName}</div>
                        {section.description && (
                          <div className="text-sm text-neutral-500 line-clamp-1">
                            {section.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {section.subjectName || section.subject?.name || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={section.isActive ? 'success' : 'secondary'}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {section.isPremium && <Badge>Premium</Badge>}
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(section.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(section)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteSection(section)}
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
              {editingSection ? 'Edit Subsection' : 'Create Subsection'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject *</Label>
              <Select
                value={watchSubjectId}
                onValueChange={(value) => setValue('subjectId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an A-Level subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subjects.length === 0 && (
                <p className="text-sm text-amber-600">
                  No A-Level subjects found. Create an A-Level subject first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Mechanics"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description"
                rows={3}
              />
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

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={watchIsActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
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
                {editingSection ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteSection}
        onOpenChange={() => setDeleteSection(null)}
        title="Delete Subsection"
        description={`Are you sure you want to delete "${deleteSection?.name || deleteSection?.sectionName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
