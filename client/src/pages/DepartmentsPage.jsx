import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, Building2, Users, TrendingUp, Download, Filter, LayoutGrid, List, User, ChevronDown } from 'lucide-react'
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../store/slices/departmentSlice'
import { fetchEmployees } from '../store/slices/employeeSlice'
import PageHero from '../components/layout/PageHero'
import StatCard from '../components/dashboard/StatCard'
import QuickActionList from '../components/dashboard/QuickActionList'
import Modal from '../components/ui/Modal'
import { DepartmentBadge } from '../components/dashboard/departmentVisuals'
import { getJoinDate, getCreatedDate, countBefore, monthlySeries, seriesChange, toCsv, downloadBlob } from '../components/dashboard/dashboardUtils'
import { useNotifications } from '../hooks/useNotifications'

const LEVELS = [
  { value: 'board', label: 'Board' },
  { value: 'administration', label: 'Administration' },
  { value: 'department', label: 'Department' },
  { value: 'sub_department', label: 'Sub Department' },
  { value: 'team', label: 'Team' },
]
const levelLabel = (level) => LEVELS.find((l) => l.value === level)?.label || (level ? level.replace('_', ' ') : '—')

const EMPTY_FORM = { name: '', description: '', organizationalCode: '', level: 'department' }

const deptIdOf = (employee) => (typeof employee.department === 'object' ? employee.department?._id : employee.department)

const LevelPill = ({ level }) => (
  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">{levelLabel(level)}</span>
)

