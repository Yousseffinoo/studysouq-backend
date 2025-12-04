import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '../sidebar/Sidebar'
import { Topbar } from '../topbar/Topbar'
import { useStore } from '../../store/useStore'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { CustomCursor } from '../cursor/CustomCursor'
import { Toaster } from '../ui/toaster'
import { cn } from '../../lib/utils'

export function DashboardLayout() {
  const { sidebarOpen, theme, setTheme } = useStore()
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/login')
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate])

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomCursor />
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-[260px]' : 'md:ml-20'
        )}
      >
        <Topbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-[calc(100vh-4rem)]"
        >
          <Outlet />
        </motion.main>
      </div>
      <Toaster />
    </div>
  )
}






