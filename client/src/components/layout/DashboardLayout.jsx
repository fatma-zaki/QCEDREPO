import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { UserPlus, ChevronRight, Sun, Moon } from 'lucide-react'
import StatStrip from '../dashboard/StatStrip'
import PageHero from './PageHero'
import { getFirstName, getGreeting, useNow } from './TopBar'

/**
 * Dashboard page frame (rendered inside AppShell, which provides the sidebar):
 * greeting hero, optional KPI strip and quick-action cards, then page content.
 */
const DashboardLayout = ({
  title,
  subtitle,
  children,
  stats = [],
  quickActions = [],
  customActions = [],
  showAddUser = false,
  onAddUser,
}) => {
  const { user } = useSelector((state) => state.auth)
  const now = useNow()

  useEffect(() => {
    if (title) document.title = `${title} · Qassim Chamber`
  }, [title])

  const evening = now.getHours() >= 17
  const GreetingIcon = evening ? Moon : Sun

  const actions =
    (showAddUser && onAddUser) || customActions.length > 0 ? (
      <>
        {showAddUser && onAddUser && (
          <button
            type="button"
            onClick={onAddUser}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-navy-700"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        )}
        {customActions.map((action, index) => (
          <div key={index}>{action}</div>
        ))}
      </>
    ) : null

  return (
    <div>
      <PageHero
        title={
          <>
            <span className="font-normal">{getGreeting(now.getHours())},</span>
            <br />
            <span className="inline-flex items-center gap-3 font-semibold">
              {getFirstName(user)}
              <GreetingIcon className={`h-6 w-6 ${evening ? 'text-indigo-400' : 'text-amber-400'}`} />
            </span>
          </>
        }
        description={subtitle || "Here's what's happening with your team today."}
        actions={actions}
      />

      <main className="space-y-6 px-4 py-6 sm:px-6 xl:px-8">
        {stats.length > 0 && <StatStrip stats={stats} />}

        {quickActions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,64,0.04)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    {Icon && (
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-navy-50 text-indigo-700">
                        <Icon className="h-5 w-5" strokeWidth={1.7} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-[15px] font-semibold text-navy-800">{action.name}</h3>
                      {action.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-500">{action.description}</p>}
                    </div>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
                    {action.buttonText || `Go to ${action.name}`}
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
