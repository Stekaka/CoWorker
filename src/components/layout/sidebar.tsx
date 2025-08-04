'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserWithCompany } from '@/types'
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Bell, 
  Settings, 
  Building 
} from 'lucide-react'

interface SidebarProps {
  user: UserWithCompany
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'E-post', href: '/email', icon: Mail },
  { name: 'Påminnelser', href: '/reminders', icon: Bell },
]

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  
  const allNavigation = user.role === 'ADMIN' 
    ? [...navigation, ...adminNavigation]
    : navigation

  return (
    <div className="w-64 bg-white shadow-lg">
      {/* Logo och företagsnamn */}
      <div className="flex items-center justify-center h-20 shadow-md">
        <div className="flex items-center space-x-2">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">CRM</h1>
            <p className="text-sm text-gray-500">{user.company.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {allNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Användarinfo */}
      <div className="absolute bottom-0 w-64 p-4 bg-gray-50 border-t">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-8 w-8 rounded-full"
              src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff`}
              alt={`${user.firstName} ${user.lastName}`}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user.role === 'ADMIN' ? 'Admin' : 'Användare'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
