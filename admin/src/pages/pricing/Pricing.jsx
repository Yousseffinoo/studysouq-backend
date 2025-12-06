import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Textarea,
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
  EmptyState,
  PageSpinner,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import {
  usePricing,
  useCreatePricing,
  useUpdatePricing,
  useDeletePricing,
} from '@/hooks/useApi'
import toast from 'react-hot-toast'

export function Pricing() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [deletePlan, setDeletePlan] = useState(null)

  const { data, isLoading } = usePricing()

  const createMutation = useCreatePricing()
  const updateMutation = useUpdatePricing()
  const deleteMutation = useDeletePricing()

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
      price: 0,
      duration: 30,
      features: '',
      isActive: true,
      isPopular: false,
    },
  })

  const watchIsActive = watch('isActive')
  const watchIsPopular = watch('isPopular')

  const openForm = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      reset({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        duration: plan.duration || 30,
        features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
        isActive: plan.isActive !== false,
        isPopular: plan.isPopular || false,
      })
    } else {
      setEditingPlan(null)
      reset({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        features: '',
        isActive: true,
        isPopular: false,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingPlan(null)
    reset()
  }

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        features: formData.features
          ? formData.features.split('\n').map((f) => f.trim()).filter(Boolean)
          : [],
      }

      if (editingPlan) {
        await updateMutation.mutateAsync({
          id: editingPlan._id,
          data: payload,
        })
        toast.success('Plan updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Plan created successfully')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deletePlan) return
    try {
      await deleteMutation.mutateAsync(deletePlan._id)
      toast.success('Plan deleted successfully')
      setDeletePlan(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const plans = data?.plans || data || []

  return (
    <div>
      <PageHeader
        title="Pricing Plans"
        description="Manage subscription pricing plans"
        breadcrumbs={[{ label: 'Pricing' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        }
      />

      {/* Table */}
      {plans.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No pricing plans"
          description="Create subscription plans for your users"
          action={
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.isPopular && <Badge>Popular</Badge>}
                    </div>
                    {plan.description && (
                      <div className="text-sm text-neutral-500">{plan.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">${plan.price}</TableCell>
                  <TableCell>{plan.duration} days</TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-500">
                      {Array.isArray(plan.features) ? plan.features.length : 0} features
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForm(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletePlan(plan)}
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
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Premium Monthly"
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
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true,
                  })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  {...register('duration', {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                {...register('features')}
                placeholder="Unlimited access&#10;Priority support&#10;Early access"
                rows={4}
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
              <Label htmlFor="isPopular">Mark as Popular</Label>
              <Switch
                id="isPopular"
                checked={watchIsPopular}
                onCheckedChange={(checked) => setValue('isPopular', checked)}
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
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletePlan}
        onOpenChange={() => setDeletePlan(null)}
        title="Delete Plan"
        description={`Are you sure you want to delete "${deletePlan?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
