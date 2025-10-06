import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Users, Settings, BarChart3, TrendingUp, Phone, Calendar, UserCheck } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import { useEffect, useState } from 'react'
import { DashboardLayout, ScheduleManagement } from '../components'
import axios from 'axios'

const ManagerDashboard = () => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])

  // Manager-specific stats
  const managerDepartment = departments.find(dept => dept.head === user?._id)
  const teamEmployees = employees.filter(emp => emp.department === managerDepartment?._id)
  const activeTeamMembers = teamEmployees.filter(emp => emp.isActive !== false).length
  const teamWithExtensions = teamEmployees.filter(emp => emp.extension).length

  const stats = [
    { 
      name: 'Team Members', 
      value: teamEmployees.length, 
      icon: Users, 
      subtitle: `${activeTeamMembers} active`
    },
    { 
      name: 'Department', 
      value: managerDepartment?.name || 'No Department', 
      icon: Settings, 
      subtitle: 'Your department'
    },
    { 
      name: 'Extensions', 
      value: teamWithExtensions, 
      icon: Phone, 
      subtitle: `${teamEmployees.length > 0 ? ((teamWithExtensions/teamEmployees.length)*100).toFixed(0) : 0}% coverage`
    },
    { 
      name: 'Role', 
      value: 'Manager', 
      icon: UserCheck, 
      subtitle: 'Department manager'
    }
  ]

  const quickActions = [
    {
      name: 'Manage Team',
      description: 'View team members, track performance, and manage department resources',
      icon: Users,
      href: '/manager/team',
      buttonText: 'View Team'
    },
    {
      name: 'Department Schedule',
      description: 'Set working hours, manage shifts, and coordinate team schedules',
      icon: Calendar,
      href: '#schedule',
      buttonText: 'Manage Schedule'
    },
    {
      name: 'Team Communication',
      description: 'Send announcements, coordinate projects, and maintain team communication',
      icon: Phone,
      href: '/manager/inbox',
      buttonText: 'View Messages'
    }
  ]

  useEffect(() => {
    let socket
    ;(async () => {
      try {
        await dispatch(fetchEmployees())
        await dispatch(fetchDepartments())
      } catch {}
    })()
    return () => { socket && socket.disconnect() }
  }, [token, user])

  if (user?.role !== 'manager') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle={managerDepartment ? `Leading ${managerDepartment.name} department` : 'Department leadership and team management'}
      role="manager"
      stats={stats}
      quickActions={quickActions}
    >
      {/* Schedule Management */}
      {managerDepartment && (
        <div className="mb-8">
          <ScheduleManagement 
            departmentId={managerDepartment._id}
            departmentName={managerDepartment.name}
          />
        </div>
      )}

      {/* Team Overview */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Overview</h3>
        </div>
        <div className="p-6">
          {teamEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamEmployees.slice(0, 6).map((employee) => (
                <div key={employee._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-qassim-blue flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {employee.firstName?.[0] || employee.name?.[0] || 'E'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {employee.extension ? `Ext: ${employee.extension}` : 'No extension'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">No team members found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManagerDashboard