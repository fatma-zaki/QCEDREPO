import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Edit, Trash2, Eye, Download } from 'lucide-react'
import { fetchEmployees, deleteEmployee, setSearchTerm, setFilterDepartment, setSortBy, setSortOrder, exportEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import AdvancedSearch from '../components/AdvancedSearch'
import AvatarUpload from '../components/AvatarUpload'
import QRCodeGenerator from '../components/QRCodeGenerator'
import BulkOperations from '../components/BulkOperations'
import { EmployeeForm, ActionButton, PageHeader, QassimLoadingSpinner, EmptyState } from '../components'
import { useNotifications } from '../hooks/useNotifications'

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { user } = useSelector((state) => state.auth || {})
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const searchTerm = useSelector((state) => state.employees.searchTerm || '')
  const filterDepartment = useSelector((state) => state.employees.filterDepartment || '')
  const sortBy = useSelector((state) => state.employees.sortBy || 'name')
  const sortOrder = useSelector((state) => state.employees.sortOrder || 'asc')
  const loading = useSelector((state) => state.employees.loading)
  const error = useSelector((state) => state.employees.error)
  
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.extension?.toString().includes(searchTerm) ||
        employee.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDepartment = !filterDepartment || employee.department?._id === filterDepartment
      
      return matchesSearch && matchesDepartment
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'extension':
          aValue = parseInt(a.extension) || 0
          bValue = parseInt(b.extension) || 0
          break
        case 'department':
          aValue = a.department?.name || ''
          bValue = b.department?.name || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || a.updatedAt)
          bValue = new Date(b.createdAt || b.updatedAt)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleEmployeeSuccess = () => {
    // Refresh employees list after successful creation/update
    dispatch(fetchEmployees())
  }

  const handleEdit = (employee) => {
    // Prevent non-admin users from editing admin employees
    if (employee.role === 'admin' && user?.role !== 'admin') {
      showError('Only administrators can edit admin accounts')
      return
    }
    
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await dispatch(deleteEmployee(id))
      if (deleteEmployee.fulfilled.match(result)) {
        showSuccess('Employee deleted successfully!')
      } else {
        showError('Failed to delete employee')
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
  }

  const handleExport = async (format) => {
    try {
      setExportLoading(true)
      const resultAction = await dispatch(exportEmployees(format))
      if (exportEmployees.fulfilled.match(resultAction)) {
        const { data, format: fileFormat } = resultAction.payload
        
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `employees.${fileFormat}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        showSuccess(`Employees exported to ${fileFormat.toUpperCase()} successfully!`)
      } else {
        showError('Failed to export employees')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showError('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowEmployeeDetails(true)
  }

  const headerActions = [
    <ActionButton
      key="export-csv"
      type="secondary"
      iconType="export-csv"
      onClick={() => handleExport('csv')}
      disabled={exportLoading}
    >
      {exportLoading ? 'Exporting...' : 'Export CSV'}
    </ActionButton>,
    <ActionButton
      key="export-excel"
      type="success"
      iconType="export-excel"
      onClick={() => handleExport('excel')}
      disabled={exportLoading}
    >
      {exportLoading ? 'Exporting...' : 'Export Excel'}
    </ActionButton>
  ]

  if (user?.role === 'admin') {
    headerActions.push(
      <ActionButton
        key="add-employee"
        type="primary"
        iconType="add"
        onClick={() => setShowModal(true)}
      >
        Add Employee
      </ActionButton>
    )
  }

  const headerSubtitle = (
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-white/80">
                    Role: <span className="font-medium capitalize">{user?.role}</span>
                  </span>
                  {user?.role === 'manager' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      View & Update Only
                    </span>
                  )}
                </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <PageHeader
        title="Manage Employees"
        subtitle={headerSubtitle}
        backUrl="/admin"
        actions={headerActions}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchChange={(value) => dispatch(setSearchTerm(value))}
          filterDepartment={filterDepartment}
          onFilterChange={(value) => dispatch(setFilterDepartment(value))}
          sortBy={sortBy}
          onSortChange={(value) => dispatch(setSortBy(value))}
          sortOrder={sortOrder}
          onSortOrderChange={(value) => dispatch(setSortOrder(value))}
          departments={departments}
        />

        {/* Bulk Operations */}
        <BulkOperations
          selectedEmployees={selectedEmployees}
          onSelectionChange={setSelectedEmployees}
          employees={filteredEmployees}
          departments={departments}
          onRefresh={() => dispatch(fetchEmployees())}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Employees List */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Employees ({filteredEmployees.length})
            </h2>
          </div>

          {loading ? (
            <QassimLoadingSpinner size="lg" text="Loading employees..." className="py-12" />
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              type="employees"
              title="No employees found"
              description="Get started by adding a new employee."
              actions={user?.role === 'admin' ? [
                <ActionButton
                  key="add-first-employee"
                  type="primary"
                  iconType="add"
                  onClick={() => setShowModal(true)}
                >
                  Add First Employee
                </ActionButton>
              ] : []}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={() => {
                          if (selectedEmployees.includes(employee._id)) {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee._id))
                          } else {
                            setSelectedEmployees([...selectedEmployees, employee._id])
                          }
                        }}
                        className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          disabled={employee.role === 'admin' && user?.role !== 'admin'}
                          className={`p-1 ${employee.role === 'admin' && user?.role !== 'admin' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-qassim-blue hover:text-qassim-blue-dark'}`}
                          title={employee.role === 'admin' && user?.role !== 'admin' 
                            ? 'Only administrators can edit admin accounts' 
                            : 'Edit Employee'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Employee (Admin Only)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 mr-3">
                        <AvatarUpload
                          currentAvatar={employee.avatar}
                          onAvatarChange={() => {}}
                          size="medium"
                          editable={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {employee.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {employee.department?.name || 'No Department'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      {employee.role && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Role:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.role === 'admin' ? 'bg-red-100 text-red-800' :
                            employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            employee.role === 'hr' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                          </span>
                        </div>
                      )}
                      {employee.extension && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Ext:</span>
                          <span>{employee.extension}</span>
                        </div>
                      )}
                      {employee.email && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Email:</span>
                          <span className="truncate">{employee.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <QRCodeGenerator employee={employee} type="employee_card" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-full max-w-4xl shadow-2xl rounded-2xl glass-card">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Employee Details
                </h3>
                <button
                  onClick={() => {
                    setShowEmployeeDetails(false)
                    setSelectedEmployee(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee Info */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">
                        <AvatarUpload
                          currentAvatar={selectedEmployee.avatar}
                          onAvatarChange={() => {}}
                          size="xlarge"
                          editable={false}
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedEmployee.name}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {selectedEmployee.department?.name || 'No Department'}
                      </p>
                      {selectedEmployee.role && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedEmployee.role === 'admin' ? 'bg-red-100 text-red-800' :
                          selectedEmployee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          selectedEmployee.role === 'hr' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {selectedEmployee.extension || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Extension</p>
                          <p className="text-sm text-gray-500">
                            {selectedEmployee.extension || 'Not assigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-medium">@</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">
                            {selectedEmployee.email || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-medium">
                            {selectedEmployee.isActive !== false ? '✓' : '✗'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Status</p>
                          <p className="text-sm text-gray-500">
                            {selectedEmployee.isActive !== false ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <QRCodeGenerator employee={selectedEmployee} type="employee_card" />
                    </div>
                  </div>
                </div>

                {/* Actions & History */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setShowEmployeeDetails(false)
                            setSelectedEmployee(null)
                            handleEdit(selectedEmployee)
                          }}
                          disabled={selectedEmployee?.role === 'admin' && user?.role !== 'admin'}
                          className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                            selectedEmployee?.role === 'admin' && user?.role !== 'admin'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          {selectedEmployee?.role === 'admin' && user?.role !== 'admin' 
                            ? 'Edit Restricted' 
                            : 'Edit Employee'}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedEmployee.email || '')
                            showSuccess('Email copied to clipboard!')
                          }}
                          className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Copy Email
                        </button>
                        {selectedEmployee.extension && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedEmployee.extension)
                              showSuccess('Extension copied to clipboard!')
                            }}
                            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <Download className="h-5 w-5 mr-2" />
                            Copy Extension
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const contactInfo = `Name: ${selectedEmployee.name}\nExtension: ${selectedEmployee.extension || 'N/A'}\nEmail: ${selectedEmployee.email || 'N/A'}\nDepartment: ${selectedEmployee.department?.name || 'N/A'}`
                            navigator.clipboard.writeText(contactInfo)
                            showSuccess('Contact info copied to clipboard!')
                          }}
                          className="flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Copy Contact
                        </button>
                      </div>
                    </div>

                    {/* Employee Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Detailed Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.position || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.role ? selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.department?.name || 'No Department'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.phone || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedEmployee.updatedAt ? new Date(selectedEmployee.updatedAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h5>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Employee profile updated</p>
                            <p className="text-xs text-gray-500">
                              {selectedEmployee.updatedAt ? new Date(selectedEmployee.updatedAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Employee created</p>
                            <p className="text-xs text-gray-500">
                              {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmployeeForm
        isOpen={showModal}
        onClose={handleCloseModal}
        editingEmployee={editingEmployee}
        onSuccess={handleEmployeeSuccess}
      />
    </div>
  )
}

export default EmployeesPage
