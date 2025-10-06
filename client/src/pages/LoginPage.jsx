import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { loginUser, clearError } from '../store/slices/authSlice'
// import {Logo }from '../puplic/logo.png'

const LoginPage = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)
  const location = useLocation()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Send email as username to backend (backend accepts username or email under 'username')
    dispatch(loginUser({ username: (formData.email || '').trim().toLowerCase(), password: formData.password }))
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <div className="relative bg-gradient-to-br from-qassim-blue via-blue-600 to-blue-700 rounded-3xl shadow-2xl px-6 py-10 sm:px-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left welcome area */}
            <div className="hidden md:block text-white">
              <h1 className="text-4xl font-extrabold tracking-wide">WELCOME</h1>
              <p className="mt-3 text-sm opacity-90">QASSIM CHAMBER EMPLOYEE DIRECTORY</p>
              <p className="mt-4 text-sm max-w-md opacity-80">
                Access the comprehensive employee management system. Connect with colleagues, manage schedules, and streamline communication across all departments of Qassim Chamber.
              </p>
            </div>

            {/* Right sign-in card */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md ml-auto">
                <div className="flex justify-center mb-4">
                  <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
                </div>
                <h2 className="text-center text-2xl font-extrabold text-gray-900">Sign in</h2>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        User name
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="input-field pl-10 pr-12"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-qassim-blue"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center text-sm text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300 text-qassim-blue focus:ring-qassim-blue mr-2" />
                      Remember me
                    </label>
                    <a href="#" className="text-sm text-qassim-blue hover:text-qassim-blue-dark">Forgot Password?</a>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-sm text-red-600">{error}</div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-qassim-blue hover:bg-qassim-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qassim-blue disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-2">
                    Need access? Contact your system administrator to create your account.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Admin */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            <strong>Admin-Only Account Creation:</strong> New employee accounts can only be created by system administrators. 
            Please contact your HR department or system administrator to request access to the Qassim Chamber employee directory.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
