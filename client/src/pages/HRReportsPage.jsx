import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { BarChart3, TrendingUp, Users, Building2, Download, Calendar, FileText, PieChart } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import { DashboardLayout, PageHeader, ActionButton } from '../components'
import { useNotifications } from '../hooks/useNotifications'
import axios from 'axios'

const HRReportsPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { user, token } = useSelector((state) => state.auth)
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const loading = useSelector((state) => state.employees.loading)

  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('30')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  // Calculate statistics
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.isActive !== false).length
  const inactiveEmployees = employees.filter(emp => emp.isActive === false).length
  const employeesWithExtensions = employees.filter(emp => emp.extension).length
  const employeesWithEmail = employees.filter(emp => emp.email).length

  // Department statistics
  const departmentStats = departments.map(dept => ({
    name: dept.name,
    employeeCount: employees.filter(emp => emp.department === dept._id).length,
    activeCount: employees.filter(emp => emp.department === dept._id && emp.isActive !== false).length,
    hasManager: !!dept.head
  }))

  // Role statistics
  const roleStats = [
    { role: 'Admin', count: employees.filter(emp => emp.role === 'admin').length },
    { role: 'Manager', count: employees.filter(emp => emp.role === 'manager').length },
    { role: 'HR', count: employees.filter(emp => emp.role === 'hr').length },
    { role: 'Employee', count: employees.filter(emp => emp.role === 'employee').length }
  ]

  // Recent hires (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentHires = employees.filter(emp => {
    const hireDate = new Date(emp.createdAt || emp.updatedAt)
    return hireDate > thirtyDaysAgo
  }).length

  const handleGenerateReport = async (reportType) => {
    setIsGenerating(true)
    try {
      const response = await axios.get(`/api/reports/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { dateRange },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      showSuccess(`${reportType} report generated successfully!`)
    } catch (error) {
      console.error('Generate report error:', error)
      showError('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  if (user?.role !== 'hr') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  const stats = [
    { 
      name: 'Total Employees', 
      value: totalEmployees, 
      icon: Users, 
      subtitle: `${activeEmployees} active, ${inactiveEmployees} inactive`
    },
    { 
      name: 'Departments', 
      value: departments.length, 
      icon: Building2, 
      subtitle: `${departments.filter(dept => dept.isActive !== false).length} active`
    },
    { 
      name: 'Recent Hires', 
      value: recentHires, 
      icon: TrendingUp, 
      subtitle: 'last 30 days'
    },
    { 
      name: 'Coverage', 
      value: `${Math.round((employeesWithExtensions / totalEmployees) * 100)}%`, 
      icon: Users, 
      subtitle: 'have phone extensions'
    }
  ]

  const reportTypes = [
    {
      id: 'overview',
      name: 'HR Overview',
      description: 'Complete HR dashboard with employee statistics',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'employees',
      name: 'Employee Report',
      description: 'Detailed employee information and demographics',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'departments',
      name: 'Department Report',
      description: 'Department structure and employee distribution',
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      id: 'analytics',
      name: 'HR Analytics',
      description: 'Advanced analytics and trends analysis',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle="Reports & Analytics"
      role="hr"
      stats={stats}
    >
      <PageHeader
        title="HR Reports & Analytics"
        subtitle="Generate comprehensive reports and analyze HR data"
        actions={[
          <ActionButton
            key="generate-report"
            type="primary"
            iconType="add"
            onClick={() => handleGenerateReport(selectedReport)}
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </ActionButton>
        ]}
      />

      {/* Report Selection */}
      <div className="glass-card mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedReport === report.id
                    ? 'border-qassim-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${report.color} text-white mr-3`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="glass-card mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format
              </label>
              <select
                defaultValue="excel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="glass-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      <span className="text-sm text-gray-500">{dept.employeeCount} employees</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-qassim-blue h-2 rounded-full"
                        style={{ width: `${(dept.employeeCount / totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="glass-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {roleStats.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{role.role}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{role.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-qassim-gold h-2 rounded-full"
                        style={{ width: `${(role.count / totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="glass-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Hires</p>
              <p className="text-2xl font-semibold text-gray-900">{recentHires}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Extension Coverage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round((employeesWithExtensions / totalEmployees) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-card mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              type="secondary"
              iconType="download"
              onClick={() => handleGenerateReport('employees')}
              loading={isGenerating}
            >
              Export Employee Data
            </ActionButton>
            <ActionButton
              type="secondary"
              iconType="download"
              onClick={() => handleGenerateReport('departments')}
              loading={isGenerating}
            >
              Export Department Data
            </ActionButton>
            <ActionButton
              type="secondary"
              iconType="download"
              onClick={() => handleGenerateReport('analytics')}
              loading={isGenerating}
            >
              Export Analytics
            </ActionButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HRReportsPage
