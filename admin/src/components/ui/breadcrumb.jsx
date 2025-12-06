import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumb({ items, className }) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-neutral-500', className)}>
      <Link
        to="/dashboard"
        className="flex items-center hover:text-neutral-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-neutral-300" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-neutral-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

