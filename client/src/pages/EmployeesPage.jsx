import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users,
  Building2,
  UserCheck,
  UserPlus,
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  Download,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronDown,
  X,
} from 'lucide-react'
import {
  fetchEmployees,
  deleteEmployee,
  setSearchTerm,
  setFilterDepartment,
  setSortBy,
  setSortOrder,
} from '../store/slices/employeeSlice'
import { fetchDepartments } from '../store/slices/departmentSlice'
import BulkOperations from '../components/BulkOperations'
import { EmployeeForm, QassimLoadingSpinner } from '../components'
import PageHero from '../components/layout/PageHero'
import StatCard from '../components/dashboard/StatCard'
import QuickActionList from '../components/dashboard/QuickActionList'
import StarBurst from '../components/dashboard/StarBurst'
import EmployeeAvatar, { StatusBadge, RoleBadge, getEmployeeName, getStatusKey } from '../components/dashboard/EmployeeAvatar'
import EmployeeDetailsModal from '../components/employees/EmployeeDetailsModal'
import {
  getJoinDate,
  getCreatedDate,
  countBefore,
  monthlySeries,
  seriesChange,
  startOfMonth,
} from '../components/dashboard/dashboardUtils'
import { useNotifications } from '../hooks/useNotifications'
import { useEmployeeExport } from '../hooks/useEmployeeExport'

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Recently Added' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'department:asc', label: 'Department' },
  { value: 'extension:asc', label: 'Extension' },
  { value: 'email:asc', label: 'Email' },
]

const sortValue = (employee, key) => {
  switch (key) {
    case 'extension':
      return parseInt(employee.extension) || 0
    case 'department':
      return (employee.department?.name || '').toLowerCase()
    case 'email':
      return (employee.email || '').toLowerCase()
    case 'createdAt':
      return new Date(employee.createdAt || employee.updatedAt || 0).getTime()
    default:
      return getEmployeeName(employee).toLowerCase()
  }
}

