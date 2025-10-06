import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Users, Settings, LogOut, BarChart3, TrendingUp, Phone, Mail, Calendar, User, Plus } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import ActionButton from '../ui/ActionButton'
import QassimLoadingSpinner from '../ui/QassimLoadingSpinner'
import axios from 'axios'

const DashboardLayout = ({ 
  title, 
  subtitle,
  children, 
  stats = [],
  quickActions = [],
  customActions = [],
  showAddUser = false,
  onAddUser,
  role = 'admin'
}) => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const [unreadCount, setUnreadCount] = useState(0)

  // Function to refresh unread count
  const refreshUnreadCount = async () => {
    try {
      const res = await axios.get(`/api/messages?toRole=${role}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      const unreadCount = res.data.unreadCount || 0
      setUnreadCount(unreadCount)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
  }, [token, user, role])

  // Refresh unread count when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      refreshUnreadCount()
    }
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUnreadCount()
    }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [token, user, role])

  const handleLogout = () => {
    dispatch(logout())
  }

  // Mark messages as read when navigating to chat
  const handleMessagesClick = async () => {
    try {
      await axios.post('/api/messages/read', { channelRole: role }, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="header-gradient shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 space-y-4 lg:space-y-0">
            {/* Logo and Title Section */}
            <div className="flex items-center">
              <div className="mr-3 sm:mr-4">
                <img src="/logo.png" alt="Logo" className="h-12 sm:h-16 w-auto" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-white text-sm sm:text-base font-medium">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-white/80 text-xs sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <span className="text-sm text-white hidden xl:inline">
                Welcome back, {user?.username || user?.name}
              </span>
              <Link
                to={`/${role}/profile`}
                className="glass-effect text-white hover:bg-white/20 font-medium py-2 px-3 xl:px-4 rounded-lg transition-all duration-200 flex items-center text-sm"
              >
                <User className="h-4 w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">My Profile</span>
                <span className="xl:hidden">Profile</span>
              </Link>
              <Link
                to="/chat"
                onClick={handleMessagesClick}
                className="glass-effect relative text-white hover:bg-white/20 font-medium py-2 px-3 xl:px-4 rounded-lg transition-all duration-200 flex items-center text-sm"
              >
                <Mail className="h-4 w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">Messages</span>
                <span className="xl:hidden">Chat</span>
                {unreadCount > 0 && (
                  <span className="ml-1 xl:ml-2 inline-flex items-center justify-center px-1.5 xl:px-2 py-0.5 text-xs font-semibold leading-4 rounded-full bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {showAddUser && onAddUser && (
                <ActionButton
                  type="primary"
                  iconType="add"
                  onClick={onAddUser}
                  className="text-sm px-3 xl:px-4"
                >
                  <span className="hidden xl:inline">Add User</span>
                  <span className="xl:hidden">Add</span>
                </ActionButton>
              )}
              {customActions.map((action, index) => (
                <div key={index} className="hidden xl:block">
                  {action}
                </div>
              ))}
              <button
                onClick={handleLogout}
                className="glass-effect text-white hover:bg-white/20 font-medium py-2 px-3 xl:px-4 rounded-lg transition-all duration-200 flex items-center text-sm"
              >
                <LogOut className="h-4 w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">Logout</span>
                <span className="xl:hidden">Exit</span>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">
                  {user?.username || user?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/${role}/profile`}
                  className="glass-effect text-white hover:bg-white/20 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center text-sm"
                >
                  <User className="h-4 w-4" />
                </Link>
                <Link
                  to="/chat"
                  onClick={handleMessagesClick}
                  className="glass-effect relative text-white hover:bg-white/20 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center text-sm"
                >
                  <Mail className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-4 rounded-full bg-red-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                {showAddUser && onAddUser && (
                  <ActionButton
                    type="primary"
                    iconType="add"
                    onClick={onAddUser}
                    className="text-sm px-3"
                  >
                    Add
                  </ActionButton>
                )}
                {customActions.map((action, index) => (
                  <div key={index}>
                    {action}
                  </div>
                ))}
                <button
                  onClick={handleLogout}
                  className="glass-effect text-white hover:bg-white/20 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center text-sm"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-4 sm:p-6 border-l-4 border-qassim-blue hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-qassim-blue" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                    <p className="text-lg sm:text-2xl font-semibold text-qassim-blue">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-400 truncate">{stat.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {quickActions.map((action, index) => (
              <div key={index} className="glass-card p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{action.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {action.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-3 sm:ml-4">
                    <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-qassim-blue" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <Link
                    to={action.href}
                    className="btn-primary inline-flex items-center text-sm sm:text-base px-3 sm:px-4 py-2"
                  >
                    {action.buttonText || 'Go to ' + action.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
