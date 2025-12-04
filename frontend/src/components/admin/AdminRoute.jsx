import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1D34]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2F6FED]"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to main login
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    // Logged in but not admin, show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1D34] px-4">
        <div className="max-w-md w-full bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-[#94A3B8] mb-6">
            You don't have permission to access the admin panel. Only administrators can access this area.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin
  return children;
}

