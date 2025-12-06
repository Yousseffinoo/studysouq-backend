import { useState } from 'react'
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Pagination,
  SearchInput,
  EmptyState,
  PageSpinner,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { usePayments, usePaymentStats } from '@/hooks/useApi'
import { formatDate, formatDateTime } from '@/lib/utils'

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function Payments() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = usePayments({
    page,
    limit: 10,
    search,
  })

  const { data: stats } = usePaymentStats()

  if (isLoading) return <PageSpinner />

  const payments = data?.payments || []
  const totalPages = data?.totalPages || 1
  const paymentStats = stats || {}

  return (
    <div>
      <PageHeader
        title="Payments"
        description="View and manage payment transactions"
        breadcrumbs={[{ label: 'Payments' }]}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={`$${paymentStats.totalRevenue || 0}`}
          icon={DollarSign}
        />
        <StatCard
          title="This Month"
          value={`$${paymentStats.monthlyRevenue || 0}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Transactions"
          value={paymentStats.totalTransactions || 0}
          icon={CreditCard}
        />
        <StatCard
          title="Active Subscribers"
          value={paymentStats.activeSubscribers || 0}
          icon={Users}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by user or transaction ID..."
          className="sm:w-80"
        />
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="Payment transactions will appear here"
        />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-mono text-sm">
                      {payment.transactionId || payment._id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-neutral-500">
                          {payment.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.plan || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'completed' || payment.status === 'success'
                            ? 'success'
                            : payment.status === 'pending'
                            ? 'warning'
                            : payment.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDateTime(payment.createdAt)}
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
    </div>
  )
}
