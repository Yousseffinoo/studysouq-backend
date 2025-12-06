import { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { PageSpinner } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    toast.error('Admin access required')
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar onLogout={handleLogout} />
      <div className="ml-64 transition-all duration-300">
        <Topbar user={user} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

