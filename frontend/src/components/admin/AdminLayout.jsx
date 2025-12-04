import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#020914]">
      {/* Sidebar with hover effect */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isHovered={sidebarHovered}
        onHover={() => setSidebarHovered(true)}
        onLeave={() => setSidebarHovered(false)}
      />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - Adjusts based on sidebar width */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarHovered ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Top Navigation Bar - Hidden on desktop, shown on mobile */}
        <header className="sticky top-0 z-30 bg-[#0B1D34] border-b border-white/10 md:hidden">
          <div className="flex items-center justify-between px-4 h-16">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
              <h1 className="text-lg font-semibold text-white">
                Admin Panel
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#FF6B2C] flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#020914] overflow-x-hidden">
          <div className="p-4 md:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
