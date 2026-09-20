import { Pencil, Mail, Phone, Copy, Contact2, CalendarPlus, RefreshCw } from 'lucide-react'
import Modal from '../ui/Modal'
import QRCodeGenerator from '../QRCodeGenerator'
import EmployeeAvatar, { StatusBadge, RoleBadge, getEmployeeName } from '../dashboard/EmployeeAvatar'
import { useNotifications } from '../../hooks/useNotifications'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown')

const Field = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-medium uppercase tracking-wide text-navy-500">{label}</dt>
    <dd className="mt-1 text-sm text-navy-800">{value}</dd>
  </div>
)

const EmployeeDetailsModal = ({ employee, onClose, onEdit, canEdit }) => {
  const { showSuccess } = useNotifications()
  if (!employee) return null

  const name = getEmployeeName(employee)
  const department = employee.department?.name || 'No Department'

  const copy = (text, message) => {
    navigator.clipboard.writeText(text || '')
    showSuccess(message)
  }

  const actions = [
    {
      label: canEdit ? 'Edit Employee' : 'Edit Restricted',
      icon: Pencil,
      onClick: onEdit,
      disabled: !canEdit,
    },
    { label: 'Copy Email', icon: Mail, onClick: () => copy(employee.email, 'Email copied to clipboard!') },
    employee.extension && {
      label: 'Copy Extension',
      icon: Phone,
      onClick: () => copy(String(employee.extension), 'Extension copied to clipboard!'),
    },
    {
      label: 'Copy Contact',
      icon: Copy,
      onClick: () =>
        copy(
          `Name: ${name}\nExtension: ${employee.extension || 'N/A'}\nEmail: ${employee.email || 'N/A'}\nDepartment: ${employee.department?.name || 'N/A'}`,
          'Contact info copied to clipboard!'
        ),
    },
  ].filter(Boolean)

  return (
    <Modal isOpen onClose={onClose} title="Employee Details" subtitle={department} size="4xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Profile */}
        <aside className="rounded-2xl bg-navy-50/70 p-5 text-center">
          <EmployeeAvatar employee={employee} size="xl" className="mx-auto ring-4 ring-white" />
          <h4 className="mt-4 text-lg font-semibold text-navy-800">{name}</h4>
          <p className="text-sm text-navy-500">{employee.position || department}</p>
          <div className="mt-3 flex justify-center gap-2">
            <RoleBadge role={employee.role} />
            <StatusBadge employee={employee} />
          </div>
          <dl className="mt-5 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5">
              <Phone className="h-4 w-4 text-indigo-600" />
              <div className="min-w-0">
                <dt className="text-[11px] text-navy-500">Extension</dt>
                <dd className="text-sm text-navy-800">{employee.extension || 'Not assigned'}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5">
              <Mail className="h-4 w-4 text-indigo-600" />
              <div className="min-w-0">
                <dt className="text-[11px] text-navy-500">Email</dt>
                <dd className="truncate text-sm text-navy-800">{employee.email || 'Not provided'}</dd>
              </div>
            </div>
          </dl>
          <div className="mt-5 border-t border-navy-100 pt-5">
            <QRCodeGenerator employee={employee} type="employee_card" />
          </div>
        </aside>

        <div className="space-y-6">
          {/* Actions */}
          <section>
            <h5 className="mb-3 text-sm font-semibold text-navy-800">Quick Actions</h5>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {actions.map(({ label, icon: Icon, onClick, disabled }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className="flex flex-col items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-4 text-xs font-medium text-navy-800 transition-colors hover:border-indigo-200 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon className="h-5 w-5 text-indigo-600" strokeWidth={1.7} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Details */}
          <section>
            <h5 className="mb-3 text-sm font-semibold text-navy-800">Detailed Information</h5>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-2xl border border-navy-100 p-5 sm:grid-cols-2">
              <Field label="Full Name" value={name} />
              <Field label="Position" value={employee.position || 'Not specified'} />
              <Field label="Role" value={employee.role ? employee.role.charAt(0).toUpperCase() + employee.role.slice(1) : 'Not specified'} />
              <Field label="Department" value={department} />
              <Field label="Phone" value={employee.phone || 'Not provided'} />
              <Field label="Employee Code" value={employee.employeeCode || '—'} />
            </dl>
          </section>

          {/* Timeline */}
          <section>
            <h5 className="mb-3 text-sm font-semibold text-navy-800">Timeline</h5>
            <ol className="space-y-2">
              {[
                { icon: RefreshCw, label: 'Profile last updated', date: employee.updatedAt },
                { icon: CalendarPlus, label: 'Employee created', date: employee.createdAt },
                employee.hireDate && { icon: Contact2, label: 'Hire date', date: employee.hireDate },
              ]
                .filter(Boolean)
                .map(({ icon: Icon, label, date }) => (
                  <li key={label} className="flex items-center gap-3 rounded-xl bg-navy-50/70 px-4 py-3">
                    <Icon className="h-4 w-4 text-indigo-600" />
                    <span className="flex-1 text-sm text-navy-800">{label}</span>
                    <span className="text-xs text-navy-500">{fmtDate(date)}</span>
                  </li>
                ))}
            </ol>
          </section>
        </div>
      </div>
    </Modal>
  )
}

export default EmployeeDetailsModal
