import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Users, Plus, Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import { DashboardLayout, PageHeader, ActionButton, EmptyState, QassimLoadingSpinner } from '../components'
import { useNotifications } from '../hooks/useNotifications'
import axios from 'axios'

const HREmployeesPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { user, token } = useSelector((state) => state.auth)
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const loading = useSelector((state) => state.employees.loading)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.extension?.includes(searchTerm)

    const matchesDepartment = !selectedDepartment || 
      employee.department === selectedDepartment

    const matchesRole = !selectedRole || 
      employee.role === selectedRole

    const matchesActive = showInactive || employee.isActive !== false

    return matchesSearch && matchesDepartment && matchesRole && matchesActive
  })

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp._id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedEmployees.length === 0) {
      showError('Please select employees first')
      return
    }

    try {
      const response = await axios.post(`/api/employees/bulk-${action}`, {
        employeeIds: selectedEmployees
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        showSuccess(`${action} completed for ${selectedEmployees.length} employees`)
        setSelectedEmployees([])
        dispatch(fetchEmployees())
      }
    } catch (error) {
      showError(`Failed to ${action} employees`)
    }
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/employees/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `employees-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      showSuccess('Employee data exported successfully')
    } catch (error) {
      showError('Failed to export employee data')
    }
  }

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d._id === departmentId)
    return dept?.name || 'Unknown Department'
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'hr': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (user?.role !== 'hr') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  const stats = [
    { 
      name: 'Total Employees', 
      value: employees.length, 
      icon: Users, 
      subtitle: `${employees.filter(emp => emp.isActive !== false).length} active`
    },
    { 
      name: 'Selected', 
      value: selectedEmployees.length, 
      icon: Users, 
      subtitle: 'for bulk actions'
    },
    { 
      name: 'Departments', 
      value: departments.length, 
      icon: Users, 
      subtitle: 'active departments'
    },
    { 
      name: 'With Extensions', 
      value: employees.filter(emp => emp.extension).length, 
      icon: Users, 
      subtitle: 'have phone extensions'
    }
  ]

  const quickActions = [
    {
      name: 'Add Employee',
      description: 'Add a new employee to the system',
      icon: Plus,
      href: '/hr/employees/add',
      buttonText: 'Add Employee'
    },
    {
      name: 'Export Data',
      description: 'Export employee data to Excel',
      icon: Download,
      href: '#',
      buttonText: 'Export',
      onClick: handleExport
    }
  ]

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle="Employee Management"
      role="hr"
      stats={stats}
      quickActions={quickActions}
    >
      <PageHeader
        title="Employee Management"
        subtitle="Manage employee records, roles, and information"
        actions={[
          <ActionButton
            key="add-employee"
            type="primary"
            iconType="add"
            onClick={() => window.location.href = '/hr/employees/add'}
          >
            Add Employee
          </ActionButton>
        ]}
      />

      {/* Filters and Search */}
      <div className="glass-card mb-6">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
              />
              <span className="text-sm text-gray-700">Show Inactive</span>
            </label>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedEmployees.length} selected
              </span>
              <div className="flex space-x-2">
                <ActionButton
                  type="secondary"
                  iconType="edit"
                  onClick={() => handleBulkAction('update')}
                >
                  Bulk Update
                </ActionButton>
                <ActionButton
                  type="danger"
                  iconType="delete"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Employees ({filteredEmployees.length})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8">
              <QassimLoadingSpinner size="lg" text="Loading employees..." />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8">
              <EmptyState
                type="employees"
                title="No employees found"
                description="No employees match your current filters."
                actions={[
                  <ActionButton
                    key="add-employee"
                    type="primary"
                    iconType="add"
                    onClick={() => window.location.href = '/hr/employees/add'}
                  >
                    Add Employee
                  </ActionButton>
                ]}
              />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extension
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={() => handleSelectEmployee(employee._id)}
                        className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-qassim-blue flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {employee.firstName?.[0] || employee.name?.[0] || 'E'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDepartmentName(employee.department)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.extension || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.isActive !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.location.href = `/hr/employees/${employee._id}`}
                          className="text-qassim-blue hover:text-qassim-blue-dark"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.location.href = `/hr/employees/${employee._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to deactivate this employee?')) {
                              // Handle deactivation
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HREmployeesPage
