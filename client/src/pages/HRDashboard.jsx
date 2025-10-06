import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Users, Settings, BarChart3, TrendingUp, Phone, Calendar, UserPlus } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import { DashboardLayout } from '../components'

const HRDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])

  // HR-specific stats
  const totalEmployees = employees.length
  const totalDepartments = departments.length
  const employeesWithExtensions = employees.filter(emp => emp.extension).length
  const employeesWithEmail = employees.filter(emp => emp.email).length
  const activeEmployees = employees.filter(emp => emp.isActive !== false).length
  const inactiveEmployees = employees.filter(emp => emp.isActive === false).length

  const stats = [
    { 
      name: 'Total Employees', 
      value: totalEmployees, 
      icon: Users, 
      subtitle: `${activeEmployees} active`
    },
    { 
      name: 'Active Employees', 
      value: activeEmployees, 
      icon: Users, 
      subtitle: `${totalEmployees > 0 ? ((activeEmployees/totalEmployees)*100).toFixed(0) : 0}% active`
    },
    { 
      name: 'Departments', 
      value: totalDepartments, 
      icon: BarChart3, 
      subtitle: 'Total departments'
    },
    { 
      name: 'With Extensions', 
      value: employeesWithExtensions, 
      icon: Phone, 
      subtitle: `${totalEmployees > 0 ? ((employeesWithExtensions/totalEmployees)*100).toFixed(0) : 0}% coverage`
    }
  ]

  const quickActions = [
    {
      name: 'Add Employee',
      description: 'Add new employees to the system',
      icon: UserPlus,
      href: '/hr/employees/add',
      buttonText: 'Add Employee'
    },
    {
      name: 'View Employees',
      description: 'Manage existing employee records',
      icon: Users,
      href: '/hr/employees',
      buttonText: 'View Employees'
    },
    {
      name: 'Departments',
      description: 'Manage department structure',
      icon: BarChart3,
      href: '/hr/departments',
      buttonText: 'Manage Departments'
    },
    {
      name: 'Reports',
      description: 'View HR analytics and reports',
      icon: TrendingUp,
      href: '/hr/reports',
      buttonText: 'View Reports'
    }
  ]

  if (user?.role !== 'hr') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle="Manage employees, departments, and organizational structure"
      role="hr"
      stats={stats}
      quickActions={quickActions}
    >
      {/* HR-specific content */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">HR Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Employee Management</h4>
              <p className="text-sm text-blue-700">
                Add new employees, update records, manage roles and permissions, and maintain accurate employee information across all departments.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Organizational Structure</h4>
              <p className="text-sm text-green-700">
                Create and manage departments, assign managers, track employee distribution, and maintain organizational hierarchy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HRDashboard