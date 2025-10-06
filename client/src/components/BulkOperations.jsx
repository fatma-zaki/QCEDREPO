import React, { useState } from 'react'
import { CheckSquare, Square, Trash2, Edit, Building, Users, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { useNotifications } from '../hooks/useNotifications'

const BulkOperations = ({ 
  selectedEmployees, 
  onSelectionChange, 
  employees, 
  departments,
  onRefresh 
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [bulkData, setBulkData] = useState({})
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useNotifications()

  const isAllSelected = selectedEmployees.length === employees.length && employees.length > 0
  const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < employees.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(employees.map(emp => emp._id))
    }
  }

  const handleSelectEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      onSelectionChange(selectedEmployees.filter(id => id !== employeeId))
    } else {
      onSelectionChange([...selectedEmployees, employeeId])
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedEmployees.length === 0) return

    setLoading(true)
    try {
      let endpoint = ''
      let data = { employeeIds: selectedEmployees }

      switch (bulkAction) {
        case 'delete':
          endpoint = '/api/employees/bulk'
          const deleteResponse = await axios.delete(endpoint, { data })
          if (deleteResponse.data.success) {
            showSuccess(`Successfully deleted ${deleteResponse.data.data.deletedCount} employees`)
            onSelectionChange([])
          }
          break

        case 'activate':
          endpoint = '/api/employees/bulk/toggle-status'
          data.isActive = true
          const activateResponse = await axios.patch(endpoint, data)
          if (activateResponse.data.success) {
            showSuccess(`Successfully activated ${activateResponse.data.data.modifiedCount} employees`)
            onSelectionChange([])
          }
          break

        case 'deactivate':
          endpoint = '/api/employees/bulk/toggle-status'
          data.isActive = false
          const deactivateResponse = await axios.patch(endpoint, data)
          if (deactivateResponse.data.success) {
            showSuccess(`Successfully deactivated ${deactivateResponse.data.data.modifiedCount} employees`)
            onSelectionChange([])
          }
          break

        case 'assignDepartment':
          if (!bulkData.departmentId) {
            showError('Please select a department')
            return
          }
          endpoint = '/api/employees/bulk/assign-department'
          data.departmentId = bulkData.departmentId
          const assignResponse = await axios.patch(endpoint, data)
          if (assignResponse.data.success) {
            showSuccess(`Successfully assigned ${assignResponse.data.data.modifiedCount} employees to department`)
            onSelectionChange([])
          }
          break

        case 'update':
          if (!bulkData.updateData || Object.keys(bulkData.updateData).length === 0) {
            showError('Please provide update data')
            return
          }
          endpoint = '/api/employees/bulk'
          data.updateData = bulkData.updateData
          const updateResponse = await axios.put(endpoint, data)
          if (updateResponse.data.success) {
            showSuccess(`Successfully updated ${updateResponse.data.data.modifiedCount} employees`)
            onSelectionChange([])
          }
          break

        default:
          showError('Invalid bulk action')
          return
      }

      setBulkAction('')
      setBulkData({})
      setShowBulkMenu(false)
      if (onRefresh) onRefresh()

    } catch (error) {
      showError(error.response?.data?.message || 'Bulk operation failed')
    } finally {
      setLoading(false)
    }
  }

  const renderBulkActionForm = () => {
    switch (bulkAction) {
      case 'assignDepartment':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Department
            </label>
            <select
              value={bulkData.departmentId || ''}
              onChange={(e) => setBulkData({ ...bulkData, departmentId: e.target.value })}
              className="input-field"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )

      case 'update':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              value={bulkData.updateData?.position || ''}
              onChange={(e) => setBulkData({
                ...bulkData,
                updateData: { ...bulkData.updateData, position: e.target.value }
              })}
              placeholder="Enter position"
              className="input-field"
            />
            
            <label className="block text-sm font-medium text-gray-700">
              Salary
            </label>
            <input
              type="number"
              value={bulkData.updateData?.salary || ''}
              onChange={(e) => setBulkData({
                ...bulkData,
                updateData: { ...bulkData.updateData, salary: parseFloat(e.target.value) }
              })}
              placeholder="Enter salary"
              className="input-field"
            />
          </div>
        )

      default:
        return null
    }
  }

  if (employees.length === 0) return null

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Selection Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5 text-qassim-blue" />
            ) : isIndeterminate ? (
              <div className="w-5 h-5 border-2 border-qassim-blue bg-qassim-blue/20 rounded" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="ml-2 text-sm font-medium">
              {selectedEmployees.length} of {employees.length} selected
            </span>
          </button>

          {selectedEmployees.length > 0 && (
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="flex items-center px-3 py-2 bg-qassim-blue text-white rounded-lg hover:bg-qassim-blue-dark text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Bulk Actions
            </button>
          )}
        </div>

        {/* Employee Count */}
        <div className="text-sm text-gray-500">
          Total: {employees.length} employees
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {showBulkMenu && selectedEmployees.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Bulk Actions for {selectedEmployees.length} selected employees
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => setBulkAction('activate')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                bulkAction === 'activate' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Users className="w-5 h-5 mb-2" />
              <div className="font-medium">Activate</div>
              <div className="text-sm text-gray-500">Set as active</div>
            </button>

            <button
              onClick={() => setBulkAction('deactivate')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                bulkAction === 'deactivate' 
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <Users className="w-5 h-5 mb-2" />
              <div className="font-medium">Deactivate</div>
              <div className="text-sm text-gray-500">Set as inactive</div>
            </button>

            <button
              onClick={() => setBulkAction('assignDepartment')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                bulkAction === 'assignDepartment' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <Building className="w-5 h-5 mb-2" />
              <div className="font-medium">Assign Department</div>
              <div className="text-sm text-gray-500">Change department</div>
            </button>

            <button
              onClick={() => setBulkAction('update')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                bulkAction === 'update' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <Edit className="w-5 h-5 mb-2" />
              <div className="font-medium">Update Info</div>
              <div className="text-sm text-gray-500">Update details</div>
            </button>

            <button
              onClick={() => setBulkAction('delete')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                bulkAction === 'delete' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <Trash2 className="w-5 h-5 mb-2" />
              <div className="font-medium">Delete</div>
              <div className="text-sm text-gray-500">Remove employees</div>
            </button>
          </div>

          {/* Action Form */}
          {bulkAction && renderBulkActionForm()}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setBulkAction('')
                setBulkData({})
                setShowBulkMenu(false)
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAction}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                bulkAction === 'delete' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-qassim-blue hover:bg-qassim-blue-dark'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : `Execute ${bulkAction}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkOperations
