import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import DashboardCard, { CardLink } from './DashboardCard'

// Categorical order validated for light surfaces (CVD + normal-vision separation).
// Identity is never color-only: the legend carries name, count and share.
export const CATEGORY_COLORS = ['#4f46e5', '#0f9f8f', '#e8703f', '#3b82f6', '#b458d4', '#c98a1a']
const OTHER_COLOR = '#9aa3c0'
const MAX_SLICES = CATEGORY_COLORS.length

export const getDepartmentName = (employee, departments) => {
  const dep = employee.department
  if (!dep) return 'Unassigned'
  if (typeof dep === 'object' && dep.name) return dep.name
  const id = typeof dep === 'object' ? dep._id : dep
  return departments.find((d) => d._id === id)?.name || 'Unassigned'
}

const SliceTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, pct, color } = payload[0].payload
  return (
    <div className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="flex items-center gap-2 font-medium text-navy-800">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {name}
      </p>
      <p className="mt-0.5 text-navy-500">
        {value} employees · {pct}%
      </p>
    </div>
  )
}

const EmployeeOverviewCard = ({ employees, departments, detailsHref, title = 'Employee Overview' }) => {
  const slices = useMemo(() => {
    const counts = new Map()
    employees.forEach((emp) => {
      const name = getDepartmentName(emp, departments)
      counts.set(name, (counts.get(name) || 0) + 1)
    })

    let groups = [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    // Fold the tail into "Other" rather than generating extra hues
    if (groups.length > MAX_SLICES) {
      const kept = groups.slice(0, MAX_SLICES - 1)
      const rest = groups.slice(MAX_SLICES - 1).reduce((sum, g) => sum + g.value, 0)
      groups = [...kept, { name: 'Other', value: rest, isOther: true }]
    }

    // Colour follows the department (its position in the department list), not its rank
    const deptOrder = (name) => {
      const i = departments.findIndex((d) => d.name === name)
      return i === -1 ? Number.MAX_SAFE_INTEGER : i
    }
    const colorByName = new Map()
    groups
      .filter((g) => !g.isOther)
      .sort((a, b) => deptOrder(a.name) - deptOrder(b.name))
      .forEach((g, i) => colorByName.set(g.name, CATEGORY_COLORS[i]))

    const total = employees.length || 1
    return groups.map((g) => ({
      ...g,
      color: g.isOther ? OTHER_COLOR : colorByName.get(g.name),
      pct: ((g.value / total) * 100).toFixed(1),
    }))
  }, [employees, departments])

  return (
    <DashboardCard
      title={title}
      titleExtra={
        <span title="Headcount by department">
          <Info className="h-4 w-4 text-navy-500" />
        </span>
      }
      action={detailsHref && <CardLink to={detailsHref}>View details</CardLink>}
      className="h-full"
    >
      {employees.length === 0 ? (
        <p className="py-16 text-center text-sm text-navy-500">No employees yet</p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="50%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="#ffffff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-navy-800">{employees.length}</span>
              <span className="text-[10px] text-navy-500">Total Employees</span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 divide-y divide-navy-100">
            {slices.map((s) => (
              <li key={s.name} className="flex items-center gap-3 py-2 text-[13px]">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="min-w-0 flex-1 truncate text-navy-800">{s.name}</span>
                <span className="whitespace-nowrap tabular-nums text-navy-500">
                  {s.value} <span className="ml-1">({s.pct}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  )
}

export default EmployeeOverviewCard
