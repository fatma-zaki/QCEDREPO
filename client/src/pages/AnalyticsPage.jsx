import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Download, TrendingUp, Users, Building, Phone, Mail } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
// Replace Logo component with public image
import DepartmentChart from '../components/Charts/DepartmentChart'
import EmployeeStatsChart from '../components/Charts/EmployeeStatsChart'
import ExtensionUsageChart from '../components/Charts/ExtensionUsageChart'

const AnalyticsPage = () => {
  const dispatch = useDispatch()
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])

  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [exportFormat, setExportFormat] = useState('pdf')

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  // Calculate comprehensive analytics
  const analytics = {
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    employeesWithExtensions: employees.filter(emp => emp.extension).length,
    employeesWithEmail: employees.filter(emp => emp.email).length,
    employeesWithPhone: employees.filter(emp => emp.phone).length,
    activeEmployees: employees.filter(emp => emp.isActive !== false).length,
    inactiveEmployees: employees.filter(emp => emp.isActive === false).length,
    recentEmployees: employees.filter(emp => {
      const empDate = new Date(emp.createdAt || emp.updatedAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return empDate > thirtyDaysAgo
    }).length,
    departmentStats: departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.department?._id === dept._id).length,
      percentage: ((employees.filter(emp => emp.department?._id === dept._id).length / employees.length) * 100).toFixed(1)
    })),
    extensionCoverage: ((employees.filter(emp => emp.extension).length / employees.length) * 100).toFixed(1),
    emailCoverage: ((employees.filter(emp => emp.email).length / employees.length) * 100).toFixed(1),
    phoneCoverage: ((employees.filter(emp => emp.phone).length / employees.length) * 100).toFixed(1)
  }

  const handleExportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      analytics: analytics,
      employees: employees,
      departments: departments
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qced-analytics-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="header-gradient shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-white hover:text-qassim-gold" />
              </a>
              <div className="mr-4">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
              </div>
              <div className="ml-4">
                <p className="text-white text-sm font-medium">
                  Analytics & Reports
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="glass-effect text-white bg-white/20 border-white/30 rounded-lg px-3 py-2"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <button
                onClick={handleExportReport}
                className="glass-effect text-white hover:bg-white/20 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 border-l-4 border-qassim-blue hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-qassim-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold text-qassim-blue">{analytics.totalEmployees}</p>
                <p className="text-xs text-gray-400">{analytics.activeEmployees} active</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Extension Coverage</p>
                <p className="text-2xl font-semibold text-green-500">{analytics.extensionCoverage}%</p>
                <p className="text-xs text-gray-400">{analytics.employeesWithExtensions} employees</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Email Coverage</p>
                <p className="text-2xl font-semibold text-purple-500">{analytics.emailCoverage}%</p>
                <p className="text-xs text-gray-400">{analytics.employeesWithEmail} employees</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-qassim-gold hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-qassim-gold" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-2xl font-semibold text-qassim-gold">{analytics.totalDepartments}</p>
                <p className="text-xs text-gray-400">Active departments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DepartmentChart departments={departments} employees={employees} />
          <EmployeeStatsChart employees={employees} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <ExtensionUsageChart employees={employees} />
        </div>

        {/* Department Breakdown */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extensions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.departmentStats.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-qassim-blue h-2 rounded-full" 
                            style={{ width: `${dept.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{dept.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employees.filter(emp => 
                        emp.department?._id === departments.find(d => d.name === dept.name)?._id && emp.extension
                      ).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
