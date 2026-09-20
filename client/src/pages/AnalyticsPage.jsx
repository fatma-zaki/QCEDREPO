import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users,
  Phone,
  Mail,
  Building2,
  CalendarDays,
  ChevronDown,
  FileDown,
  FileSpreadsheet,
  Download,
  Printer,
  BarChart3,
  ArrowRight,
  ArrowUp,
} from 'lucide-react'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import PageHero from '../components/layout/PageHero'
import StatCard from '../components/dashboard/StatCard'
import QuickActionList from '../components/dashboard/QuickActionList'
import EmployeeOverviewCard from '../components/dashboard/EmployeeOverviewCard'
import GrowthComboCard from '../components/dashboard/GrowthComboCard'
import DashboardCard from '../components/dashboard/DashboardCard'
import StarBurst from '../components/dashboard/StarBurst'
import { DepartmentBadge } from '../components/dashboard/departmentVisuals'
import { getJoinDate, getCreatedDate, countBefore, monthlySeries, seriesChange, startOfMonth, downloadBlob } from '../components/dashboard/dashboardUtils'
import { useEmployeeExport } from '../hooks/useEmployeeExport'

const PERIODS = [
  { value: '3months', months: 3, label: 'Last 3 Months' },
  { value: '6months', months: 6, label: 'Last 6 Months' },
  { value: '1year', months: 12, label: 'Last 12 Months' },
]

