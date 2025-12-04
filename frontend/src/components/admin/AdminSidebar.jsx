import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Image, 
  DollarSign, 
  Settings, 
  Bot,
  X,
  LogOut
} from 'lucide-react';
import Logo from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: BookOpen, label: 'Lessons', path: '/admin/lessons' },
  { icon: FileText, label: 'Notes', path: '/admin/notes' },
  { icon: HelpCircle, label: 'Questions', path: '/admin/questions' },
  { icon: Image, label: 'Images', path: '/admin/images' },
  { icon: DollarSign, label: 'Pricing', path: '/admin/pricing' },
  { icon: Bot, label: 'AI Config', path: '/admin/ai-config' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar({ isOpen, onClose, isHovered, onHover, onLeave }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isExpanded = isOpen || isHovered;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar - Always visible on desktop, collapsed by default */}
      <aside
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={`
          fixed top-0 left-0 h-full bg-[#1F324D]
          border-r border-white/10 z-50 transition-all duration-300 ease-in-out
          overflow-hidden
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section - Fixed at top */}
          <div className="flex items-center justify-center py-6 border-b border-white/10 relative px-3">
            <Link to="/admin/dashboard" className="flex items-center justify-center w-full">
              <Logo className={`transition-all duration-300 flex-shrink-0 ${isExpanded ? 'w-28 h-auto max-w-[180px]' : 'w-12 h-auto max-w-[48px]'}`} />
            </Link>
            {/* Mobile Close Button */}
            {isExpanded && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 transition-all md:hidden z-10"
              >
                <X className="w-5 h-5 text-[#94A3B8]" />
              </button>
            )}
          </div>

          {/* Navigation Menu - No scroll, perfect alignment */}
          <nav className="flex-1 py-6">
            <div className="space-y-2 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`
                      flex items-center rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-[#2F6FED] text-white'
                          : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      }
                      ${isExpanded ? 'gap-3 px-4 py-3' : 'justify-center py-3'}
                    `}
                    title={!isExpanded ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Admin Profile & Logout Section - Fixed at bottom */}
          <div className="px-3 py-4 border-t border-white/10">
            {isExpanded ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-[#94A3B8] text-[10px] truncate">
                      {user?.role || 'Administrator'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                    text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
