import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../store/slices/departmentSlice'
// Replace Logo component with public image

const DepartmentsPage = () => {
  const dispatch = useDispatch()
  const departments = useSelector((state) => state.departments.departments || [])
  const loading = useSelector((state) => state.departments.loading)
  const error = useSelector((state) => state.departments.error)
  
  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizationalCode: '',
    level: 'department'
  })

  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingDepartment) {
      await dispatch(updateDepartment({
        id: editingDepartment._id,
        departmentData: formData
      }))
    } else {
      await dispatch(createDepartment(formData))
    }
    
    setShowModal(false)
    setEditingDepartment(null)
    setFormData({ name: '', description: '', organizationalCode: '', level: 'department' })
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || '',
      organizationalCode: department.organizationalCode || '',
      level: department.level || 'department'
    })
    setShowModal(true)
  }

  const handleDelete = async (department) => {
    const employeeCount = department.employeeCount || 0;
    
    if (employeeCount > 0) {
      alert(`Cannot delete department "${department.name}". It has ${employeeCount} employee${employeeCount !== 1 ? 's' : ''}. Please reassign or remove employees first.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      await dispatch(deleteDepartment(department._id))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
    setFormData({ name: '', description: '', organizationalCode: '', level: 'department' })
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
                  Manage Departments
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="glass-effect text-qassim-blue hover:bg-white/20 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Departments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-6 border-l-4 border-qassim-blue">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {departments.length}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Departments</p>
                <p className="text-2xl font-semibold text-qassim-blue">{departments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">
                    {departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold text-green-500">
                  {departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {departments.length > 0 ? Math.round((departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0) / departments.length) * 10) / 10 : 0}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. per Department</p>
                <p className="text-2xl font-semibold text-purple-500">
                  {departments.length > 0 ? Math.round((departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0) / departments.length) * 10) / 10 : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Departments List */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Departments ({departments.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new department.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {department.name}
                            </div>
                            {department.organizationalCode && (
                              <div className="text-sm text-gray-500">
                                {department.organizationalCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {department.level?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {department.employeeCount || 0}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {department.employeeCount || 0} employee{(department.employeeCount || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {department.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(department)}
                            className="p-2 text-gray-400 hover:text-qassim-blue transition-colors"
                            title="Edit department"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(department)}
                            className={`p-2 transition-colors ${
                              (department.employeeCount || 0) > 0 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                            title={
                              (department.employeeCount || 0) > 0 
                                ? `Cannot delete: ${department.employeeCount} employee${(department.employeeCount || 0) !== 1 ? 's' : ''} assigned`
                                : 'Delete department'
                            }
                            disabled={(department.employeeCount || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-2xl rounded-2xl glass-card">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter department name"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="Enter department description"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="organizationalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Organizational Code (Optional)
                  </label>
                  <input
                    type="text"
                    id="organizationalCode"
                    value={formData.organizationalCode}
                    onChange={(e) => setFormData({ ...formData, organizationalCode: e.target.value })}
                    className="input-field"
                    placeholder="e.g. IT-001"
                    pattern="[A-Z]{2,5}-[0-9]{2,4}"
                    title="Format: 2-5 uppercase letters, dash, 2-4 digits (e.g. IT-001)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 2-5 uppercase letters, dash, 2-4 digits (e.g. IT-001)</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Department Level
                  </label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="input-field"
                  >
                    <option value="board">Board</option>
                    <option value="administration">Administration</option>
                    <option value="department">Department</option>
                    <option value="sub_department">Sub Department</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingDepartment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPage
