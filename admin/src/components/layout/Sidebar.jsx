import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  StickyNote,
  HelpCircle,
  Users,
  CreditCard,
  DollarSign,
  ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Subsections', href: '/sections', icon: Layers },
  { name: 'Lessons', href: '/lessons', icon: FileText },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Questions', href: '/questions', icon: HelpCircle },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Images', href: '/images', icon: ImageIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ onLogout }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-neutral-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8" />
            <span className="font-bold text-lg">StudySouq</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="mx-auto">
            <GraduationCap className="h-8 w-8" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-3')} />
                  {!collapsed && item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
        <button
          onClick={onLogout}
          className={cn(
            'flex w-full items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