const EmployeeCard = ({ employee, selected, onToggle, onView, onEdit, onDelete, canEdit, canDelete }) => (
  <article
    className={`group relative flex flex-col rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
      selected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-navy-100'
    }`}
  >
    <div className="flex items-center justify-between">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${getEmployeeName(employee)}`}
        className="h-4 w-4 rounded border-navy-200 text-indigo-600 focus:ring-indigo-500"
      />
      <StatusBadge employee={employee} />
    </div>

    <div className="mt-3 flex items-start gap-3">
      <EmployeeAvatar employee={employee} size="lg" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-navy-800">{getEmployeeName(employee)}</h3>
        <p className="truncate text-xs text-navy-500">{employee.department?.name || 'No Department'}</p>
        <div className="mt-1.5">
          <RoleBadge role={employee.role || 'employee'} />
        </div>
      </div>
    </div>

    <dl className="mt-4 space-y-1.5 border-t border-navy-100 pt-3 text-xs text-navy-500">
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
        <dt className="sr-only">Extension</dt>
        <dd>
          Ext: <span className="text-navy-800">{employee.extension || '—'}</span>
        </dd>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
        <dt className="sr-only">Email</dt>
        <dd className="truncate">{employee.email || '—'}</dd>
      </div>
    </dl>

    <div className="mt-3 flex items-center justify-end gap-1 border-t border-navy-100 pt-2">
      <button type="button" onClick={onView} className="icon-btn" title="View details" aria-label="View details">
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={!canEdit}
        className="icon-btn"
        title={canEdit ? 'Edit employee' : 'Only administrators can edit admin accounts'}
        aria-label="Edit employee"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {canDelete && (
        <button type="button" onClick={onDelete} className="icon-btn hover:bg-rose-50 hover:text-rose-600" title="Delete employee" aria-label="Delete employee">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  </article>
)

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { exportAs, exporting } = useEmployeeExport()
  const { user } = useSelector((state) => state.auth || {})
  const employees = useSelector((state) => state.employees.employees || [])
  const departments = useSelector((state) => state.departments.departments || [])
  const searchTerm = useSelector((state) => state.employees.searchTerm || '')
  const filterDepartment = useSelector((state) => state.employees.filterDepartment || '')
  const sortBy = useSelector((state) => state.employees.sortBy || 'name')
  const sortOrder = useSelector((state) => state.employees.sortOrder || 'asc')
  const loading = useSelector((state) => state.employees.loading)
  const error = useSelector((state) => state.employees.error)

  const isAdmin = user?.role === 'admin'
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [detailsEmployee, setDetailsEmployee] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    document.title = 'Employees · Qassim Chamber'
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return employees
      .filter((employee) => {
        const matchesSearch =
          !q ||
          getEmployeeName(employee).toLowerCase().includes(q) ||
          employee.email?.toLowerCase().includes(q) ||
          employee.extension?.toString().includes(q) ||
          employee.position?.toLowerCase().includes(q) ||
          employee.department?.name?.toLowerCase().includes(q)
        const matchesDepartment = !filterDepartment || employee.department?._id === filterDepartment
        return matchesSearch && matchesDepartment
      })
      .sort((a, b) => {
        const av = sortValue(a, sortBy)
        const bv = sortValue(b, sortBy)
        if (av === bv) return 0
        return (av > bv ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1)
      })
  }, [employees, searchTerm, filterDepartment, sortBy, sortOrder])

  const stats = useMemo(() => {
    const headcount = monthlySeries(6, (cutoff) => countBefore(employees, getJoinDate, cutoff))
    const deptCount = monthlySeries(6, (cutoff) => countBefore(departments, getCreatedDate, cutoff))
    const hires = monthlySeries(6, (cutoff) => {
      const monthStart = startOfMonth(new Date(cutoff.getTime() - 1))
      return countBefore(employees, getJoinDate, cutoff) - countBefore(employees, getJoinDate, monthStart)
    })
    const active = employees.filter((e) => getStatusKey(e) === 'active').length
    return [
      { label: 'Total Employees', value: employees.length, icon: Users, tone: 'indigo', series: headcount, change: seriesChange(headcount), subtitle: `${active} active` },
      { label: 'Departments', value: departments.length, icon: Building2, tone: 'sky', series: deptCount, change: seriesChange(deptCount), subtitle: 'Active departments' },
      {
        label: 'Active Rate',
        value: `${employees.length ? Math.round((active / employees.length) * 100) : 0}%`,
        icon: UserCheck,
        tone: 'emerald',
        subtitle: `${active} of ${employees.length} active`,
      },
      { label: 'New This Month', value: hires[hires.length - 1], icon: UserPlus, tone: 'amber', series: hires, change: seriesChange(hires), subtitle: 'Joined this month' },
    ]
  }, [employees, departments])

  const canEditEmployee = (employee) => !(employee?.role === 'admin' && !isAdmin)

  const handleEdit = (employee) => {
    // Prevent non-admin users from editing admin employees
    if (!canEditEmployee(employee)) {
      showError('Only administrators can edit admin accounts')
      return
    }
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await dispatch(deleteEmployee(id))
      if (deleteEmployee.fulfilled.match(result)) {
        showSuccess('Employee deleted successfully!')
        setSelectedEmployees((ids) => ids.filter((x) => x !== id))
      } else {
        showError('Failed to delete employee')
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
  }

  const toggleSelected = (id) =>
    setSelectedEmployees((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const quickActions = [
    isAdmin && { name: 'Add Employee', icon: UserPlus, onClick: () => setShowModal(true) },
    { name: exporting === 'excel' ? 'Exporting…' : 'Export Excel', icon: FileSpreadsheet, onClick: () => exportAs('excel'), disabled: !!exporting },
    { name: exporting === 'csv' ? 'Exporting…' : 'Export CSV', icon: Download, onClick: () => exportAs('csv'), disabled: !!exporting },
  ].filter(Boolean)

  const activeFilterCount = filterDepartment ? 1 : 0
  const selectedDepartmentName = departments.find((d) => d._id === filterDepartment)?.name

  return (
    <div>
      <PageHero
        eyebrow="Qassim Chamber"
        title="Manage Your Team"
        description="Track, organize and manage your employees efficiently with a simple and powerful system."
        tagline="Unlocking opportunities for a stronger economy"
        actions={
          user?.role === 'manager' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">View &amp; Update Only</span>
          )
        }
      />

      <main className="space-y-6 px-4 py-6 sm:px-6 xl:px-8">
        {/* Search + quick actions */}
        <div className="grid grid-cols-1 items-center gap-5 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="surface p-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  placeholder="Search by name, extension, email, or department..."
                  aria-label="Search employees"
                  className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-navy-800 placeholder:text-navy-500/80 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  showFilters ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-800 hover:bg-navy-100'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`rounded-full px-1.5 text-[10px] font-semibold ${showFilters ? 'bg-white text-navy-900' : 'bg-indigo-600 text-white'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-2 grid grid-cols-1 gap-3 border-t border-navy-100 p-3 sm:grid-cols-[repeat(2,minmax(0,1fr))_auto]">
                <label className="text-xs font-medium text-navy-500">
                  Department
                  <select
                    value={filterDepartment}
                    onChange={(e) => dispatch(setFilterDepartment(e.target.value))}
                    className="field mt-1"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-navy-500">
                  Sort by
                  <select
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split(':')
                      dispatch(setSortBy(by))
                      dispatch(setSortOrder(order))
                    }}
                    className="field mt-1"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setFilterDepartment(''))
                    dispatch(setSortBy('name'))
                    dispatch(setSortOrder('asc'))
                  }}
                  className="btn-soft self-end"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <QuickActionList variant="inline" actions={quickActions} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,0.85fr)]">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
          <div className="relative hidden overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br from-white to-indigo-50 p-5 2xl:block">
            <StarBurst className="pointer-events-none absolute -bottom-14 -right-14 h-44 w-44 text-indigo-300/60" />
            <p className="relative max-w-[10rem] font-serif text-[17px] leading-snug text-navy-800">Building a thriving business community</p>
            <span className="relative mt-4 block h-px w-8 bg-navy-800/40" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {/* Employees */}
        <section className="surface">
          <header className="flex flex-wrap items-center justify-between gap-3 px-6 pb-2 pt-5">
            <h2 className="flex items-center gap-2.5 font-serif text-xl text-navy-800">
              <Users className="h-5 w-5 text-navy-500" strokeWidth={1.7} />
              Employees ({filteredEmployees.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {selectedDepartmentName && (
                <button
                  type="button"
                  onClick={() => dispatch(setFilterDepartment(''))}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  {selectedDepartmentName}
                  <X className="h-3 w-3" />
                </button>
              )}
              <label className="relative">
                <span className="sr-only">Sort employees</span>
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split(':')
                    dispatch(setSortBy(by))
                    dispatch(setSortOrder(order))
                  }}
                  className="cursor-pointer appearance-none rounded-lg bg-transparent py-1.5 pl-3 pr-8 text-xs text-navy-800 hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-500" />
              </label>
            </div>
          </header>

          <BulkOperations
            selectedEmployees={selectedEmployees}
            onSelectionChange={setSelectedEmployees}
            employees={filteredEmployees}
            departments={departments}
            onRefresh={() => dispatch(fetchEmployees())}
          />

          {loading && employees.length === 0 ? (
            <QassimLoadingSpinner size="lg" text="Loading employees..." className="py-16" />
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-500">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-navy-800">No employees found</h3>
              <p className="mt-1 text-sm text-navy-500">
                {searchTerm || filterDepartment ? 'Try a different search or clear the filters.' : 'Get started by adding a new employee.'}
              </p>
              {isAdmin && !searchTerm && !filterDepartment && (
                <button type="button" onClick={() => setShowModal(true)} className="btn-navy mt-5">
                  <UserPlus className="h-4 w-4" /> Add First Employee
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee._id}
                  employee={employee}
                  selected={selectedEmployees.includes(employee._id)}
                  onToggle={() => toggleSelected(employee._id)}
                  onView={() => setDetailsEmployee(employee)}
                  onEdit={() => handleEdit(employee)}
                  onDelete={() => handleDelete(employee._id)}
                  canEdit={canEditEmployee(employee)}
                  canDelete={isAdmin}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {detailsEmployee && (
        <EmployeeDetailsModal
          employee={detailsEmployee}
          canEdit={canEditEmployee(detailsEmployee)}
          onClose={() => setDetailsEmployee(null)}
          onEdit={() => {
            const employee = detailsEmployee
            setDetailsEmployee(null)
            handleEdit(employee)
          }}
        />
      )}

      <EmployeeForm isOpen={showModal} onClose={handleCloseModal} editingEmployee={editingEmployee} onSuccess={() => dispatch(fetchEmployees())} />
    </div>
  )
}

export default EmployeesPage
