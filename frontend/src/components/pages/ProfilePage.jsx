import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Crown, LogOut, Loader2, Calendar, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && user) {
      setProfileLoading(false);
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#94A3B8] mb-4">Please login to view your profile</p>
          <Link 
            to="/login" 
            className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-12">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
                <h2 className="mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">Full Name</label>
                    <div className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <User className="w-5 h-5 text-[#94A3B8] mr-3" />
                      <span>{user.name || 'No name provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">Email</label>
                    <div className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <Mail className="w-5 h-5 text-[#94A3B8] mr-3" />
                      <span>{user.email}</span>
                      {user.isEmailVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" title="Email Verified" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">Account Type</label>
                    <div className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <Shield className="w-5 h-5 text-[#94A3B8] mr-3" />
                      <span className="capitalize">{user.authProvider || 'email'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">Member Since</label>
                    <div className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-[#94A3B8] mr-3" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Stats */}
              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
                <h2 className="mb-6">Learning Progress</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2 text-[#2F6FED]">
                      {user.stats?.lessonsCompleted || 0}
                    </div>
                    <div className="text-sm text-[#94A3B8]">Lessons Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2 text-[#A9C7FF]">
                      {user.stats?.questionsSolved || 0}
                    </div>
                    <div className="text-sm text-[#94A3B8]">Questions Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2 text-[#F7C94C]">
                      {user.stats?.sectionsMastered || 0}
                    </div>
                    <div className="text-sm text-[#94A3B8]">Sections Mastered</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#94A3B8]">Overall Progress</span>
                    <span className="text-sm text-[#2F6FED] font-semibold">
                      {user.stats?.overallProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#2F6FED] to-[#A9C7FF] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${user.stats?.overallProgress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="space-y-6">
              <div className={`bg-gradient-to-br ${user.role === 'premium' ? 'from-[#F7C94C]/20 to-[#2F6FED]/20 border-[#F7C94C]/30' : 'from-[#0B1D34] to-[#0B1D34]/50 border-white/10'} border rounded-2xl p-6`}>
                <div className="flex items-center mb-4">
                  <Crown className={`w-6 h-6 mr-2 ${user.role === 'premium' ? 'text-[#F7C94C]' : 'text-[#94A3B8]'}`} />
                  <h3>{user.role === 'premium' ? 'Premium' : 'Free Plan'}</h3>
                </div>
                
                <p className="text-[#94A3B8] text-sm mb-6">
                  {user.role === 'premium' 
                    ? 'You have access to all premium features including notes, unlimited questions, and AI tutor.' 
                    : 'Upgrade to premium to unlock all features and accelerate your learning.'}
                </p>

                {user.role !== 'premium' && (
                  <Link 
                    to="/pricing" 
                    className="block w-full py-3 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] hover:opacity-90 rounded-xl transition-all duration-300 text-center"
                  >
                    Upgrade to Premium
                  </Link>
                )}

                {user.role === 'premium' && user.premiumExpiresAt && (
                  <div className="text-xs text-[#94A3B8] text-center">
                    Valid until {formatDate(user.premiumExpiresAt)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="mb-4">Account Actions</h3>
                
                <div className="space-y-3">
                  {user.authProvider === 'email' && (
                    <button 
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-left text-sm"
                      onClick={() => alert('Change password feature coming soon!')}
                    >
                      Change Password
                    </button>
                  )}
                  
                  <button 
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-left text-sm"
                    onClick={() => alert('Email preferences coming soon!')}
                  >
                    Email Preferences
                  </button>
                  
                  <Link
                    to="/subjects"
                    className="block w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-left text-sm"
                  >
                    Continue Learning
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors text-left text-sm text-red-400 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="mb-4">Security Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#94A3B8]">Email Verified</span>
                    {user.isEmailVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-yellow-500">Pending</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#94A3B8]">Auth Method</span>
                    <span className="text-xs text-[#A9C7FF] capitalize">
                      {user.authProvider || 'Email'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#94A3B8]">Account Status</span>
                    <span className="text-xs text-green-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}