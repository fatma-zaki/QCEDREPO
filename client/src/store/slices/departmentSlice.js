import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { mockDepartments } from '../../utils/mockData'

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/departments')
      return response.data.data || response.data
    } catch (error) {
      // If backend is not running, return mock data for development
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend not available, using mock data')
        return mockDepartments
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments')
    }
  }
)

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/departments', departmentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create department')
    }
  }
)

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`/api/departments/${id}`, departmentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update department')
    }
  }
)

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete department')
    }
  }
)

const initialState = {
  departments: [],
  loading: false,
  error: null,
}

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.departments = action.payload
        state.error = null
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false
        state.departments.push(action.payload)
        state.error = null
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.departments.findIndex(dept => dept._id === action.payload._id)
        if (index !== -1) {
          state.departments[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete department
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false
        state.departments = state.departments.filter(dept => dept._id !== action.payload)
        state.error = null
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = departmentSlice.actions
export default departmentSlice.reducer
