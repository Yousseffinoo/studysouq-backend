import { User } from 'lucide-react'

export function Topbar({ user }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Admin Panel</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

