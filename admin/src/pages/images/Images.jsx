import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, CheckCircle, XCircle, Trash2, Upload, ImageIcon } from 'lucide-react'
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
  getImages, 
  uploadImage, 
  approveImage, 
  rejectImage, 
  deleteImage
} from '../../services/admin/imagesService'

export function Images() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    category: 'other',
    subject: 'general',
    tags: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (isMounted) {
        await loadImages()
      }
    }
    
    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await getImages({ limit: 1000 })
      setImages(response.images || response || [])
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      (image.title && image.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (image.description && image.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || image.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || image.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Validation Error',
          description: 'Image size must be less than 10MB',
          variant: 'destructive'
        })
        return
      }
      setFormData({ ...formData, image: file })
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      image: null,
      title: '',
      description: '',
      category: 'other',
      subject: 'general',
      tags: '',
    })
    setUploadProgress(0)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setFormData({
      image: null,
      title: '',
      description: '',
      category: 'other',
      subject: 'general',
      tags: '',
    })
    setUploadProgress(0)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.image) {
      toast({
        title: 'Validation Error',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    if (!formData.title || !formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    setUploadProgress(0)
    
    try {
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []

      await uploadImage({
        image: formData.image,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        subject: formData.subject,
        tags: tagsArray,
      }, (progress) => {
        setUploadProgress(progress)
      })
      
      // Toast is already shown by API client
      await loadImages()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approveImage(id)
      // Toast is already shown by API client
      await loadImages()
    } catch (error) {
      console.error('Failed to approve image:', error)
      toast.error(error.message || 'Failed to approve image')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason || !reason.trim()) return

    try {
      await rejectImage(id, reason.trim())
      // Toast is already shown by API client
      await loadImages()
    } catch (error) {
      console.error('Failed to reject image:', error)
      toast.error(error.message || 'Failed to reject image')
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this image? This action cannot be undone.',
      'Delete Image'
    )
    if (!confirmed) return
    
    try {
      await deleteImage(id)
      // Toast is already shown by API client
      await loadImages()
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error(error.message || 'Failed to delete image')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'rejected':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-muted text-muted-foreground'
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
          <h1 className="text-2xl md:text-3xl font-bold">Images</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage and review uploaded images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
              <Plus className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
              <DialogDescription>
                Upload an image to the platform. Images require admin approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image File *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                      data-cursor="hover"
                      required
                    />
                    {formData.image && (
                      <span className="text-sm text-muted-foreground">
                        {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                  {formData.image && (
                    <div className="mt-2 max-h-64 overflow-hidden rounded border bg-muted/50 p-2">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded"
                      />
                    </div>
                  )}
                  {submitting && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Image title"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the image"
                    rows={3}
                    data-cursor="hover"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-cursor="hover">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diagram">Diagram</SelectItem>
                        <SelectItem value="graph">Graph</SelectItem>
                        <SelectItem value="formula">Formula</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger data-cursor="hover">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional - comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                    data-cursor="hover"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  Cancel
                </Button>
                <Button type="submit" data-cursor="hover" disabled={submitting || !formData.image} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  {submitting ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
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
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-cursor="hover"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-cursor="hover">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-cursor="hover">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="diagram">Diagram</SelectItem>
                <SelectItem value="graph">Graph</SelectItem>
                <SelectItem value="formula">Formula</SelectItem>
                <SelectItem value="illustration">Illustration</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs ${getStatusColor(image.status)}`}>
                    {image.status}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{image.category}</span>
                    <span>•</span>
                    <span className="capitalize">{image.subject}</span>
                  </div>
                  {image.uploadedBy && (
                    <p className="text-xs text-muted-foreground">
                      By: {image.uploadedBy.name || 'Unknown'}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {image.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(image._id)}
                          className="flex-1"
                          data-cursor="hover"
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(image._id)}
                          className="flex-1"
                          data-cursor="hover"
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(image._id)}
                      data-cursor="hover"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredImages.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {images.length === 0 ? 'No images yet. Upload your first image!' : 'No images found matching your filters.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}



