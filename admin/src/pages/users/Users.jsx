import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Users as UsersIcon, Ban, CheckCircle } from 'lucide-react'
import {
  Button,
  Input,
  Label,
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
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserBan,
} from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Users() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [banUser, setBanUser] = useState(null)

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search,
    role: roleFilter,
  })

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const banMutation = useToggleUserBan()

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
      email: '',
      password: '',
      role: 'user',
    },
  })

  const watchRole = watch('role')

  const openForm = (user = null) => {
    if (user) {
      setEditingUser(user)
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingUser(null)
    reset()
  }

  const onSubmit = async (formData) => {
    try {
      const payload = { ...formData }
      if (editingUser && !payload.password) {
        delete payload.password
      }

      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser._id,
          data: payload,
        })
        toast.success('User updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('User created successfully')
      }
      closeForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      await deleteMutation.mutateAsync(deleteUser._id)
      toast.success('User deleted successfully')
      setDeleteUser(null)
    } catch (error) {
      toast.error(error.message || 'Delete failed')
    }
  }

  const handleBan = async () => {
    if (!banUser) return
    try {
      await banMutation.mutateAsync(banUser._id)
      toast.success(banUser.isBanned ? 'User unbanned' : 'User banned')
      setBanUser(null)
    } catch (error) {
      toast.error(error.message || 'Operation failed')
    }
  }

  if (isLoading) return <PageSpinner />

  const users = data?.users || []
  const totalPages = data?.totalPages || 1

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        breadcrumbs={[{ label: 'Users' }]}
        action={
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
          className="sm:w-80"
        />
        <Select 
          value={roleFilter || 'all'} 
          onValueChange={(value) => setRoleFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Users will appear here when they register"
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : user.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription?.isActive ? (
                        <Badge variant="success">Premium</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBanUser(user)}
                          title={user.isBanned ? 'Unban' : 'Ban'}
                        >
                          {user.isBanned ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Ban className="h-4 w-4 text-amber-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUser(user)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Create User'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email',
                  },
                })}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingUser ? '(leave blank to keep current)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: editingUser ? false : 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={watchRole}
                onValueChange={(value) => setValue('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={() => setDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* Ban Confirmation */}
      <ConfirmDialog
        open={!!banUser}
        onOpenChange={() => setBanUser(null)}
        title={banUser?.isBanned ? 'Unban User' : 'Ban User'}
        description={
          banUser?.isBanned
            ? `Are you sure you want to unban "${banUser?.name}"?`
            : `Are you sure you want to ban "${banUser?.name}"? They will lose access to the platform.`
        }
        confirmText={banUser?.isBanned ? 'Unban' : 'Ban'}
        onConfirm={handleBan}
        loading={banMutation.isPending}
        variant={banUser?.isBanned ? 'default' : 'destructive'}
      />
    </div>
  )
}
