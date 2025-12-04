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
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import toast from 'react-hot-toast'
import { useConfirm } from '../../components/ui/confirm-dialog'
import { 
  getSections, 
  createSection, 
  updateSection, 
  deleteSection
} from '../../services/admin/sectionsService'
import { getSubjects } from '../../services/admin/subjectsService'

export function Sections() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [formData, setFormData] = useState({
    sectionName: '',
    subjectId: '',
    description: '',
    status: 'active',
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
      const [sectionsResponse, subjectsResponse] = await Promise.all([
        getSections({ limit: 1000 }),
        getSubjects({ limit: 1000 })
      ])
      
      // Handle response structure - API.get returns data directly or wrapped
      const sectionsData = sectionsResponse?.sections || sectionsResponse || []
      const subjectsData = subjectsResponse?.subjects || subjectsResponse || []
      
      setSections(Array.isArray(sectionsData) ? sectionsData : [])
      setSubjects(Array.isArray(subjectsData) ? subjectsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Filter subjects to only show AS and A2 levels
  // Backend returns "A-Level" for both AS and A2 subjects (stored as "a-level" in DB)
  // So we need to check for "A-Level" or exclude "O-Level"
  const eligibleSubjects = subjects.filter(
    (subject) => {
      const level = subject.level || ''
      return level === 'AS' || 
             level === 'A2' || 
             level === 'A-Level' ||
             level === 'a-level' ||
             (level !== 'O-Level' && level !== 'igcse')
    }
  )

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || section.subjectId === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleOpenDialog = (section) => {
    if (section) {
      setEditingSection(section)
      setFormData({
        sectionName: section.sectionName,
        subjectId: section.subjectId,
        description: section.description,
        status: section.status,
      })
    } else {
      setEditingSection(null)
      setFormData({ sectionName: '', subjectId: '', description: '', status: 'active' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSection(null)
    setFormData({ sectionName: '', subjectId: '', description: '', status: 'active' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.sectionName || !formData.sectionName.trim()) {
      toast.error('Section name is required')
      return
    }

    if (!formData.subjectId) {
      toast.error('Please select a subject')
      return
    }
    
    const subject = subjects.find((s) => s._id === formData.subjectId)
    
    if (!subject) {
      toast.error('Subject not found')
      return
    }

    if (subject.level === 'O-Level') {
      toast.error('Sections cannot be created for O-Level subjects')
      return
    }

    setSubmitting(true)
    
    try {
      if (editingSection) {
        await updateSection(editingSection._id, formData)
        // Toast is already shown by API client
      } else {
        await createSection(formData)
        // Toast is already shown by API client
      }
      await loadData()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save section:', error)
      toast.error(error.message || 'Failed to save section')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this section? This will also delete all associated lessons, notes, and questions.',
      'Delete Section'
    )
    if (!confirmed) return
    
    try {
      await deleteSection(id)
      // Toast is already shown by API client
      await loadData()
    } catch (error) {
      console.error('Failed to delete section:', error)
      toast.error(error.message || 'Failed to delete section')
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
          <h1 className="text-2xl md:text-3xl font-bold">Sections</h1>
          <p className="text-sm md:text-base text-muted-foreground">Organize AS & A2 subjects into sections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] md:w-full">
            <DialogHeader>
              <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
              <DialogDescription>
                {editingSection ? 'Update section details' : 'Create a new section for AS or A2 subjects'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionName">Section Name *</Label>
                  <Input
                    id="sectionName"
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    placeholder="e.g., Pure Mathematics 1"
                    required
                    data-cursor="hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (AS or A2 only) *</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleSubjects.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No AS/A2 subjects available. Create subjects first.
                        </div>
                      ) : (
                        eligibleSubjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.level})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only AS and A2 subjects are shown. O-Level subjects don't use sections.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this section"
                    data-cursor="hover"
                  />
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
                <Button type="submit" data-cursor="hover" disabled={submitting || eligibleSubjects.length === 0} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                  {submitting ? 'Saving...' : (editingSection ? 'Update' : 'Create')}
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
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-cursor="hover"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-cursor="hover">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {eligibleSubjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSections.map((section, index) => (
              <motion.div
                key={section._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base break-words">{section.sectionName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        section.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {section.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-words">Subject: {section.subjectName}</p>
                  {section.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">{section.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(section.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(section)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(section._id)}
                    data-cursor="hover"
                    className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {sections.length === 0 
                  ? 'No sections found. Create sections for AS and A2 subjects.' 
                  : 'No sections found matching your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}



