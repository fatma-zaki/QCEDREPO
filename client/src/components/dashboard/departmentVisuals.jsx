import {
  Headphones,
  Landmark,
  Users,
  Monitor,
  Megaphone,
  Settings2,
  HeartHandshake,
  Briefcase,
  FlaskConical,
  Scale,
  Building2,
} from 'lucide-react'

const ICON_RULES = [
  [/customer|support|service/i, Headphones],
  [/financ|account|payroll/i, Landmark],
  [/human|hr\b|people|talent/i, Users],
  [/\bit\b|information|tech|digital|software/i, Monitor],
  [/market|communic|media|pr\b/i, Megaphone],
  [/operat|logistic/i, Settings2],
  [/sales|business dev|partner/i, HeartHandshake],
  [/research|develop|r&d|innovation/i, FlaskConical],
  [/legal|compliance/i, Scale],
  [/admin|board|executive|management/i, Briefcase],
]

const TINTS = [
  'bg-indigo-50 text-indigo-600',
  'bg-sky-50 text-sky-600',
  'bg-violet-50 text-violet-600',
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-600',
  'bg-emerald-50 text-emerald-600',
  'bg-teal-50 text-teal-600',
  'bg-fuchsia-50 text-fuchsia-600',
]

// Stable per-name hash so a department keeps its tint wherever it appears
const hash = (s = '') => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export const getDepartmentIcon = (name = '') => ICON_RULES.find(([re]) => re.test(name))?.[1] || Building2

export const getDepartmentTint = (name = '') => TINTS[hash(name) % TINTS.length]

export const DepartmentBadge = ({ name, size = 'md' }) => {
  const Icon = getDepartmentIcon(name)
  const box = size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-9 w-9 rounded-xl'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'
  return (
    <span className={`flex flex-shrink-0 items-center justify-center ${box} ${getDepartmentTint(name)}`}>
      <Icon className={icon} strokeWidth={1.8} />
    </span>
  )
}
