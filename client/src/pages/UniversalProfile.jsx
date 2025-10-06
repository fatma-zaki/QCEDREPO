import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Phone, Building, Calendar, Shield, Edit3, Users, BarChart3, Clock } from 'lucide-react'
import { updateMyProfile } from '../store/slices/employeeSlice'
import { useNotifications } from '../hooks/useNotifications'
import AvatarUpload from '../components/AvatarUpload'
import QRCodeGenerator from '../components/QRCodeGenerator'

const UniversalProfile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const { showSuccess, showError } = useNotifications()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    extension: user?.extension || '',
    position: user?.position || '',
    department: user?.department?.name || user?.department || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: user?.avatar || null
  })

  const [stats, setStats] = useState({
    teamMembers: 0,
    activeMembers: 0,
    totalSchedules: 0,
    recentActivities: 0
  })

  // Role-specific data fetching
  useEffect(() => {
    const fetchRoleSpecificStats = async () => {
      if (!token || !user) return

      // Debug: Log user object to see what fields are available
      console.log('User object in UniversalProfile:', user)

      try {
        const promises = []
        
        // Manager-specific stats
        if (user.role === 'manager') {
          promises.push(
            fetch('/api/employees/team', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch('/api/schedules?manager=true', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
          )
        }
        
        // Admin-specific stats
        if (user.role === 'admin') {
          promises.push(
            fetch('/api/employees', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch('/api/schedules', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
          )
        }
        
        // Common stats for all roles
        const userId = user._id || user.id
        if (userId) {
          promises.push(
            fetch('/api/audit?limit=5&user=' + userId, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
              if (!res.ok) {
                console.warn('Audit API failed:', res.status, res.statusText)
                return { data: { logs: [] } }
              }
              return res.json()
            }).catch(error => {
              console.warn('Audit API error:', error)
              return { data: { logs: [] } }
            })
          )
        } else {
          // If no user ID, add empty promise to maintain array structure
          promises.push(Promise.resolve({ data: { logs: [] } }))
        }

        const results = await Promise.all(promises)
        
        if (user.role === 'manager') {
          const [teamData, schedulesData, activitiesData] = results
          setStats({
            teamMembers: teamData.data?.length || 0,
            activeMembers: teamData.data?.filter(emp => emp.isActive !== false).length || 0,
            totalSchedules: schedulesData.data?.length || 0,
            recentActivities: activitiesData.data?.logs?.length || 0
          })
        } else if (user.role === 'admin') {
          const [employeesData, schedulesData, activitiesData] = results
          setStats({
            teamMembers: employeesData.data?.length || 0,
            activeMembers: employeesData.data?.filter(emp => emp.isActive !== false).length || 0,
            totalSchedules: schedulesData.data?.length || 0,
            recentActivities: activitiesData.data?.logs?.length || 0
          })
        } else {
          // Employee role
          const [activitiesData] = results
          setStats({
            teamMembers: 0,
            activeMembers: 0,
            totalSchedules: 0,
            recentActivities: activitiesData.data?.logs?.length || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch role-specific stats:', error)
      }
    }

    fetchRoleSpecificStats()
  }, [token, user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate password change if provided
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        showError('New passwords do not match')
        setLoading(false)
        return
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        showError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        avatar: formData.avatar
      }

      // Add password change if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const userId = user._id || user.id
      if (!userId) {
        showError('User ID not found. Please log out and log in again.')
        setLoading(false)
        return
      }

      console.log('Updating profile with data:', updateData)

      const result = await dispatch(updateMyProfile(updateData))

      console.log('Update result:', result)

      if (updateMyProfile.fulfilled.match(result)) {
        showSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const errorMsg = result.payload || result.error || 'Unknown error'
        let errorText = 'Failed to update profile'
        
        if (typeof errorMsg === 'string') {
          errorText += ': ' + errorMsg
        } else if (errorMsg && errorMsg.errors && Array.isArray(errorMsg.errors)) {
          errorText += ': ' + errorMsg.errors.join(', ')
        } else if (errorMsg && errorMsg.message) {
          errorText += ': ' + errorMsg.message
        } else {
          errorText += ': ' + JSON.stringify(errorMsg)
        }
        
        showError(errorText)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showError('Failed to update profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      extension: user?.extension || '',
      position: user?.position || '',
      department: user?.department?.name || user?.department || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      avatar: user?.avatar || null
    })
    setIsEditing(false)
  }

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin': return '/admin'
      case 'manager': return '/manager'
      case 'hr': return '/hr'
      case 'employee': return '/employee'
      default: return '/'
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'hr': return 'HR Personnel'
      case 'employee': return 'Employee'
      default: return role?.charAt(0).toUpperCase() + role?.slice(1)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'hr': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-2 text-sm text-gray-500">Please log in to access your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(getDashboardRoute())}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension
                </label>
                <input
                  type="text"
                  value={formData.extension}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Extension cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Change Password
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
            
            {!isEditing && (
              <p className="text-sm text-gray-500 mt-4">
                Click "Edit Profile" to change your password
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar & QR Code */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload
                currentAvatar={formData.avatar}
                onAvatarChange={(avatar) => handleInputChange('avatar', avatar)}
                size="xlarge"
                editable={isEditing}
              />
              {isEditing && (
                <p className="text-xs text-gray-500 text-center">
                  Click on the camera icon to change your profile picture
                </p>
              )}
              
              <div className="w-full">
                <QRCodeGenerator employee={user} type="employee_card" />
              </div>
            </div>
          </div>

          {/* Role-specific Stats */}
          {(user.role === 'manager' || user.role === 'admin') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {user.role === 'manager' ? (
                  <>
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Management Overview
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    System Overview
                  </>
                )}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {user.role === 'manager' ? 'Team Members' : 'Total Employees'}
                    </p>
                    <p className="text-xs text-blue-700">
                      {user.role === 'manager' ? 'Total managed' : 'In system'}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{stats.teamMembers}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Active Members</p>
                    <p className="text-xs text-green-700">Currently active</p>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{stats.activeMembers}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Schedules</p>
                    <p className="text-xs text-purple-700">
                      {user.role === 'manager' ? 'Total created' : 'In system'}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{stats.totalSchedules}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Recent Activities</p>
                    <p className="text-xs text-orange-700">Last 5 actions</p>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{stats.recentActivities}</div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-600" />
              Account Information
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last updated:</span>
                <span className="font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UniversalProfile