const deptIdOf = (employee) => (typeof employee.department === 'object' ? employee.department?._id : employee.department)
const pct = (part, whole) => (whole ? (part / whole) * 100 : 0)
const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const PeriodPicker = ({ value, onChange, months }) => {
  const now = new Date()
  const from = startOfMonth(now, -(months - 1))
  return (
    <label className="relative inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 py-2 pl-3 pr-9 text-[13px] text-navy-800 shadow-sm backdrop-blur">
      <CalendarDays className="h-4 w-4 text-navy-500" strokeWidth={1.7} />
      <span>
        {fmtShort(from)} <span className="px-1 text-navy-500">–</span> {fmtShort(now)}
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-navy-500" />
      {/* Native select overlays the pill so keyboard and screen readers get a real control */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Report period"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const AnalyticsPage = () => {
  const dispatch = useDispatch()
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const { exportAs, exporting } = useEmployeeExport()

  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const months = PERIODS.find((p) => p.value === selectedPeriod)?.months || 6

  useEffect(() => {
    document.title = 'Analytics & Reports · Qassim Chamber'
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const total = employees.length
    const withExt = employees.filter((e) => e.extension).length
    const withEmail = employees.filter((e) => e.email).length
    const withPhone = employees.filter((e) => e.phone).length
    const thisMonth = startOfMonth(new Date())

    const departmentStats = departments
      .map((dept) => {
        const members = employees.filter((e) => deptIdOf(e) === dept._id)
        return {
          id: dept._id,
          name: dept.name,
          count: members.length,
          extensions: members.filter((e) => e.extension).length,
          newThisMonth: members.length - countBefore(members, getJoinDate, thisMonth),
          percentage: pct(members.length, total).toFixed(1),
        }
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    return {
      totalEmployees: total,
      totalDepartments: departments.length,
      employeesWithExtensions: withExt,
      employeesWithEmail: withEmail,
      employeesWithPhone: withPhone,
      activeEmployees: employees.filter((e) => e.isActive !== false).length,
      inactiveEmployees: employees.filter((e) => e.isActive === false).length,
      departmentStats,
      extensionCoverage: pct(withExt, total).toFixed(1),
      emailCoverage: pct(withEmail, total).toFixed(1),
      phoneCoverage: pct(withPhone, total).toFixed(1),
    }
  }, [employees, departments])

  const stats = useMemo(() => {
    // Coverage among the employees on staff at each month end
    const coverageAt = (field) => (cutoff) => {
      const staff = employees.filter((e) => {
        const d = getJoinDate(e)
        return d && d < cutoff
      })
      return Math.round(pct(staff.filter((e) => e[field]).length, staff.length) * 10) / 10
    }
    const headcount = monthlySeries(months, (c) => countBefore(employees, getJoinDate, c))
    const ext = monthlySeries(months, coverageAt('extension'))
    const email = monthlySeries(months, coverageAt('email'))
    const depts = monthlySeries(months, (c) => countBefore(departments, getCreatedDate, c))
    return [
      { label: 'Total Employees', value: analytics.totalEmployees, icon: Users, tone: 'indigo', series: headcount, change: seriesChange(headcount), subtitle: `${analytics.activeEmployees} active` },
      { label: 'Extension Coverage', value: `${analytics.extensionCoverage}%`, icon: Phone, tone: 'emerald', series: ext, change: seriesChange(ext), subtitle: `${analytics.employeesWithExtensions} employees` },
      { label: 'Email Coverage', value: `${analytics.emailCoverage}%`, icon: Mail, tone: 'violet', series: email, change: seriesChange(email), subtitle: `${analytics.employeesWithEmail} employees` },
      { label: 'Departments', value: analytics.totalDepartments, icon: Building2, tone: 'amber', series: depts, change: seriesChange(depts), subtitle: 'Active departments' },
    ]
  }, [employees, departments, analytics, months])

  const headcountChange = stats[0].change

  const handleExportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      analytics,
      employees,
      departments,
    }
    downloadBlob(
      new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' }),
      `qced-analytics-report-${new Date().toISOString().split('T')[0]}.json`
    )
  }

  const quickActions = [
    { name: 'Export Report', icon: FileDown, onClick: handleExportReport },
    { name: exporting === 'excel' ? 'Exporting…' : 'Export Excel', icon: FileSpreadsheet, onClick: () => exportAs('excel'), disabled: !!exporting },
    { name: exporting === 'csv' ? 'Exporting…' : 'Export CSV', icon: Download, onClick: () => exportAs('csv'), disabled: !!exporting },
    { name: 'Print Report', icon: Printer, onClick: () => window.print() },
  ]

  const summary =
    headcountChange === null
      ? `${analytics.totalEmployees} employees on record; no baseline from last month to compare against.`
      : headcountChange === 0
        ? 'Employee count is unchanged compared to last month.'
        : `Employee count ${headcountChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(headcountChange)}% compared to last month.`

  return (
    <div>
      <PageHero
        eyebrow="Analytics & Reports"
        title="Insights for Better Decisions"
        description="Explore employee, department and performance data to make informed decisions and build a stronger organization."
        meta={<PeriodPicker value={selectedPeriod} onChange={setSelectedPeriod} months={months} />}
        tagline="Data drives progress"
      />

      <main className="space-y-6 px-4 py-6 sm:px-6 xl:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} changeLabel="vs. last month" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <EmployeeOverviewCard employees={employees} departments={departments} title="Employee Distribution by Department" />
              <GrowthComboCard employees={employees} months={months} />
            </div>

            <DashboardCard title="Department Breakdown" bodyClassName="px-3 pb-4">
              {analytics.departmentStats.length === 0 ? (
                <p className="py-10 text-center text-sm text-navy-500">No departments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-navy-100 bg-navy-50/60 text-xs text-navy-500">
                        <th className="rounded-l-lg px-3 py-2.5 font-medium">Department</th>
                        <th className="px-3 py-2.5 font-medium">Employees</th>
                        <th className="px-3 py-2.5 font-medium">Percentage</th>
                        <th className="px-3 py-2.5 font-medium">Extensions</th>
                        <th className="rounded-r-lg px-3 py-2.5 font-medium">New this month</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      {analytics.departmentStats.map((dept) => (
                        <tr key={dept.id} className="transition-colors hover:bg-navy-50/60">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-3">
                              <DepartmentBadge name={dept.name} size="sm" />
                              <span className="font-medium text-navy-800">{dept.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 tabular-nums text-navy-800">{dept.count}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-navy-100">
                                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${dept.percentage}%` }} />
                              </div>
                              <span className="tabular-nums text-navy-500">{dept.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 tabular-nums text-navy-500">{dept.extensions}</td>
                          <td className="px-3 py-2.5">
                            {dept.newThisMonth > 0 ? (
                              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} /> {dept.newThisMonth}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-navy-500">
                                <ArrowRight className="h-3.5 w-3.5" /> 0
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardCard>
          </div>

          <aside className="grid grid-cols-1 content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
            <QuickActionList actions={quickActions} />

            <section className="surface px-5 py-5">
              <h2 className="flex items-center gap-2.5 text-sm font-semibold text-navy-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <BarChart3 className="h-4 w-4" />
                </span>
                Report Summary
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-navy-500">{summary}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                {analytics.departmentStats[0]?.count
                  ? `${analytics.departmentStats[0].name} is the largest department with ${analytics.departmentStats[0].count} employees.`
                  : ''}
              </p>
              <button type="button" onClick={handleExportReport} className="btn-navy mt-4 w-full">
                Export Full Report <ArrowRight className="h-4 w-4" />
              </button>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br from-indigo-50 to-navy-100/60 px-5 py-6 md:col-span-2 xl:col-span-1">
              <StarBurst className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 text-indigo-300/60" />
              <div className="relative">
                <BarChart3 className="h-8 w-8 text-indigo-600" strokeWidth={2.2} />
                <p className="mt-4 max-w-[13rem] text-sm font-medium text-navy-800">Download detailed reports and gain deeper insights.</p>
                <button type="button" onClick={() => exportAs('excel')} disabled={!!exporting} className="btn-navy mt-4">
                  {exporting === 'excel' ? 'Exporting…' : 'Download Excel'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default AnalyticsPage
