import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  Layers,
  FileText,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { cn } from '../../lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Layers, label: 'Sections', path: '/sections' },
  { icon: GraduationCap, label: 'Lessons', path: '/lessons' },
  { icon: FileText, label: 'Notes', path: '/notes' },
  { icon: HelpCircle, label: 'Questions', path: '/questions' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: ImageIcon, label: 'Images', path: '/images' },
  { icon: DollarSign, label: 'Pricing', path: '/pricing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useStore()
  const isMobile = useIsMobile()

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? (isMobile ? '100%' : '260px') : (isMobile ? '0' : '80px'),
          x: isMobile && !sidebarOpen ? '-100%' : 0,
        }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border flex flex-col overflow-hidden',
          !sidebarOpen && !isMobile && 'md:w-20',
          isMobile && sidebarOpen && 'max-w-sm'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {sidebarOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              StudySouq
            </motion.h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto rounded-lg p-2 hover:bg-accent transition-colors md:min-h-0 md:min-w-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-cursor="hover"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group md:min-h-0 min-h-[44px]',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                data-cursor="hover"
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </motion.aside>
    </>
  )
}






