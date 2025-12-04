import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, FileText, HelpCircle, Image as ImageIcon, Activity } from 'lucide-react';
import AdminLayout from '../../admin/AdminLayout';
import { getDashboardStats, getRecentActivities } from '../../../services/adminService';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(10)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2F6FED] border-t-transparent mb-4"></div>
            <p className="text-[#94A3B8]">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: stats?.counts?.totalUsers || 0, 
      change: `+${stats?.counts?.newUsersThisWeek || 0} this week`,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Users, 
      label: 'Premium Users', 
      value: stats?.counts?.premiumUsers || 0, 
      change: `${stats?.counts?.freeUsers || 0} free users`,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      icon: BookOpen, 
      label: 'Total Lessons', 
      value: stats?.counts?.totalLessons || 0, 
      change: 'Active content',
      color: 'from-green-500 to-green-600'
    },
    { 
      icon: FileText, 
      label: 'Total Notes', 
      value: stats?.counts?.totalNotes || 0, 
      change: 'Published',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      icon: HelpCircle, 
      label: 'Questions', 
      value: stats?.counts?.totalQuestions || 0, 
      change: 'In database',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      icon: ImageIcon, 
      label: 'Images', 
      value: stats?.counts?.totalImages || 0, 
      change: `${stats?.counts?.pendingImages || 0} pending`,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <AdminLayout>
      <div className="w-full max-w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-sm text-[#94A3B8]">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-[#0B1D34] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col h-full"
              >
                {/* Icon Row - Clean alignment above title */}
                <div className="mb-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {/* Title */}
                <h3 className="text-sm font-medium text-[#94A3B8] mb-2">{stat.label}</h3>
                {/* Value */}
                <p className="text-3xl font-bold text-white mb-2">{stat.value.toLocaleString()}</p>
                {/* Change text */}
                <p className="text-xs text-[#94A3B8] mt-auto">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full mb-8">
          {/* Weekly Users Chart */}
          <div className="bg-[#0B1D34] border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Weekly User Registrations</h3>
              <p className="text-sm text-[#94A3B8]">New user signups over the last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.charts?.weeklyUsers || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="_id" 
                  stroke="#94A3B8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94A3B8"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1D34', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2F6FED" 
                  strokeWidth={3}
                  name="New Users"
                  dot={{ fill: '#2F6FED', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Lessons by Subject */}
          <div className="bg-[#0B1D34] border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Lessons by Subject</h3>
              <p className="text-sm text-[#94A3B8]">Content distribution across subjects</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.charts?.lessonsBySubject || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="_id" 
                  stroke="#94A3B8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94A3B8"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1D34', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#2F6FED" 
                  radius={[8, 8, 0, 0]}
                  name="Lessons"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#0B1D34] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Recent Activities</h3>
              <p className="text-sm text-[#94A3B8]">Latest actions performed on the platform</p>
            </div>
            <Activity className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
          </div>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div 
                  key={activity._id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {activity.user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user?.name || 'Admin'}</span>
                      <span className="text-[#94A3B8]"> {activity.action.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    activity.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-[#94A3B8] py-8">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
