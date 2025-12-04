import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, DollarSign } from 'lucide-react'
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
  getPricingPlans, 
  createPricingPlan, 
  updatePricingPlan, 
  deletePricingPlan
} from '../../services/admin/pricingService'

export function Pricing() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingPeriod: 'monthly',
    features: [],
    isPopular: false,
    isActive: true,
  })
  const [featureInput, setFeatureInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (isMounted) {
        await loadPlans()
      }
    }
    
    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await getPricingPlans()
      setPlans(response.plans || response || [])
    } catch (error) {
      console.error('Failed to load pricing plans:', error)
      toast.error('Failed to load pricing plans')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenDialog = (plan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price?.toString() || '',
        billingPeriod: plan.type || plan.billingPeriod || 'monthly', // Map type to billingPeriod
        features: plan.features || [],
        isPopular: plan.isPopular || false,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        billingPeriod: 'monthly',
        features: [],
        isPopular: false,
        isActive: true,
      })
    }
    setFeatureInput('')
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      billingPeriod: 'monthly',
      features: [],
      isPopular: false,
      isActive: true,
    })
    setFeatureInput('')
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.error('Plan name is required')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    setSubmitting(true)
    
    try {
      // Map frontend fields to backend fields
      // Backend requires: name, type, price, duration, currency
      // Backend expects: type (not billingPeriod), duration (in days)
      
      // Calculate duration based on billing period
      let duration = 30; // default monthly
      if (formData.billingPeriod === 'yearly') {
        duration = 365;
      } else if (formData.billingPeriod === 'monthly') {
        duration = 30;
      } else if (formData.billingPeriod === 'lifetime') {
        duration = 9999; // lifetime
      }
      
      const dataToSubmit = {
        name: formData.name,
        type: formData.billingPeriod || 'monthly', // Map billingPeriod to type
        price: parseFloat(formData.price),
        duration: duration,
        currency: 'EGP',
        subject: 'all', // Default to 'all' subjects
        features: formData.features || [],
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      }

      if (editingPlan) {
        await updatePricingPlan(editingPlan._id, dataToSubmit)
        // Toast is already shown by API client
      } else {
        await createPricingPlan(dataToSubmit)
        // Toast is already shown by API client
      }
      await loadPlans()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save pricing plan:', error)
      toast.error(error.message || 'Failed to save pricing plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this pricing plan? This action cannot be undone.',
      'Delete Pricing Plan'
    )
    if (!confirmed) return
    
    try {
      await deletePricingPlan(id)
      // Toast is already shown by API client
      await loadPlans()
    } catch (error) {
      console.error('Failed to delete pricing plan:', error)
      toast.error(error.message || 'Failed to delete pricing plan')
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
          <h1 className="text-2xl md:text-3xl font-bold">Pricing Plans</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage subscription pricing plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update pricing plan details' : 'Create a new subscription plan'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Monthly"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what's included in this plan"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (EGP) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00 EGP"
                      required
                      data-cursor="hover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingPeriod">Billing Period *</Label>
                    <Select
                      value={formData.billingPeriod}
                      onValueChange={(value) => setFormData({ ...formData, billingPeriod: value })}
                    >
                      <SelectTrigger data-cursor="hover">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="features"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFeature()
                        }
                      }}
                      placeholder="Add a feature and press Enter"
                      data-cursor="hover"
                    />
                    <Button type="button" onClick={handleAddFeature} data-cursor="hover">
                      Add
                    </Button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-sm"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isPopular" className="font-normal">Mark as Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isActive" className="font-normal">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  Cancel
                </Button>
                <Button type="submit" data-cursor="hover" disabled={submitting || formData.features.length === 0} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  {submitting ? 'Saving...' : (editingPlan ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-cursor="hover"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border p-6 ${plan.isPopular ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                {plan.isPopular && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-bold">{plan.price} {plan.currency || 'EGP'}</span>
                      <span className="text-muted-foreground">
                        /{(plan.type || plan.billingPeriod) === 'monthly' ? 'mo' : (plan.type || plan.billingPeriod) === 'yearly' ? 'yr' : 'one-time'}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(plan)}
                      className="flex-1"
                      data-cursor="hover"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan._id)}
                      data-cursor="hover"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      plan.isActive 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredPlans.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {plans.length === 0 ? 'No pricing plans yet. Create your first plan!' : 'No plans found matching your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}



