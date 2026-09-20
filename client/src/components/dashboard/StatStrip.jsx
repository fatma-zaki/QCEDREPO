import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

const Trend = ({ change, label }) => {
  const up = change > 0
  const down = change < 0
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus
  const color = up ? 'text-emerald-600' : down ? 'text-rose-600' : 'text-navy-500'
  return (
    <div className="mt-1.5">
      <p className={`flex items-center gap-1 text-[13px] font-medium ${color}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {Math.abs(change)}%
      </p>
      <p className="text-xs text-navy-500">{label}</p>
    </div>
  )
}

const LG_COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }

/**
 * Horizontal KPI strip. Each stat: { name, value, icon, suffix?, change?, changeLabel?, subtitle? }
 * `change` (a percentage) renders a trend arrow; otherwise `subtitle` is shown.
 */
const StatStrip = ({ stats = [] }) => {
  if (!stats.length) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_1px_2px_rgba(16,24,64,0.04)]">
      <div className={`grid grid-cols-1 gap-px bg-navy-100 sm:grid-cols-2 ${LG_COLS[stats.length] || 'lg:grid-cols-4'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          // An odd trailing card spans the 2-col row so no empty cell shows through
          const spanLast = stats.length % 2 === 1 && index === stats.length - 1
          return (
            <div
              key={stat.name}
              className={`flex items-start gap-4 bg-white px-6 py-5 ${spanLast ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              {Icon && <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-navy-800" strokeWidth={1.6} />}
              <div className="min-w-0">
                <p className="truncate text-[13px] text-navy-500">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-navy-800">
                  {stat.value}
                  {stat.suffix && <span className="ml-1.5 text-sm font-medium text-navy-500">{stat.suffix}</span>}
                </p>
                {typeof stat.change === 'number' ? (
                  <Trend change={stat.change} label={stat.changeLabel || 'vs. last month'} />
                ) : (
                  stat.subtitle && <p className="mt-1.5 truncate text-xs text-navy-500">{stat.subtitle}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatStrip
