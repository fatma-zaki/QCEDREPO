import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { verifyToken } from './store/slices/authSlice'
import { fetchDepartments } from './store/slices/departmentSlice'
import { fetchEmployees } from './store/slices/employeeSlice'

// Core components (loaded immediately)
import PrivateRoute from './components/PrivateRoute'
import { QassimLoadingSpinner } from './components'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'
import NotificationProvider from './components/NotificationSystem'

// Lazy loaded components for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const HRDashboard = lazy(() => import('./pages/HRDashboard'))
const HREmployeesPage = lazy(() => import('./pages/HREmployeesPage'))
const HRAddEmployeePage = lazy(() => import('./pages/HRAddEmployeePage'))
const HRDepartmentsPage = lazy(() => import('./pages/HRDepartmentsPage'))
const HRReportsPage = lazy(() => import('./pages/HRReportsPage'))
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'))
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'))
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile'))
const EmployeeSchedule = lazy(() => import('./pages/EmployeeSchedule'))
const EmployeeNotifications = lazy(() => import('./pages/EmployeeNotifications'))
const SupportChat = lazy(() => import('./pages/SupportChat'))
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'))
const AdminInbox = lazy(() => import('./pages/AdminInbox'))
const ManagerInbox = lazy(() => import('./pages/ManagerInbox'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const ManagerTeam = lazy(() => import('./pages/ManagerTeam'))
const UniversalProfile = lazy(() => import('./pages/UniversalProfile'))
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))

function App() {
  const dispatch = useDispatch()
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    // Verify token on app load
    const initApp = async () => {
      try {
        await dispatch(verifyToken()).unwrap()
      } catch (error) {
        // Token verification failed, user will need to login
        console.log('Token verification failed:', error)
      } finally {
        setInitialLoad(false)
      }
    }
    
    initApp()
  }, [dispatch])

  useEffect(() => {
    // Fetch initial data only if authenticated
    if (isAuthenticated && !initialLoad) {
      dispatch(fetchDepartments())
      dispatch(fetchEmployees())
    }
  }, [dispatch, isAuthenticated, initialLoad])

  if (initialLoad || loading) {
    return <QassimLoadingSpinner size="xl" text="Loading application..." />
  }

  return (
    <NotificationProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <OfflineIndicator />
          <Suspense fallback={<QassimLoadingSpinner size="xl" text="Loading application..." />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
            {/* Registration is admin-managed only; public register route removed */}
            
            {/* Role-based Dashboard Routes */}
            <Route path="/admin/*" element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/inbox" element={
              <PrivateRoute requiredRole="admin">
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/hr" element={
              <PrivateRoute requiredRole="hr">
                <HRDashboard />
              </PrivateRoute>
            } />
            <Route path="/hr/employees" element={
              <PrivateRoute requiredRole="hr">
                <HREmployeesPage />
              </PrivateRoute>
            } />
            <Route path="/hr/employees/add" element={
              <PrivateRoute requiredRole="hr">
                <HRAddEmployeePage />
              </PrivateRoute>
            } />
            <Route path="/hr/departments" element={
              <PrivateRoute requiredRole="hr">
                <HRDepartmentsPage />
              </PrivateRoute>
            } />
            <Route path="/hr/reports" element={
              <PrivateRoute requiredRole="hr">
                <HRReportsPage />
              </PrivateRoute>
            } />
            <Route path="/manager/*" element={
              <PrivateRoute requiredRole="manager">
                <ManagerDashboard />
              </PrivateRoute>
            } />
            <Route path="/manager/team" element={
              <PrivateRoute requiredRole="manager">
                <ManagerTeam />
              </PrivateRoute>
            } />
            <Route path="/manager/inbox" element={
              <PrivateRoute requiredRole="manager">
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/manager/analytics" element={
              <PrivateRoute requiredRole="manager">
                <AnalyticsPage />
              </PrivateRoute>
            } />
            <Route path="/manager/employees" element={
              <PrivateRoute requiredRole="manager">
                <EmployeesPage />
              </PrivateRoute>
            } />
            <Route path="/manager/profile" element={
              <PrivateRoute requiredRole="manager">
                <UniversalProfile />
              </PrivateRoute>
            } />
            <Route path="/admin/profile" element={
              <PrivateRoute requiredRole="admin">
                <UniversalProfile />
              </PrivateRoute>
            } />
            <Route path="/hr/profile" element={
              <PrivateRoute requiredRole="hr">
                <UniversalProfile />
              </PrivateRoute>
            } />
            <Route path="/employee/profile" element={
              <PrivateRoute requiredRole="employee">
                <UniversalProfile />
              </PrivateRoute>
            } />
            <Route path="/employee/*" element={
              <PrivateRoute requiredRole="employee">
                <EmployeeDashboard />
              </PrivateRoute>
            } />
            <Route path="/employee/profile" element={
              <PrivateRoute requiredRole="employee">
                <EmployeeProfile />
              </PrivateRoute>
            } />
            <Route path="/employee/schedule" element={
              <PrivateRoute requiredRole="employee">
                <EmployeeSchedule />
              </PrivateRoute>
            } />
            <Route path="/employee/notifications" element={
              <PrivateRoute requiredRole="employee">
                <EmployeeNotifications />
              </PrivateRoute>
            } />
            <Route path="/employee/support" element={
              <PrivateRoute requiredRole="employee">
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/schedule" element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            } />
            
            {/* Legacy Admin Routes for backward compatibility */}
            <Route path="/admin/departments" element={
              <PrivateRoute requiredRole="admin">
                <DepartmentsPage />
              </PrivateRoute>
            } />
            <Route path="/admin/employees" element={
              <PrivateRoute requiredRole="admin">
                <EmployeesPage />
              </PrivateRoute>
            } />
            <Route path="/admin/analytics" element={
              <PrivateRoute requiredRole="admin">
                <AnalyticsPage />
              </PrivateRoute>
            } />
            <Route path="/admin/audit" element={
              <PrivateRoute requiredRole="admin">
                <AuditLogPage />
              </PrivateRoute>
            } />
            
            {/* Default redirect based on authentication */}
            <Route path="/" element={
              isAuthenticated ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <PWAInstallPrompt />
        </div>
      </ErrorBoundary>
    </NotificationProvider>
  )
}

export default App