const RowActions = ({ department, count, onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-1">
    <button type="button" onClick={onEdit} className="icon-btn" title="Edit department" aria-label={`Edit ${department.name}`}>
      <Pencil className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      disabled={count > 0}
      className="icon-btn hover:bg-rose-50 hover:text-rose-600"
      title={count > 0 ? `Cannot delete: ${count} employee${count !== 1 ? 's' : ''} assigned` : 'Delete department'}
      aria-label={`Delete ${department.name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
)

const DepartmentsPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const departments = useSelector((state) => state.departments.departments || [])
  const employees = useSelector((state) => state.employees.employees || [])
  const loading = useSelector((state) => state.departments.loading)
  const error = useSelector((state) => state.departments.error)

  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [levelFilter, setLevelFilter] = useState('')
  const [view, setView] = useState('list')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Departments · Qassim Chamber'
    dispatch(fetchDepartments())
    dispatch(fetchEmployees())
  }, [dispatch])

  // Prefer the server's employeeCount; fall back to counting loaded employees
  const countFor = useMemo(() => {
    const byDept = new Map()
    employees.forEach((e) => {
      const id = deptIdOf(e)
      if (id) byDept.set(id, (byDept.get(id) || 0) + 1)
    })
    return (dept) => dept.employeeCount ?? byDept.get(dept._id) ?? 0
  }, [employees])

  const totalEmployees = departments.reduce((sum, d) => sum + countFor(d), 0)
  const avg = departments.length ? Math.round((totalEmployees / departments.length) * 10) / 10 : 0

  const stats = useMemo(() => {
    const deptSeries = monthlySeries(6, (cutoff) => countBefore(departments, getCreatedDate, cutoff))
    const headSeries = monthlySeries(6, (cutoff) => countBefore(employees, getJoinDate, cutoff))
    const avgSeries = deptSeries.map((d, i) => (d ? Math.round((headSeries[i] / d) * 10) / 10 : 0))
    return [
      { label: 'Total Departments', value: departments.length, icon: Building2, tone: 'sky', series: deptSeries, change: seriesChange(deptSeries) },
      { label: 'Total Employees', value: totalEmployees, icon: Users, tone: 'emerald', series: headSeries, change: seriesChange(headSeries) },
      { label: 'Avg. per Department', value: avg, icon: TrendingUp, tone: 'violet', series: avgSeries, change: seriesChange(avgSeries) },
    ]
  }, [departments, employees, totalEmployees, avg])

  const visible = useMemo(
    () => (levelFilter ? departments.filter((d) => d.level === levelFilter) : departments),
    [departments, levelFilter]
  )

  const openCreate = () => {
    setEditingDepartment(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || '',
      organizationalCode: department.organizationalCode || '',
      level: department.level || 'department',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const thunk = editingDepartment ? updateDepartment : createDepartment
    const result = await dispatch(
      editingDepartment ? updateDepartment({ id: editingDepartment._id, departmentData: formData }) : createDepartment(formData)
    )
    setSaving(false)
    if (thunk.fulfilled.match(result)) {
      showSuccess(editingDepartment ? 'Department updated' : 'Department created')
      handleCloseModal()
    } else {
      showError(result.payload || 'Failed to save department')
    }
  }

  const handleDelete = async (department) => {
    const employeeCount = countFor(department)
    if (employeeCount > 0) {
      showError(`Cannot delete "${department.name}". It has ${employeeCount} employee${employeeCount !== 1 ? 's' : ''}. Reassign or remove them first.`)
      return
    }
    if (window.confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      const result = await dispatch(deleteDepartment(department._id))
      if (deleteDepartment.fulfilled.match(result)) showSuccess('Department deleted')
      else showError(result.payload || 'Failed to delete department')
    }
  }

  const handleExport = () => {
    const rows = [
      ['Department', 'Code', 'Level', 'Employees', 'Description'],
      ...departments.map((d) => [d.name, d.organizationalCode || '', levelLabel(d.level), countFor(d), d.description || '']),
    ]
    downloadBlob(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), 'departments.csv')
    showSuccess('Departments exported to CSV')
  }

  const quickActions = [
    { name: 'Add Department', icon: Plus, onClick: openCreate },
    { name: 'Export CSV', icon: Download, onClick: handleExport, disabled: departments.length === 0 },
    { name: 'View Employees', icon: Users, href: '/admin/employees' },
  ]

  return (
    <div>
      <PageHero
        eyebrow="Qassim Chamber"
        title="Manage Departments"
        description="Organize your teams, track department performance, and manage workforce structure efficiently."
        tagline="Stronger teams for a thriving local economy"
      />

      <main className="space-y-6 px-4 py-6 sm:px-6 xl:px-8">
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
          <QuickActionList actions={quickActions} dense className="py-4" />
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <section className="surface">
          <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div>
              <h2 className="font-serif text-xl text-navy-800">Departments ({visible.length})</h2>
              <p className="mt-0.5 text-xs text-navy-500">Manage all departments and their details</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <span className="sr-only">Filter by level</span>
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-500" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="cursor-pointer appearance-none rounded-xl border border-navy-100 bg-white py-2 pl-8 pr-8 text-xs text-navy-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">All Levels</option>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-500" />
              </label>
              <div className="flex rounded-xl border border-navy-100 p-0.5" role="group" aria-label="View">
                {[
                  { key: 'grid', icon: LayoutGrid, label: 'Grid view' },
                  { key: 'list', icon: List, label: 'List view' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    aria-pressed={view === key}
                    aria-label={label}
                    className={`rounded-lg p-1.5 transition-colors ${view === key ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-50'}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </header>

          {loading && departments.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-indigo-600" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-500">
                <Building2 className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-navy-800">No departments found</h3>
              <p className="mt-1 text-sm text-navy-500">{levelFilter ? 'No departments at this level.' : 'Get started by creating a new department.'}</p>
              {!levelFilter && (
                <button type="button" onClick={openCreate} className="btn-navy mt-5">
                  <Plus className="h-4 w-4" /> Add Department
                </button>
              )}
            </div>
          ) : view === 'list' ? (
            <div className="overflow-x-auto px-3 pb-3">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-navy-100 text-[11px] uppercase tracking-wider text-navy-500">
                    <th className="w-10 px-3 py-2.5 font-medium">#</th>
                    <th className="px-3 py-2.5 font-medium">Department</th>
                    <th className="px-3 py-2.5 font-medium">Level</th>
                    <th className="px-3 py-2.5 font-medium">Employees</th>
                    <th className="px-3 py-2.5 font-medium">Description</th>
                    <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {visible.map((department, i) => {
                    const count = countFor(department)
                    return (
                      <tr key={department._id} className="transition-colors hover:bg-navy-50/60">
                        <td className="px-3 py-3 tabular-nums text-navy-500">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <DepartmentBadge name={department.name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-navy-800">{department.name}</p>
                              {department.organizationalCode && <p className="text-[11px] text-navy-500">{department.organizationalCode}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <LevelPill level={department.level} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-2 text-navy-800">
                            <User className="h-3.5 w-3.5 text-navy-500" />
                            {count} employee{count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-3 py-3 text-navy-500">{department.description || 'No description'}</td>
                        <td className="px-3 py-3">
                          <RowActions department={department} count={count} onEdit={() => handleEdit(department)} onDelete={() => handleDelete(department)} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visible.map((department) => {
                const count = countFor(department)
                return (
                  <article key={department._id} className="flex flex-col rounded-2xl border border-navy-100 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <DepartmentBadge name={department.name} />
                      <LevelPill level={department.level} />
                    </div>
                    <h3 className="mt-3 truncate text-sm font-semibold text-navy-800">{department.name}</h3>
                    {department.organizationalCode && <p className="text-[11px] text-navy-500">{department.organizationalCode}</p>}
                    <p className="mt-2 line-clamp-2 flex-1 text-xs text-navy-500">{department.description || 'No description'}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-navy-800">
                        <User className="h-3.5 w-3.5 text-navy-500" />
                        {count} employee{count !== 1 ? 's' : ''}
                      </span>
                      <RowActions department={department} count={count} onEdit={() => handleEdit(department)} onDelete={() => handleDelete(department)} />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
        subtitle={editingDepartment ? editingDepartment.name : 'Create a new unit in the organization'}
        size="md"
        footer={
          <>
            <button type="button" onClick={handleCloseModal} className="btn-soft">
              Cancel
            </button>
            <button type="submit" form="department-form" disabled={saving} className="btn-navy">
              {saving ? 'Saving…' : editingDepartment ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form id="department-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-navy-500">
            Department Name
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field mt-1"
              placeholder="Enter department name"
            />
          </label>
          <label className="block text-xs font-medium text-navy-500">
            Description (Optional)
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="field mt-1"
              placeholder="Enter department description"
            />
          </label>
          <label className="block text-xs font-medium text-navy-500">
            Organizational Code (Optional)
            <input
              type="text"
              value={formData.organizationalCode}
              onChange={(e) => setFormData({ ...formData, organizationalCode: e.target.value })}
              className="field mt-1"
              placeholder="e.g. IT-001"
              pattern="[A-Z]{2,5}-[0-9]{2,4}"
              title="Format: 2-5 uppercase letters, dash, 2-4 digits (e.g. IT-001)"
            />
            <span className="mt-1 block font-normal text-navy-500/80">Format: 2-5 uppercase letters, dash, 2-4 digits (e.g. IT-001)</span>
          </label>
          <label className="block text-xs font-medium text-navy-500">
            Department Level
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="field mt-1">
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}

export default DepartmentsPage
