import { Link, NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  UserPlus,
  Building2,
  CalendarDays,
  BarChart3,
  MessageSquare,
  ClipboardList,
  FileText,
  UserCircle,
  Bell,
  LogOut,
  X,
} from 'lucide-react'
import StarBurst from '../dashboard/StarBurst'

export const NAV_ITEMS = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: Home, end: true },
    { name: 'Employees', href: '/admin/employees', icon: Users },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
    { name: 'Schedule', href: '/schedule', icon: CalendarDays },
    { name: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Messages', href: '/chat', icon: MessageSquare, badge: 'unread' },
    { name: 'Audit Log', href: '/admin/audit', icon: ClipboardList },
    { name: 'Profile', href: '/admin/profile', icon: UserCircle },
  ],
  hr: [
    { name: 'Dashboard', href: '/hr', icon: Home, end: true },
    { name: 'Employees', href: '/hr/employees', icon: Users, end: true },
    { name: 'Add Employee', href: '/hr/employees/add', icon: UserPlus },
    { name: 'Departments', href: '/hr/departments', icon: Building2 },
    { name: 'Reports', href: '/hr/reports', icon: FileText },
    { name: 'Schedule', href: '/schedule', icon: CalendarDays },
    { name: 'Messages', href: '/chat', icon: MessageSquare, badge: 'unread' },
    { name: 'Profile', href: '/hr/profile', icon: UserCircle },
  ],
  manager: [
    { name: 'Dashboard', href: '/manager', icon: Home, end: true },
    { name: 'My Team', href: '/manager/team', icon: Users },
    { name: 'Employees', href: '/manager/employees', icon: Users },
    { name: 'Analytics & Reports', href: '/manager/analytics', icon: BarChart3 },
    { name: 'Schedule', href: '/schedule', icon: CalendarDays },
    { name: 'Messages', href: '/chat', icon: MessageSquare, badge: 'unread' },
    { name: 'Profile', href: '/manager/profile', icon: UserCircle },
  ],
  employee: [
    { name: 'Dashboard', href: '/employee', icon: Home, end: true },
    { name: 'My Schedule', href: '/employee/schedule', icon: CalendarDays },
    { name: 'Notifications', href: '/employee/notifications', icon: Bell },
    { name: 'Messages', href: '/chat', icon: MessageSquare, badge: 'unread' },
    { name: 'Profile', href: '/employee/profile', icon: UserCircle },
  ],
}

const Sidebar = ({ role, unreadCount, open, onClose, onMessagesClick, onLogout }) => {
  const items = NAV_ITEMS[role] || NAV_ITEMS.employee

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950 text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <StarBurst className="pointer-events-none absolute -bottom-28 -left-32 h-80 w-80 text-navy-400/15" />

        <div className="relative flex items-center justify-between px-7 pb-8 pt-7">
          <Link to={`/${role}`} onClick={onClose}>
            <img src="/logo.webp" alt="Qassim Chamber" className="h-12 w-auto" />
          </Link>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-4">
          {items.map((item) => {
            const Icon = item.icon
            const count = item.badge === 'unread' ? unreadCount : 0
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={() => {
                  if (item.badge === 'unread') onMessagesClick()
                  onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2d4595] to-navy-700 font-medium text-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.6} />
                <span className="flex-1 truncate">{item.name}</span>
                {count > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">{count}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="relative px-4 pb-7 pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.6} />
            Log out
          </button>
          <p className="mt-6 px-4 text-xs leading-relaxed text-navy-400">
            Together for a<br />
            stronger business<br />
            community.
          </p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
