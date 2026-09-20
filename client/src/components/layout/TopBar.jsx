import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, UserCircle, LogOut, Bell, Search, ChevronDown } from 'lucide-react'
import { useShell } from './AppShell'

export const ROLE_LABELS = {
  admin: 'System Administrator',
  hr: 'Human Resources',
  manager: 'Department Manager',
  employee: 'Employee',
}

export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

const getDisplayName = (user) =>
  `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || capitalize(user?.username || 'User')

export const getFirstName = (user) => capitalize(user?.firstName || user?.name?.split(' ')[0] || user?.username || 'there')

export const getGreeting = (hour) => (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')

export const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

const useClickOutside = (ref, onOutside, active) => {
  useEffect(() => {
    if (!active) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    const onKey = (e) => e.key === 'Escape' && onOutside()
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, onOutside, active])
}

/* ------------------------------------------------------------------ */
/* Top bar: search, notifications, profile                             */
/* ------------------------------------------------------------------ */

const GlobalSearch = ({ role }) => {
  const navigate = useNavigate()
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const employeesHref = `/${role}/employees`
  const departmentsHref = role === 'admin' || role === 'hr' ? `/${role}/departments` : null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const emp = employees
      .filter((e) =>
        [e.firstName, e.lastName, e.username, e.email, e.position, e.extension].some((v) => v && String(v).toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((e) => ({
        key: `e-${e._id || e.email}`,
        label: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.username,
        meta: e.position || e.email || 'Employee',
        href: employeesHref,
      }))
    const dep = departmentsHref
      ? departments
          .filter((d) => d.name?.toLowerCase().includes(q))
          .slice(0, 3)
          .map((d) => ({ key: `d-${d._id}`, label: d.name, meta: 'Department', href: departmentsHref }))
      : []
    return [...emp, ...dep]
  }, [query, employees, departments, employeesHref, departmentsHref])

  const go = (href) => {
    setOpen(false)
    setQuery('')
    navigate(href)
  }

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-navy-500" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && results[0] && go(results[0].href)}
        placeholder="Search employees, departments, or by extension..."
        aria-label="Search"
        className="w-full rounded-full border border-white/70 bg-white/70 py-2 pl-10 pr-4 text-xs text-navy-800 shadow-sm backdrop-blur placeholder:text-navy-500 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-navy-500">No matches for &ldquo;{query.trim()}&rdquo;</p>
          ) : (
            results.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => go(r.href)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-navy-50"
              >
                <span className="truncate text-[13px] text-navy-800">{r.label}</span>
                <span className="flex-shrink-0 text-[11px] text-navy-500">{r.meta}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const ProfileMenu = ({ user, role, unreadCount, onMessagesClick, onLogout }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const displayName = getDisplayName(user)
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-medium text-white ring-2 ring-white">
            {initials}
          </span>
        )}
        <span className="hidden text-left md:block">
          <span className="block max-w-[10rem] truncate text-[13px] font-semibold text-navy-800">{displayName}</span>
          <span className="block text-[11px] text-indigo-700/80">{ROLE_LABELS[role] || capitalize(role)}</span>
        </span>
        <ChevronDown className={`hidden h-4 w-4 text-navy-500 transition-transform md:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-xl">
          <div className="border-b border-navy-100 px-4 py-2.5 md:hidden">
            <p className="truncate text-[13px] font-semibold text-navy-800">{displayName}</p>
            <p className="text-[11px] text-navy-500">{ROLE_LABELS[role] || capitalize(role)}</p>
          </div>
          <Link to={`/${role}/profile`} onClick={close} className="flex items-center gap-3 px-4 py-2 text-[13px] text-navy-800 hover:bg-navy-50">
            <UserCircle className="h-4 w-4 text-navy-500" /> My Profile
          </Link>
          <Link
            to="/chat"
            onClick={() => {
              onMessagesClick()
              close()
            }}
            className="flex items-center gap-3 px-4 py-2 text-[13px] text-navy-800 hover:bg-navy-50"
          >
            <MessageSquare className="h-4 w-4 text-navy-500" /> Messages
            {unreadCount > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">{unreadCount}</span>}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 border-t border-navy-100 px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Search, messages bell and profile menu — floats at the top of every page hero.
 */
const TopBar = () => {
  const { user } = useSelector((state) => state.auth)
  const { unreadCount, markMessagesRead, logout } = useShell()
  const role = user?.role || 'employee'

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="hidden min-w-0 flex-1 sm:flex">
        <GlobalSearch role={role} />
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <Link
          to="/chat"
          onClick={markMessagesRead}
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-navy-800 shadow-sm backdrop-blur transition-colors hover:bg-white"
          aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}
        >
          <Bell className="h-5 w-5" strokeWidth={1.7} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <span className="hidden h-8 w-px bg-navy-200 sm:block" />
        <ProfileMenu user={user} role={role} unreadCount={unreadCount} onMessagesClick={markMessagesRead} onLogout={logout} />
      </div>
    </div>
  )
}

export default TopBar
