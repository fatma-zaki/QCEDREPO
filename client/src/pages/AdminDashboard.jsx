import { useDispatch, useSelector } from 'react-redux'
import { useMemo, useState } from 'react'
import { Users, Building2, UserCheck, UserPlus, CalendarDays, BarChart3 } from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { EmployeeForm, DashboardLayout } from '../components'
import StatStrip from '../components/dashboard/StatStrip'
import EmployeeOverviewCard from '../components/dashboard/EmployeeOverviewCard'
import GrowthTrendCard from '../components/dashboard/GrowthTrendCard'
import RecentEmployeesTable from '../components/dashboard/RecentEmployeesTable'
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel'
import UpcomingSchedules from '../components/dashboard/UpcomingSchedules'
import QuoteCard from '../components/dashboard/QuoteCard'
import { getJoinDate, startOfMonth, countBefore, percentChange } from '../components/dashboard/dashboardUtils'

const getCreatedDate = (item) => (item.createdAt ? new Date(item.createdAt) : null)

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])

  const [showAddUser, setShowAddUser] = useState(false)

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = startOfMonth(now)
    const lastMonth = startOfMonth(now, -1)

    const totalEmployees = employees.length
    const activeEmployees = employees.filter((e) => e.isActive !== false && (!e.status || e.status === 'active')).length
    const hiresThisMonth = totalEmployees - countBefore(employees, getJoinDate, thisMonth)
    const hiresLastMonth = countBefore(employees, getJoinDate, thisMonth) - countBefore(employees, getJoinDate, lastMonth)

    return [
      {
        name: 'Total Employees',
        value: totalEmployees,
        icon: Users,
        change: percentChange(totalEmployees, countBefore(employees, getJoinDate, thisMonth)),
        subtitle: `${activeEmployees} active`,
      },
      {
        name: 'Departments',
        value: departments.length,
        icon: Building2,
        change: percentChange(departments.length, countBefore(departments, getCreatedDate, thisMonth)),
        subtitle: 'Active departments',
      },
      {
        name: 'Active Rate',
        value: `${totalEmployees ? Math.round((activeEmployees / totalEmployees) * 100) : 0}%`,
        icon: UserCheck,
        subtitle: `${activeEmployees} of ${totalEmployees} active`,
      },
      {
        name: 'New Hires',
        value: hiresThisMonth,
        icon: UserPlus,
        change: percentChange(hiresThisMonth, hiresLastMonth),
        subtitle: 'Joined this month',
      },
    ]
  }, [employees, departments])

  const quickActions = [
    { name: 'Add Employee', icon: UserPlus, onClick: () => setShowAddUser(true) },
    { name: 'Manage Departments', icon: Building2, href: '/admin/departments' },
    { name: 'Manage Schedules', icon: CalendarDays, href: '/schedule' },
    { name: 'View Analytics', icon: BarChart3, href: '/admin/analytics' },
  ]

  const handleEmployeeSuccess = () => {
    // Refresh employees list after successful creation
    dispatch(fetchEmployees())
  }

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <StatStrip stats={stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <EmployeeOverviewCard employees={employees} departments={departments} detailsHref="/admin/analytics" />
            <GrowthTrendCard employees={employees} />
          </div>

          <RecentEmployeesTable employees={employees} departments={departments} viewAllHref="/admin/employees" />
        </div>

        <aside className="grid grid-cols-1 content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
          <QuickActionsPanel actions={quickActions} />
          <UpcomingSchedules />
          <div className="md:col-span-2 xl:col-span-1">
            <QuoteCard />
          </div>
        </aside>
      </div>

      <EmployeeForm isOpen={showAddUser} onClose={() => setShowAddUser(false)} onSuccess={handleEmployeeSuccess} />
    </DashboardLayout>
  )
}

export default AdminDashboard
