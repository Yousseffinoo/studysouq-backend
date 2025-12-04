import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Trash2, User as UserIcon, Plus, Edit } from 'lucide-react'
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
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import toast from 'react-hot-toast'
import { useConfirm } from '../../components/ui/confirm-dialog'
import { 
  getUsers, 
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../../services/admin/usersService'

export function Users() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isPremium: false,
    isEmailVerified: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (isMounted) {
        await loadUsers()
      }
    }
    
    load()
    
    return () => {
      isMounted = false
    }
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers({ limit: 1000 })
      setUsers(response.users)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewUser = async (userId) => {
    try {
      const user = await getUser(userId)
      setSelectedUser(user)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Failed to load user details:', error)
      toast({ 
        title: 'Error', 
        description: 'Failed to load user details', 
        variant: 'destructive' 
      })
    }
  }

  const handleOpenCreateDialog = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isPremium: false,
      isEmailVerified: false,
    })
    setIsCreateDialogOpen(true)
  }

  const handleOpenEditDialog = async (userId) => {
    try {
      const user = await getUser(userId)
      setEditingUser(user)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        isPremium: user.isPremium || false,
        isEmailVerified: user.isEmailVerified || false,
      })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error('Failed to load user:', error)
      toast({ 
        title: 'Error', 
        description: 'Failed to load user details', 
        variant: 'destructive' 
      })
    }
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isPremium: false,
      isEmailVerified: false,
    })
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isPremium: false,
      isEmailVerified: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive'
      })
      return
    }

    if (!formData.email || !formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive'
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Invalid email format',
        variant: 'destructive'
      })
      return
    }

    // Password required for new users
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      toast({
        title: 'Validation Error',
        description: 'Password is required and must be at least 6 characters',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    
    try {
      const dataToSubmit = { ...formData }
      // Don't send password if it's empty (for updates)
      if (!dataToSubmit.password) {
        delete dataToSubmit.password
      }

      if (editingUser) {
        await updateUser(editingUser._id, dataToSubmit)
        // Toast is already shown by API client
        setIsEditDialogOpen(false)
      } else {
        await createUser(dataToSubmit)
        // Toast is already shown by API client
        setIsCreateDialogOpen(false)
      }
      await loadUsers()
      handleCloseEditDialog()
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error(error.message || 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this user? This action cannot be undone.',
      'Delete User'
    )
    if (!confirmed) return
    
    try {
      await deleteUser(id)
      // Toast is already shown by API client
      await loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error.message || 'Failed to delete user')
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
      <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users</p>
        </div>
        <Button onClick={handleOpenCreateDialog} data-cursor="hover">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-cursor="hover"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          user.isPremium
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {user.isPremium ? 'Premium' : 'Free'}
                      </span>
                      {user.isEmailVerified && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewUser(user._id)}
                    data-cursor="hover"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(user._id)}
                    data-cursor="hover"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user._id)}
                    data-cursor="hover"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {users.length === 0 ? 'No users yet. Create your first user!' : 'No users found matching your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name} 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="font-medium">{selectedUser.isPremium ? 'Premium' : 'Free'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Verified</p>
                  <p className="font-medium">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {selectedUser.lastLogin 
                      ? new Date(selectedUser.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                {selectedUser.isPremium && selectedUser.premiumPlan && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Premium Plan</p>
                      <p className="font-medium capitalize">{selectedUser.premiumPlan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Premium Expiry</p>
                      <p className="font-medium">
                        {selectedUser.premiumExpiry 
                          ? new Date(selectedUser.premiumExpiry).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(selectedUser.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.loginAttempts !== undefined && selectedUser.loginAttempts > 0 && (
                <div className="rounded-lg border p-4 bg-yellow-500/5">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    Login Attempts
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This user has {selectedUser.loginAttempts} failed login attempt(s)
                  </p>
                  {selectedUser.lockUntil && new Date(selectedUser.lockUntil) > new Date() && (
                    <p className="text-xs text-red-500 mt-1">
                      Account locked until {new Date(selectedUser.lockUntil).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseCreateDialog()
          handleCloseEditDialog()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
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
                  placeholder="Full name"
                  required
                  data-cursor="hover"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  data-cursor="hover"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {!editingUser && '*'}
                  {editingUser && <span className="text-xs text-muted-foreground">(Leave empty to keep current)</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Leave empty to keep current password" : "Minimum 6 characters"}
                  required={!editingUser}
                  minLength={editingUser ? 0 : 6}
                  data-cursor="hover"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger data-cursor="hover">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPremium" className="font-normal">Premium User</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isEmailVerified" className="font-normal">Email Verified</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  handleCloseCreateDialog()
                  handleCloseEditDialog()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" data-cursor="hover" disabled={submitting}>
                {submitting ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}



