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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import toast from 'react-hot-toast'
import { useConfirm } from '../../components/ui/confirm-dialog'
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject
} from '../../services/admin/subjectsService'

export function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'O-Level',
    status: 'active',
  })
  const [submitting, setSubmitting] = useState(false)
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (isMounted) {
        await loadSubjects()
      }
    }
    
    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const response = await getSubjects({ limit: 1000 })
      setSubjects(response.subjects)
    } catch (error) {
      console.error('Failed to load subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (subject) => {
    if (subject) {
      setEditingSubject(subject)
      setFormData({
        name: subject.name,
        description: subject.description,
        level: subject.level,
        status: subject.status,
      })
    } else {
      setEditingSubject(null)
      setFormData({ name: '', description: '', level: 'O-Level', status: 'active' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSubject(null)
    setFormData({ name: '', description: '', level: 'O-Level', status: 'active' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.error('Subject name is required')
      return
    }

    if (!formData.description || !formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSubmitting(true)
    
    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, formData)
        // Toast is already shown by API client
      } else {
        await createSubject(formData)
        // Toast is already shown by API client
      }
      await loadSubjects()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save subject:', error)
      toast.error(error.message || 'Failed to save subject')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this subject? This will also delete all associated sections, lessons, notes, and questions.',
      'Delete Subject'
    )
    if (!confirmed) return
    
    try {
      await deleteSubject(id)
      // Toast is already shown by API client
      await loadSubjects()
    } catch (error) {
      console.error('Failed to delete subject:', error)
      toast.error(error.message || 'Failed to delete subject')
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
          <h1 className="text-2xl md:text-3xl font-bold">Subjects</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all subjects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              <DialogDescription>
                {editingSubject ? 'Update subject details' : 'Create a new subject'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mathematics"
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
                    placeholder="Brief description of the subject"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O-Level">O-Level (No sections)</SelectItem>
                      <SelectItem value="AS">AS (Requires sections)</SelectItem>
                      <SelectItem value="A2">A2 (Requires sections)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.level === 'O-Level'
                      ? 'O-Level subjects bypass sections'
                      : 'AS/A2 subjects require sections to organize content'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  Cancel
                </Button>
                <Button type="submit" data-cursor="hover" disabled={submitting} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  {submitting ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-cursor="hover"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubjects.map((subject, index) => (
              <motion.div
                key={subject._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base break-words">{subject.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-xs">
                      {subject.level}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        subject.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {subject.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">{subject.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(subject)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(subject._id)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredSubjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {subjects.length === 0 ? 'No subjects yet. Create your first subject!' : 'No subjects found matching your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}



