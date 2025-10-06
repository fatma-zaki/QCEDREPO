import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { mockEmployees } from '../../utils/mockData'

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/employees')
      return response.data.data || response.data
    } catch (error) {
      // If backend is not running, return mock data for development
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend not available, using mock data')
        return mockEmployees
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees')
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      // Normalize and validate payload to satisfy backend validators
      const departmentId =
        typeof employeeData?.department === 'string'
          ? employeeData.department
          : employeeData?.department?._id || employeeData?.department?.id || employeeData?.department?.value

      const normalized = {
  firstName: employeeData?.firstName || employeeData?.name?.split(' ')[0] || '',
  lastName: employeeData?.lastName || employeeData?.name?.split(' ')[1] || '',
  name: employeeData?.name || `${employeeData?.firstName || ''} ${employeeData?.lastName || ''}`.trim(),
  username: employeeData?.username || (employeeData?.email ? employeeData.email.split('@')[0] : ''),
  extension: String(employeeData?.extension ?? '').trim(),
  department: departmentId,
  email: employeeData?.email ? String(employeeData.email).trim() : undefined,
  password: employeeData?.password ? String(employeeData.password) : undefined,
  role: employeeData?.role ? String(employeeData.role) : undefined,
  phone: employeeData?.phone ? String(employeeData.phone).trim() : undefined,
  position: employeeData?.position ? String(employeeData.position).trim() : undefined,
  avatar: employeeData?.avatar || undefined,
}

      // Strip undefined/empty
      const payload = Object.fromEntries(
        Object.entries(normalized).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )

      // Client-side validations matching backend
      if (!payload.name) return rejectWithValue('Employee name is required')
      if (!payload.extension || !/^\d{3,6}$/.test(payload.extension)) {
        return rejectWithValue('Extension must be 3-6 digits')
      }
      if (!payload.department || !/^[a-fA-F0-9]{24}$/.test(payload.department)) {
        return rejectWithValue('Valid department ID is required')
      }
      if (payload.email && !payload.password) {
        return rejectWithValue('Password is required when email is provided')
      }

      // Debug log
      console.log('createEmployee payload →', JSON.stringify(payload, null, 2))

      const token = localStorage.getItem('token')
      const response = await axios.post('/api/employees', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      return response.data.data || response.data
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.map(e => e.msg).join(', ')) ||
        error?.message ||
        'Failed to create employee'
      return rejectWithValue(apiMessage)
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`/api/employees/${id}`, employeeData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee')
    }
  }
)

export const updateMyProfile = createAsyncThunk(
  'employees/updateMyProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/employees/me', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete employee')
    }
  }
)

export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async (format, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      console.log('Exporting employees with format:', format, 'Token:', token ? 'Present' : 'Missing')
      
      const response = await axios.get(`/api/export/employees?type=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      })
      
      console.log('Export response:', response.status, response.headers)
      return { data: response.data, format }
    } catch (error) {
      console.error('Export error:', error.response?.status, error.response?.data)
      return rejectWithValue(error.response?.data?.message || 'Failed to export employees')
    }
  }
)


const initialState = {
  employees: [],
  loading: false,
  error: null,
  searchTerm: '',
  filterDepartment: '',
  sortBy: 'name',
  sortOrder: 'asc',
  showAdvanced: false,
}

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setFilterDepartment: (state, action) => {
      state.filterDepartment = action.payload
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },
    setShowAdvanced: (state, action) => {
      state.showAdvanced = action.payload
    },
    clearFilters: (state) => {
      state.searchTerm = ''
      state.filterDepartment = ''
      state.sortBy = 'name'
      state.sortOrder = 'asc'
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload
        state.error = null
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create employee
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload)
      })
      // Update employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp._id === action.payload._id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
      })
      // Delete employee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp._id !== action.payload)
      })
  },
})

export const { 
  setSearchTerm, 
  setFilterDepartment, 
  setSortBy, 
  setSortOrder, 
  setShowAdvanced, 
  clearFilters, 
  clearError 
} = employeeSlice.actions
export default employeeSlice.reducer
