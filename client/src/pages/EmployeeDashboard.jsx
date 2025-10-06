import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { User, Settings, LogOut, Phone, Mail, Calendar, Clock, MapPin } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
// Replace Logo component with public image

const EmployeeDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  // Employee data from API
  const employeeInfo = {
    name: user?.username || 'Employee',
    department: typeof user?.department === 'object' ? user?.department?.name : user?.department || 'General',
    extension: user?.extension || '1001',
    email: user?.email || 'employee@company.com',
    phone: user?.phone || '+966501234567',
    position: user?.position || 'Employee',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024-01-15',
    location: 'Riyadh Office'
  }

  const quickActions = [
    { name: 'My Profile', icon: User, href: '/employee/profile', color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Schedule', icon: Calendar, href: '/schedule', color: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Notifications', icon: Clock, href: '/employee/notifications', color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Messages', icon: Mail, href: '/chat', color: 'bg-orange-500 hover:bg-orange-600' }
  ]

  if (user?.role !== 'employee') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qassim-blue"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-qassim-blue rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">{employeeInfo.name}</h2>
                <p className="text-lg text-gray-600">{employeeInfo.position}</p>
                <p className="text-sm text-gray-500">{employeeInfo.department} Department</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-md bg-blue-500">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Extension
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {employeeInfo.extension}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-md bg-green-500">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Email
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 truncate">
                      {employeeInfo.email}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-md bg-purple-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Join Date
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {employeeInfo.joinDate}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-md bg-orange-500">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Location
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {employeeInfo.location}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className={`relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-qassim-blue rounded-lg border border-gray-300 hover:border-gray-400 transition-colors`}
                >
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.name}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-2" />
                <span>Member of {employeeInfo.department} department</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeDashboard
