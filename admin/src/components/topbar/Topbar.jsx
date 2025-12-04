import { motion } from 'framer-motion'
import { Bell, Moon, Sun, User, LogOut, Menu } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { cn } from '../../lib/utils'

export function Topbar() {
  const { theme, setTheme, sidebarOpen, setSidebarOpen } = useStore()
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        sidebarOpen ? 'md:ml-[260px]' : 'md:ml-20'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 md:min-h-0 md:min-w-0 min-w-[44px] min-h-[44px]"
            data-cursor="hover"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {/* Spacer for mobile */}
        {!isMobile && <div />}
        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="md:min-h-0 md:min-w-0 min-w-[44px] min-h-[44px]"
            data-cursor="hover"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="md:min-h-0 md:min-w-0 min-w-[44px] min-h-[44px]" data-cursor="hover" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors md:min-h-0 md:min-w-0 min-w-[44px] min-h-[44px]" data-cursor="hover" aria-label="User menu">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'Admin'}
                    className="h-full w-full rounded-full object-cover"
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} data-cursor="hover">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-cursor="hover">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}






