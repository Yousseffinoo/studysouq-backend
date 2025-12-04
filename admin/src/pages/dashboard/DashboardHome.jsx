import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, GraduationCap, BookOpen, HelpCircle, CreditCard, TrendingUp, Layers, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { getDashboardStats, getRecentActivities, getAnalytics } from '../../services/admin/dashboardService'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, activitiesData, analyticsData] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(10),
        getAnalytics(30)
      ])
      setStats(statsData)
      setActivities(activitiesData.activities || activitiesData || [])
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.counts.totalUsers,
      icon: Users,
      description: 'All registered users',
    },
    {
      title: 'Premium Users',
      value: stats.counts.premiumUsers,
      icon: CreditCard,
      description: 'Subscribed users',
    },
    {
      title: 'Total Lessons',
      value: stats.counts.totalLessons,
      icon: GraduationCap,
      description: 'All lessons',
    },
    {
      title: 'Total Questions',
      value: stats.counts.totalQuestions,
      icon: HelpCircle,
      description: 'All questions',
    },
    {
      title: 'Total Notes',
      value: stats.counts.totalNotes,
      icon: FileText,
      description: 'Premium notes',
    },
    {
      title: 'Total Images',
      value: stats.counts.totalImages,
      icon: Layers,
      description: 'Uploaded images',
    },
    {
      title: 'New Users',
      value: stats.counts.newUsersThisWeek,
      icon: TrendingUp,
      description: 'This week',
    },
    {
      title: 'Pending Images',
      value: stats.counts.pendingImages,
      icon: BookOpen,
      description: 'Awaiting review',
    },
  ]

  // Prepare chart data
  const userGrowthData = analytics?.userGrowth?.map((item, index) => ({
    date: item.date || `Day ${index + 1}`,
    users: item.count || 0,
  })) || []

  const revenueData = analytics?.revenue?.map((item, index) => ({
    date: item.date || `Day ${index + 1}`,
    revenue: item.amount || 0,
  })) || []

  const contentDistribution = [
    { name: 'Lessons', value: stats.counts.totalLessons || 0 },
    { name: 'Questions', value: stats.counts.totalQuestions || 0 },
    { name: 'Notes', value: stats.counts.totalNotes || 0 },
    { name: 'Images', value: stats.counts.totalImages || 0 },
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-3 md:space-y-6 p-3 md:p-6">
      <div className="mb-2 md:mb-0">
        <h1 className="text-xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-xs md:text-base text-muted-foreground mt-0.5">Welcome to StudySouq Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-2 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow" data-cursor="hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
                  <CardTitle className="text-xs md:text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-3.5 w-3.5 md:h-5 md:w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 pb-3 md:pb-6">
                  <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* User Growth Chart */}
        {userGrowthData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
                <CardTitle className="text-sm md:text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
                <CardTitle className="text-sm md:text-lg">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content Distribution */}
        {contentDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
                <CardTitle className="text-sm md:text-lg">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={contentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card>
          <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
              <Clock className="h-3.5 w-3.5 md:h-5 md:w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {activities.length > 0 ? (
              <div className="space-y-2 md:space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 p-2 md:p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium break-words">{activity.action || activity.type || 'Activity'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 md:mt-1 break-words">
                        {activity.description || activity.message || 'No description'}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {activity.userName || activity.user?.name || activity.userId || 'Unknown'}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp || activity.createdAt 
                          ? new Date(activity.timestamp || activity.createdAt).toLocaleString()
                          : 'Unknown time'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 md:py-8 text-xs md:text-base text-muted-foreground">
                No recent activities
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
            <CardTitle className="text-sm md:text-lg">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">User Growth</p>
                  <p className="text-xs text-muted-foreground break-words mt-0.5">
                    {stats.counts.premiumUsers} premium users out of {stats.counts.totalUsers} total
                    ({stats.counts.totalUsers > 0 
                      ? ((stats.counts.premiumUsers / stats.counts.totalUsers) * 100).toFixed(1) 
                      : 0}% premium rate)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">Content Library</p>
                  <p className="text-xs text-muted-foreground break-words mt-0.5">
                    {stats.counts.totalLessons} lessons with {stats.counts.totalQuestions} questions 
                    and {stats.counts.totalNotes} premium notes
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-accent/50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium">Weekly Activity</p>
                  <p className="text-xs text-muted-foreground break-words mt-0.5">
                    {stats.counts.newUsersThisWeek} new user{stats.counts.newUsersThisWeek !== 1 ? 's' : ''} registered this week
                  </p>
                </div>
              </div>
              {stats.counts.pendingImages > 0 && (
                <div className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-yellow-600 dark:text-yellow-500">
                      Pending Reviews
                    </p>
                    <p className="text-xs text-muted-foreground break-words mt-0.5">
                      {stats.counts.pendingImages} image{stats.counts.pendingImages !== 1 ? 's' : ''} awaiting review
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}






