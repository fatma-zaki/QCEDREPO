import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Building2, Plus, Search, Users, Edit, Trash2, UserCheck } from 'lucide-react'
import { fetchDepartments } from '../store/slices/departmentSlice'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { DashboardLayout, PageHeader, ActionButton, EmptyState, QassimLoadingSpinner } from '../components'
import { useNotifications } from '../hooks/useNotifications'
import axios from 'axios'

const HRDepartmentsPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { user, token } = useSelector((state) => state.auth)
  const departments = useSelector((state) => state.departments.departments || [])
  const employees = useSelector((state) => state.employees.employees || [])
  const loading = useSelector((state) => state.departments.loading)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizationalCode: '',
    level: 'department',
    contactEmail: '',
    isActive: true
  })

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchEmployees())
  }, [dispatch])

  // Filter departments based on search and filters
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = !searchTerm || 
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.organizationalCode?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = !selectedLevel || dept.level === selectedLevel
    const matchesActive = showInactive || dept.isActive !== false

    return matchesSearch && matchesLevel && matchesActive
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddDepartment = () => {
    setFormData({
      name: '',
      description: '',
      organizationalCode: '',
      level: 'department',
      contactEmail: '',
      isActive: true
    })
    setEditingDepartment(null)
    setShowAddModal(true)
  }

  const handleEditDepartment = (department) => {
    setFormData({
      name: department.name,
      description: department.description || '',
      organizationalCode: department.organizationalCode || '',
      level: department.level || 'department',
      contactEmail: department.contactEmail || '',
      isActive: department.isActive !== false
    })
    setEditingDepartment(department)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingDepartment(null)
    setFormData({
      name: '',
      description: '',
      organizationalCode: '',
      level: 'department',
      contactEmail: '',
      isActive: true
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingDepartment) {
        const response = await axios.put(`/api/departments/${editingDepartment._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          showSuccess('Department updated successfully!')
          dispatch(fetchDepartments())
        }
      } else {
        const response = await axios.post('/api/departments', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          showSuccess('Department created successfully!')
          dispatch(fetchDepartments())
        }
      }
      handleCloseModal()
    } catch (error) {
      console.error('Department operation error:', error)
      if (error.response?.data?.message) {
        showError(error.response.data.message)
      } else {
        showError(`Failed to ${editingDepartment ? 'update' : 'create'} department`)
      }
    }
  }

  const handleDeleteDepartment = async (departmentId) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return
    }

    try {
      const response = await axios.delete(`/api/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        showSuccess('Department deleted successfully!')
        dispatch(fetchDepartments())
      }
    } catch (error) {
      console.error('Delete department error:', error)
      if (error.response?.data?.message) {
        showError(error.response.data.message)
      } else {
        showError('Failed to delete department')
      }
    }
  }

  const getEmployeeCount = (departmentId) => {
    return employees.filter(emp => emp.department === departmentId).length
  }

  const getManagerName = (department) => {
    if (!department.head) return 'No Manager'
    const manager = employees.find(emp => emp._id === department.head)
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager'
  }

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'board': return 'bg-purple-100 text-purple-800'
      case 'administration': return 'bg-blue-100 text-blue-800'
      case 'department': return 'bg-green-100 text-green-800'
      case 'sub_department': return 'bg-yellow-100 text-yellow-800'
      case 'team': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (user?.role !== 'hr') {
    return <Navigate to={`/${user?.role}`} replace />
  }

  const stats = [
    { 
      name: 'Total Departments', 
      value: departments.length, 
      icon: Building2, 
      subtitle: `${departments.filter(dept => dept.isActive !== false).length} active`
    },
    { 
      name: 'Total Employees', 
      value: employees.length, 
      icon: Users, 
      subtitle: 'across all departments'
    },
    { 
      name: 'Managers', 
      value: departments.filter(dept => dept.head).length, 
      icon: UserCheck, 
      subtitle: 'departments with managers'
    },
    { 
      name: 'Avg. per Dept', 
      value: departments.length > 0 ? Math.round(employees.length / departments.length) : 0, 
      icon: Users, 
      subtitle: 'employees per department'
    }
  ]

  const quickActions = [
    {
      name: 'Add Department',
      description: 'Create a new department',
      icon: Plus,
      href: '#',
      buttonText: 'Add Department',
      onClick: handleAddDepartment
    }
  ]

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle="Department Management"
      role="hr"
      stats={stats}
      quickActions={quickActions}
    >
      <PageHeader
        title="Department Management"
        subtitle="Manage organizational structure and departments"
        actions={[
          <ActionButton
            key="add-department"
            type="primary"
            iconType="add"
            onClick={handleAddDepartment}
          >
            Add Department
          </ActionButton>
        ]}
      />

      {/* Filters */}
      <div className="glass-card mb-6">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="board">Board</option>
              <option value="administration">Administration</option>
              <option value="department">Department</option>
              <option value="sub_department">Sub Department</option>
              <option value="team">Team</option>
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
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <QassimLoadingSpinner size="lg" text="Loading departments..." />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              type="departments"
              title="No departments found"
              description="No departments match your current filters."
              actions={[
                <ActionButton
                  key="add-department"
                  type="primary"
                  iconType="add"
                  onClick={handleAddDepartment}
                >
                  Add Department
                </ActionButton>
              ]}
            />
          </div>
        ) : (
          filteredDepartments.map((department) => (
            <div key={department._id} className="glass-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {department.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(department.level)}`}>
                    {department.level.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditDepartment(department)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {department.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {department.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Employees:</span>
                  <span className="font-medium">{getEmployeeCount(department._id)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Manager:</span>
                  <span className="font-medium">{getManagerName(department)}</span>
                </div>
                {department.organizationalCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Code:</span>
                    <span className="font-medium">{department.organizationalCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${department.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                    {department.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
                    placeholder="Enter department description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizational Code
                  </label>
                  <input
                    type="text"
                    name="organizationalCode"
                    value={formData.organizationalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
                    placeholder="e.g., IT-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
                  >
                    <option value="board">Board</option>
                    <option value="administration">Administration</option>
                    <option value="department">Department</option>
                    <option value="sub_department">Sub Department</option>
                    <option value="team">Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qassim-blue focus:border-transparent"
                    placeholder="department@company.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active Department
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <ActionButton
                    type="secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    type="primary"
                    iconType="add"
                    onClick={handleSubmit}
                  >
                    {editingDepartment ? 'Update' : 'Create'} Department
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default HRDepartmentsPage
