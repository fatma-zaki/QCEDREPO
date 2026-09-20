import { getInitials } from './dashboardUtils'

const AVATAR_TINTS = [
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-sky-100 text-sky-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

const SIZES = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
}

export const getEmployeeName = (e) =>
  e?.name || `${e?.firstName || ''} ${e?.lastName || ''}`.trim() || e?.username || 'Unnamed'

const EmployeeAvatar = ({ employee, size = 'sm', className = '' }) => {
  const box = SIZES[size] || SIZES.sm
  if (employee?.avatar) {
    return <img src={employee.avatar} alt="" className={`${box} flex-shrink-0 rounded-full object-cover ${className}`} />
  }
  const name = getEmployeeName(employee)
  const [first = '', last = ''] = employee?.firstName ? [employee.firstName, employee.lastName] : name.split(' ')
  const seed = name.length
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-semibold ${box} ${AVATAR_TINTS[seed % AVATAR_TINTS.length]} ${className}`}
    >
      {getInitials(first, last)}
    </span>
  )
}

export const STATUS_STYLES = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  on_leave: { label: 'On Leave', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  suspended: { label: 'Suspended', dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  terminated: { label: 'Terminated', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
  inactive: { label: 'Inactive', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' },
}

export const getStatusKey = (e) =>
  e?.isActive === false && (!e?.status || e.status === 'active') ? 'inactive' : e?.status || 'active'

export const StatusBadge = ({ employee }) => {
  const status = STATUS_STYLES[getStatusKey(employee)] || STATUS_STYLES.active
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
      {status.label}
    </span>
  )
}

const ROLE_STYLES = {
  admin: 'bg-indigo-50 text-indigo-700',
  hr: 'bg-sky-50 text-sky-700',
  manager: 'bg-amber-50 text-amber-700',
}

export const RoleBadge = ({ role }) =>
  role ? (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_STYLES[role] || 'bg-navy-50 text-navy-500'}`}>
      {role === 'hr' ? 'HR' : role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  ) : null

export default EmployeeAvatar
