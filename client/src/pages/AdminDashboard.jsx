import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Users, Settings, BarChart3, TrendingUp, Phone, Calendar } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import DepartmentChart from '../components/Charts/DepartmentChart'
import EmployeeStatsChart from '../components/Charts/EmployeeStatsChart'
import ExtensionUsageChart from '../components/Charts/ExtensionUsageChart'
import { EmployeeForm, DashboardLayout } from '../components'
import axios from 'axios'


const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const creatingUser = useSelector((state) => state.employees.loading)
  const userError = useSelector((state) => state.employees.error)

  const [showAddUser, setShowAddUser] = useState(false)
  const [recentActions, setRecentActions] = useState([])
  const [loadingActions, setLoadingActions] = useState(false)

  // Enhanced stats
  const totalEmployees = employees.length
  const totalDepartments = departments.length
  const employeesWithExtensions = employees.filter(emp => emp.extension).length
  const employeesWithEmail = employees.filter(emp => emp.email).length
  const activeEmployees = employees.filter(emp => emp.isActive !== false).length
  const inactiveEmployees = employees.filter(emp => emp.isActive === false).length
  const recentEmployees = employees.filter(emp => {
    const empDate = new Date(emp.createdAt || emp.updatedAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return empDate > thirtyDaysAgo
  }).length

  const stats = [
    { 
      name: 'Total Employees', 
      value: totalEmployees, 
      icon: Users, 
      subtitle: `${activeEmployees} active`
    },
    { 
      name: 'Departments', 
      value: totalDepartments, 
      icon: Settings, 
      subtitle: 'Active departments'
    },
    { 
      name: 'Extensions', 
      value: employeesWithExtensions, 
      icon: Phone, 
      subtitle: `${((employeesWithExtensions/totalEmployees)*100).toFixed(0)}% coverage`
    },
    { 
      name: 'Recent Hires', 
      value: recentEmployees, 
      icon: TrendingUp, 
      subtitle: 'Last 30 days'
    }
  ]

  const quickActions = [
    {
      name: 'Employee Management',
      description: 'Comprehensive employee administration, role management, and system oversight',
      icon: Users,
      href: '/admin/employees',
      buttonText: 'Go to Employees'
    },
    {
      name: 'Department Administration',
      description: 'Organizational structure management, department creation, and hierarchy control',
      icon: Settings,
      href: '/admin/departments',
      buttonText: 'Go to Departments'
    },
    {
      name: 'System Scheduling',
      description: 'Organization-wide schedule coordination and time management oversight',
      icon: Calendar,
      href: '/schedule',
      buttonText: 'Manage Schedules'
    }
  ]

  useEffect(() => {
    let socket
    ;(async () => {
      try {
        const { io } = await import('socket.io-client')
        socket = io('/', { auth: { token } })
        socket.on('message:new', (msg) => {
          if (msg.toRole === 'admin') {
            // Check if the message is not from the current user
            const isMine = (msg.from?.name || msg.from?.username) === (user?.username || user?.name)
            if (!isMine) {
              // Increment unread count for new messages not from current user
              setUnreadAdmin((c) => c + 1)
            }
          }
        })
      } catch {}
    })()
    return () => { socket && socket.disconnect() }
  }, [token, user])

  // Fetch recent audit logs
  useEffect(() => {
    const fetchRecentActions = async () => {
      if (!token || !user) return
      
      try {
        setLoadingActions(true)
        const res = await axios.get('/api/audit?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRecentActions(res.data.data?.logs || [])
      } catch (error) {
        console.error('Failed to fetch recent actions:', error)
        // Show empty state instead of mock data
        setRecentActions([])
      } finally {
        setLoadingActions(false)
      }
    }

    fetchRecentActions()
  }, [token, user])

  const handleEmployeeSuccess = () => {
    // Refresh employees list after successful creation
    dispatch(fetchEmployees())
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  // Mark admin messages as read when navigating to chat
  const handleMessagesClick = async () => {
    try {
      // Mark admin channel messages as read
      await axios.post('/api/messages/read', { channelRole: 'admin' }, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      // Reset unread count
      setUnreadAdmin(0)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  // Helper function to format action descriptions
  const formatActionDescription = (action) => {
    const actionMap = {
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted',
      'LOGIN': 'Logged in',
      'LOGOUT': 'Logged out',
      'EXPORT': 'Exported data',
      'GENERATE_QR': 'Generated QR code',
      'GENERATE_CONTACT_QR': 'Generated contact QR',
      'GENERATE_CARD_QR': 'Generated card QR',
      'GENERATE_BULK_QR': 'Generated bulk QR codes',
      'VIEW_AUDIT_LOGS': 'Viewed audit logs',
      'VIEW_AUDIT_STATS': 'Viewed audit statistics',
      'VIEW_AUDIT_LOG': 'Viewed audit log',
      'BULK_DELETE': 'Bulk deleted',
      'BULK_UPDATE': 'Bulk updated',
      'BULK_TOGGLE_STATUS': 'Bulk toggled status',
      'BULK_ASSIGN_DEPARTMENT': 'Bulk assigned department',
      'SEND_WELCOME_EMAIL': 'Sent welcome email',
      'SEND_BULK_EMAIL': 'Sent bulk email',
      'SEND_ANNOUNCEMENT': 'Sent announcement',
      'CHANGE_PASSWORD': 'Changed password',
      'VIEW_USER': 'Viewed user',
      'CREATE_USER': 'Created user',
      'UPDATE_USER': 'Updated user',
      'DELETE_USER': 'Deleted user'
    }
    
    return actionMap[action] || action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="System administration and organizational management"
      role="admin"
      stats={stats}
      quickActions={quickActions}
      showAddUser={true}
      onAddUser={() => setShowAddUser(true)}
    >
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DepartmentChart departments={departments} employees={employees} />
        <EmployeeStatsChart employees={employees} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <ExtensionUsageChart employees={employees} />
      </div>

      {/* Recent Actions */}
      <div className="mt-8">
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Actions</h3>
              <a
                href="/admin/audit"
                className="text-sm text-qassim-blue hover:text-qassim-blue/80 font-medium"
              >
                View All Activity
              </a>
            </div>
          </div>
          <div className="p-6">
            {loadingActions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qassim-blue"></div>
                <span className="ml-2 text-sm text-gray-500">Loading recent actions...</span>
              </div>
            ) : recentActions.length > 0 ? (
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div key={action._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {action.user?.name?.[0] || action.user?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {action.user?.name || `${action.user?.firstName || ''} ${action.user?.lastName || ''}`.trim() || 'Unknown User'}
                          <span className="ml-2 text-xs text-gray-500">({action.user?.role || 'Unknown'})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatActionDescription(action.action)}
                          {action.details?.employeeName && ` - ${action.details.employeeName}`}
                          {action.details?.departmentName && ` - ${action.details.departmentName}`}
                          {action.target && ` on ${action.target}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(action.createdAt).toLocaleDateString()} at {new Date(action.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <BarChart3 className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">No recent actions found</p>
              </div>
            )}
          </div>
        </div>
      </div>


      <EmployeeForm
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSuccess={handleEmployeeSuccess}
      />
    </DashboardLayout>
  )
}

export default AdminDashboard
