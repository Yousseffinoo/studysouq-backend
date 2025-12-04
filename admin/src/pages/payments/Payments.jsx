import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, CreditCard, TrendingUp, DollarSign, Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import toast from 'react-hot-toast'
import { 
  getPayments, 
  getPaymentStats,
  createPayment
} from '../../services/admin/paymentsService'
import { getUsers } from '../../services/admin/usersService'

export function Payments() {
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    completedCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    paymentMethod: 'other',
    status: 'completed',
    planType: 'monthly',
    planName: 'Manual Payment',
    transactionId: '',
    date: new Date().toISOString().split('T')[0],
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
      const [paymentsResponse, statsResponse, usersResponse] = await Promise.all([
        getPayments({ limit: 1000 }),
        getPaymentStats(),
        getUsers({ limit: 1000 })
      ])
      
      // Handle response structure - API.get returns data directly or wrapped
      const paymentsData = paymentsResponse?.payments || paymentsResponse || []
      const usersData = usersResponse?.users || usersResponse || []
      
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setStats({
        totalRevenue: statsResponse?.totalRevenue || 0,
        pendingRevenue: statsResponse?.pendingRevenue || 0,
        completedCount: statsResponse?.completedCount || 0,
      })
    } catch (error) {
      console.error('Failed to load payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'failed':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const handleOpenCreateDialog = () => {
    setFormData({
      userId: '',
      amount: '',
      paymentMethod: 'other',
      status: 'completed',
      planType: 'monthly',
      planName: 'Manual Payment',
      transactionId: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
    setFormData({
      userId: '',
      amount: '',
      paymentMethod: 'other',
      status: 'completed',
      planType: 'monthly',
      planName: 'Manual Payment',
      transactionId: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.userId) {
      toast.error('Please select a user')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (!formData.date) {
      toast.error('Date is required')
      return
    }

    setSubmitting(true)
    
    try {
      await createPayment({
        userId: formData.userId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod || 'other',
        status: formData.status || 'completed',
        planType: formData.planType || 'monthly',
        planName: formData.planName || 'Manual Payment',
        transactionId: formData.transactionId || undefined,
        date: formData.date,
      })
      toast.success('Payment created successfully')
      await loadData()
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Failed to create payment:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to create payment'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all transactions</p>
        </div>
        <Button onClick={handleOpenCreateDialog} data-cursor="hover" className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From completed payments</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.pendingRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCount}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{payment.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {payment.paymentMethod} • {new Date(payment.date).toLocaleDateString()}
                  </p>
                  {payment.transactionId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Transaction ID: {payment.transactionId}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">${payment.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {payments.length === 0 ? 'No transactions yet. Create your first payment!' : 'No transactions found matching your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-full">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
            <DialogDescription>
              Add a new payment transaction
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePayment}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User *</Label>
                <Select
                  value={formData.userId || ''}
                  onValueChange={(value) => setFormData({ ...formData, userId: value })}
                >
                  <SelectTrigger data-cursor="hover">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  data-cursor="hover"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod || 'other'}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="installment">Installment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status || 'completed'}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger data-cursor="hover">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                  <Input
                  id="date"
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-cursor="hover"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                  <Input
                  id="transactionId"
                  value={formData.transactionId || ''}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="Enter transaction ID"
                  data-cursor="hover"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={handleCloseCreateDialog} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                Cancel
              </Button>
              <Button type="submit" data-cursor="hover" disabled={submitting} className="w-full sm:w-auto touch-manipulation min-h-[44px] md:min-h-0">
                {submitting ? 'Creating...' : 'Create Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}



