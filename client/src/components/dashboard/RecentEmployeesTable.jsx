import { useMemo } from 'react'
import DashboardCard, { CardLink } from './DashboardCard'
import { getDepartmentName } from './EmployeeOverviewCard'
import { getJoinDate } from './dashboardUtils'
import EmployeeAvatar, { StatusBadge, getEmployeeName } from './EmployeeAvatar'

const formatDate = (date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '—'

const RecentEmployeesTable = ({ employees, departments, viewAllHref, limit = 5 }) => {
  const rows = useMemo(
    () =>
      [...employees]
        .sort((a, b) => (getJoinDate(b)?.getTime() || 0) - (getJoinDate(a)?.getTime() || 0))
        .slice(0, limit),
    [employees, limit]
  )

  return (
    <DashboardCard
      title="Recent Employees"
      action={viewAllHref && <CardLink to={viewAllHref}>View all</CardLink>}
      bodyClassName="px-2 pb-4 sm:px-3"
    >
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-navy-500">No employees yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-navy-100 text-xs text-navy-500">
                <th className="px-3 py-2 font-normal sm:px-4">Name</th>
                <th className="px-3 py-2 font-normal">Department</th>
                <th className="px-3 py-2 font-normal">Position</th>
                <th className="px-3 py-2 font-normal">Joining Date</th>
                <th className="px-3 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((emp) => {
                const name = getEmployeeName(emp)
                return (
                  <tr key={emp._id || emp.id || emp.email} className="transition-colors hover:bg-navy-50/60">
                    <td className="px-3 py-2.5 sm:px-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar employee={emp} />
                        <span className="truncate font-medium text-navy-800">{name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-navy-500">{getDepartmentName(emp, departments)}</td>
                    <td className="px-3 py-2.5 text-navy-500">{emp.position || '—'}</td>
                    <td className="px-3 py-2.5 tabular-nums text-navy-500">{formatDate(getJoinDate(emp))}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge employee={emp} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}

export default RecentEmployeesTable
