/**
 * Layout Component
 * Main application layout with navigation
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Bots', href: '/bots', icon: Bot },
  { name: 'Flows', href: '/flows', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50"
             onClick={() => setMobileOpen(false)}
             style={{ display: mobileOpen ? 'block' : 'none' }} />

        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
             style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">OmniTalk</h2>
            <button onClick={() => setMobileOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="p-4">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname.startsWith(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:fixed md:inset-x-0 md:h-screen md:overflow-y-auto md:bg-gray-100 md:border-r md:border-gray-200">
        <div className="flex flex-col flex-1">
          <div className="flex items-center height-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">OmniTalk</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname.startsWith(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">OmniTalk</h1>
      </header>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}