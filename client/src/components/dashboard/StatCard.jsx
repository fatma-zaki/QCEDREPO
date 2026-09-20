import { useId } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export const TONES = {
  indigo: { chip: 'bg-indigo-50 text-indigo-600', stroke: '#4f46e5' },
  emerald: { chip: 'bg-emerald-50 text-emerald-600', stroke: '#0f9f8f' },
  violet: { chip: 'bg-violet-50 text-violet-600', stroke: '#8b5cf6' },
  amber: { chip: 'bg-amber-50 text-amber-600', stroke: '#d4901a' },
  sky: { chip: 'bg-sky-50 text-sky-600', stroke: '#3b82f6' },
}

/** Tiny single-series trend line; decorative context for the headline number. */
export const Sparkline = ({ data = [], color = '#4f46e5', className = 'h-10 w-28' }) => {
  const gradientId = useId()
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    // Flat series sit mid-height; otherwise keep 3px of headroom top and bottom
    const y = max === min ? 16 : 29 - ((v - min) / span) * 26
    return [x, y]
  })
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L100,32 L0,32 Z`

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export const TrendLabel = ({ change, label = 'vs. last month' }) => {
  const up = change > 0
  const down = change < 0
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus
  const color = up ? 'text-emerald-600' : down ? 'text-rose-600' : 'text-navy-500'
  return (
    <div>
      <p className={`flex items-center gap-1 text-[13px] font-medium ${color}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {Math.abs(change)}%
      </p>
      <p className="whitespace-nowrap text-[11px] text-navy-500">{label}</p>
    </div>
  )
}

/**
 * KPI card: tinted icon chip, headline value, month-over-month change and a sparkline.
 */
const StatCard = ({ label, value, suffix, icon: Icon, tone = 'indigo', series, change, changeLabel, subtitle }) => {
  const t = TONES[tone] || TONES.indigo
  return (
    <div className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,64,0.04)]">
      {Icon && (
        <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${t.chip}`}>
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-navy-500">{label}</p>
        <p className="mt-1 text-[1.65rem] font-semibold leading-tight tracking-tight text-navy-800">
          {value}
          {suffix && <span className="ml-1 text-sm font-medium text-navy-500">{suffix}</span>}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          {typeof change === 'number' ? (
            <TrendLabel change={change} label={changeLabel} />
          ) : (
            <p className="truncate text-[11px] text-navy-500">{subtitle}</p>
          )}
          {series && <Sparkline data={series} color={t.stroke} className="h-9 min-w-0 max-w-[7rem] flex-1" />}
        </div>
      </div>
    </div>
  )
}

export default StatCard
