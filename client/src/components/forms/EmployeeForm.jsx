import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { createEmployee, updateEmployee } from '../../store/slices/employeeSlice'
import { useNotifications } from '../../hooks/useNotifications'

const EmployeeForm = ({ 
  isOpen, 
  onClose, 
  editingEmployee = null, 
  onSuccess 
}) => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const departments = useSelector((state) => state.departments.departments || [])
  const loading = useSelector((state) => state.employees.loading)
  const error = useSelector((state) => state.employees.error)
  const { user } = useSelector((state) => state.auth || {})

  const [userForm, setUserForm] = useState({
    name: '',
    extension: '',
    department: '',
    email: '',
    password: '',
    role: 'employee',
  })

  // Reset form when modal opens/closes or editingEmployee changes
  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        // Construct full name from firstName and lastName or use name field
        const fullName = editingEmployee.name || 
          (editingEmployee.firstName && editingEmployee.lastName ? `${editingEmployee.firstName} ${editingEmployee.lastName}` : 
           editingEmployee.firstName || editingEmployee.lastName || '')
        
        setUserForm({
          name: fullName,
          extension: editingEmployee.extension || '',
          department: editingEmployee.department?._id || editingEmployee.department || '',
          email: editingEmployee.email || '',
          password: '',
          role: editingEmployee.role || 'employee',
        })
      } else {
        setUserForm({
          name: '',
          extension: '',
          department: '',
          email: '',
          password: '',
          role: 'employee',
        })
      }
    }
  }, [isOpen, editingEmployee])

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value })
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    // Prevent non-admin users from creating admin employees
    if (userForm.role === 'admin' && user?.role !== 'admin') {
      showError('Only administrators can create admin accounts')
      return
    }

    const action = await dispatch(createEmployee({
      name: userForm.name,
      extension: userForm.extension,
      department: userForm.department,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      isActive: true
    }))
    
    if (createEmployee.fulfilled.match(action)) {
      showSuccess('Employee created successfully!')
      onClose()
      if (onSuccess) onSuccess()
    } else {
      showError('Failed to create employee')
    }
  }

  const handleUpdateEmployee = async (e) => {
    e.preventDefault()
    
    // Prevent non-admin users from editing admin employees
    if (editingEmployee?.role === 'admin' && user?.role !== 'admin') {
      showError('Only administrators can edit admin accounts')
      return
    }
    
    // Split name into firstName and lastName
    const nameParts = userForm.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    const employeeData = {
      firstName,
      lastName,
      name: userForm.name, // Keep for backward compatibility
      email: userForm.email,
      department: userForm.department,
      extension: userForm.extension,
    }
    
    const result = await dispatch(updateEmployee({
      id: editingEmployee._id,
      employeeData
    }))
    
    if (updateEmployee.fulfilled.match(result)) {
      showSuccess('Employee updated successfully!')
      onClose()
      if (onSuccess) onSuccess()
    } else {
      showError('Failed to update employee')
    }
  }

  const handleClose = () => {
    setUserForm({
      name: '',
      extension: '',
      department: '',
      email: '',
      password: '',
      role: 'employee',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateUser} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              type="text"
              required
              value={userForm.name}
              onChange={handleUserFormChange}
              className="input-field"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={userForm.email}
              onChange={handleUserFormChange}
              className="input-field"
              placeholder="e.g. jdoe@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Extension</label>
            <input
              name="extension"
              type="text"
              pattern="\d{3,6}"
              title="3-6 digits"
              required
              value={userForm.extension}
              onChange={handleUserFormChange}
              className="input-field"
              placeholder="e.g. 1050"
            />
          </div>
          {!editingEmployee && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={userForm.password}
                onChange={handleUserFormChange}
                className="input-field"
                placeholder="Minimum 6 characters"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={userForm.role}
              onChange={handleUserFormChange}
              className="input-field"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="department"
              value={userForm.department}
              onChange={handleUserFormChange}
              className="input-field"
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : (editingEmployee ? 'Update Employee' : 'Create Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeForm