import { 
  BookOpen, 
  FileText, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, PageSpinner } from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { useDashboardStats, useRecentActivities } from '@/hooks/useApi'
import { formatDateTime } from '@/lib/utils'

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

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-neutral-100 last:border-0">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
          <Clock className="h-4 w-4 text-neutral-500" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-900">{activity.description || activity.action}</p>
        <p className="text-xs text-neutral-500">{formatDateTime(activity.createdAt)}</p>
      </div>
    </div>
  )
}

export function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities()

  if (statsLoading) {
    return <PageSpinner />
  }

  const dashboardStats = stats || {}

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your educational platform"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Subjects"
          value={dashboardStats.totalSubjects || 0}
          icon={BookOpen}
          description="Active subjects"
        />
        <StatCard
          title="Total Lessons"
          value={dashboardStats.totalLessons || 0}
          icon={FileText}
          description="Published lessons"
        />
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers || 0}
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Revenue"
          value={`$${dashboardStats.totalRevenue || 0}`}
          icon={DollarSign}
          description="Total earnings"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="Premium Users"
          value={dashboardStats.premiumUsers || 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Views"
          value={dashboardStats.totalViews || 0}
          icon={Eye}
        />
        <StatCard
          title="Active Sessions"
          value={dashboardStats.activeSessions || 0}
          icon={Clock}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="py-8 text-center text-neutral-500">Loading activities...</div>
          ) : activities && activities.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {activities.slice(0, 10).map((activity, index) => (
                <ActivityItem key={activity._id || index} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-500">No recent activity</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
