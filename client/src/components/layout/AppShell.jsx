import { createContext, useCallback, useContext, useEffect, useState, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import axios from 'axios'
import { logout } from '../../store/slices/authSlice'
import { getSocket } from '../../utils/socket'
import RouteErrorBoundary from '../RouteErrorBoundary'
import Sidebar from './Sidebar'

const ShellContext = createContext({ unreadCount: 0, markMessagesRead: () => {}, logout: () => {} })

export const useShell = () => useContext(ShellContext)

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-indigo-600" />
  </div>
)

/**
 * Persistent frame for every signed-in page: the sidebar is mounted once here
 * and stays in place while routes change inside <Outlet />.
 */
const AppShell = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  const role = user?.role
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const refreshUnreadCount = useCallback(async () => {
    if (!token || !role) return
    try {
      const res = await axios.get(`/api/messages?toRole=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUnreadCount(res.data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [token, role])

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  // Refresh unread count when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshUnreadCount()
    }
    window.addEventListener('focus', refreshUnreadCount)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', refreshUnreadCount)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshUnreadCount])

  // Live unread updates for this role's channel
  useEffect(() => {
    if (!token || !role) return
    let socket
    try {
      socket = getSocket(token)
    } catch {
      return
    }
    const onMessage = (msg) => {
      if (msg?.toRole === role) refreshUnreadCount()
    }
    socket.on('message:new', onMessage)
    return () => socket.off('message:new', onMessage)
  }, [token, role, refreshUnreadCount])

  // Mark messages as read when navigating to chat
  const markMessagesRead = useCallback(async () => {
    try {
      await axios.post('/api/messages/read', { channelRole: role }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }, [token, role])

  const handleLogout = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  // PrivateRoute inside the outlet handles the redirect to /login
  if (!isAuthenticated) return <Outlet />

  return (
    <ShellContext.Provider value={{ unreadCount, markMessagesRead, logout: handleLogout }}>
      <div className="min-h-screen bg-navy-50 lg:pl-[240px]">
        <Sidebar
          role={role}
          unreadCount={unreadCount}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onMessagesClick={markMessagesRead}
          onLogout={handleLogout}
        />

        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-white hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to={`/${role}`}>
            <img src="/logo.webp" alt="Qassim Chamber" className="h-8 w-auto" />
          </Link>
          {unreadCount > 0 && (
            <Link
              to="/chat"
              onClick={markMessagesRead}
              className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white"
            >
              {unreadCount} new
            </Link>
          )}
        </div>

        {/* Page-level boundary keeps the sidebar alive if a page crashes; resets on navigation */}
        <RouteErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </div>
    </ShellContext.Provider>
  )
}

export default AppShell
