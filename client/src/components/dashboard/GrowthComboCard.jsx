import { useMemo } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardCard from './DashboardCard'
import { getJoinDate, startOfMonth, countBefore } from './dashboardUtils'

const TOTAL_COLOR = '#4f46e5'
const HIRES_COLOR = '#a5b4fc'

const ComboTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { fullLabel, total, hires } = payload[0].payload
  return (
    <div className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-navy-800">{fullLabel}</p>
      <p className="flex items-center gap-2 text-navy-500">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TOTAL_COLOR }} /> Total employees
        <span className="ml-auto pl-3 font-medium text-navy-800">{total}</span>
      </p>
      <p className="flex items-center gap-2 text-navy-500">
        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: HIRES_COLOR }} /> New hires
        <span className="ml-auto pl-3 font-medium text-navy-800">{hires}</span>
      </p>
    </div>
  )
}

/**
 * Monthly headcount (line) with new hires per month (bars) on one shared count axis.
 */
const GrowthComboCard = ({ employees, months = 6, title = 'Employee Growth Trend', action }) => {
  const data = useMemo(() => {
    const now = new Date()
    return Array.from({ length: months }, (_, i) => {
      const monthStart = startOfMonth(now, i - (months - 1))
      const nextMonth = startOfMonth(now, i - (months - 2))
      const total = countBefore(employees, getJoinDate, nextMonth)
      return {
        label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        fullLabel: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        total,
        hires: total - countBefore(employees, getJoinDate, monthStart),
      }
    })
  }, [employees, months])

  return (
    <DashboardCard title={title} action={action} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col px-6 pb-5">
      <div className="h-52 min-h-[208px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e8ebf5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7394' }} interval="preserveStartEnd" dy={6} />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7394' }}
              domain={[0, (max) => Math.max(5, Math.ceil(max * 1.25))]}
            />
            <Tooltip content={<ComboTooltip />} cursor={{ fill: '#eef0fa' }} />
            <Bar dataKey="hires" fill={HIRES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={TOTAL_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: TOTAL_COLOR, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: TOTAL_COLOR, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap items-center gap-5 text-xs text-navy-500">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TOTAL_COLOR }} /> Total Employees
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: HIRES_COLOR }} /> New Hires
        </li>
      </ul>
    </DashboardCard>
  )
}

export default GrowthComboCard
