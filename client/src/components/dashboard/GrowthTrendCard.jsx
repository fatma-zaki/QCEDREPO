import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import DashboardCard from './DashboardCard'
import { getJoinDate, startOfMonth, countBefore, percentChange } from './dashboardUtils'

const RANGES = [
  { months: 6, label: '6 Months' },
  { months: 12, label: '12 Months' },
]

const PointTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { fullLabel, count } = payload[0].payload
  return (
    <div className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-navy-800">{fullLabel}</p>
      <p className="mt-0.5 text-navy-500">{count} employees</p>
    </div>
  )
}

const GrowthTrendCard = ({ employees }) => {
  const [months, setMonths] = useState(6)

  const { points, growth, added } = useMemo(() => {
    const now = new Date()
    const points = Array.from({ length: months }, (_, i) => {
      const monthStart = startOfMonth(now, i - (months - 1))
      const nextMonth = startOfMonth(now, i - (months - 2))
      return {
        label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        fullLabel: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        count: countBefore(employees, getJoinDate, nextMonth),
      }
    })
    const baseline = countBefore(employees, getJoinDate, startOfMonth(now, -(months - 1)))
    const current = points[points.length - 1]?.count || 0
    return { points, growth: percentChange(current, baseline), added: current - baseline }
  }, [employees, months])

  const down = growth !== null && growth < 0
  const TrendIcon = down ? TrendingDown : TrendingUp

  return (
    <DashboardCard
      title="Employee Growth Trend"
      action={
        <label className="relative">
          <span className="sr-only">Time range</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded-lg border border-navy-100 bg-white py-1.5 pl-3 pr-8 text-xs text-navy-800 focus:border-indigo-400 focus:outline-none"
          >
            {RANGES.map((r) => (
              <option key={r.months} value={r.months}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-500" />
        </label>
      }
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-6 pb-6"
    >
      <div className="h-44 min-h-[176px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e8ebf5" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7394' }}
              interval="preserveStartEnd"
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7394' }}
              domain={[0, (max) => Math.max(5, Math.ceil(max * 1.25))]}
            />
            <Tooltip content={<PointTooltip />} cursor={{ stroke: '#c7cbe6', strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#growthFill)"
              dot={{ r: 4, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl bg-navy-50 px-4 py-3">
        <TrendIcon className={`h-5 w-5 ${down ? 'text-rose-600' : 'text-emerald-600'}`} />
        <span className={`text-lg font-semibold ${down ? 'text-rose-600' : 'text-emerald-600'}`}>
          {growth === null ? `+${added}` : `${growth > 0 ? '+' : ''}${growth}%`}
        </span>
        <p className="text-xs leading-snug text-navy-500">
          {growth === null ? 'New employees' : 'Total employee growth'}
          <br />
          in the last {months} months
        </p>
      </div>
    </DashboardCard>
  )
}

export default GrowthTrendCard
