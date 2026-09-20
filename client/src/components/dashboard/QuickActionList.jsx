import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const ActionItem = ({ action, className, children }) => {
  if (action.href) {
    return (
      <Link to={action.href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {children}
    </button>
  )
}

/**
 * Light quick-action list. Each action: { name, icon, href } or { name, icon, onClick, disabled }.
 * variant "card" = vertical list in a card (default), "inline" = a horizontal row of icon buttons.
 */
const QuickActionList = ({ actions = [], title = 'Quick Actions', variant = 'card', dense = false, className = '' }) => {
  if (variant === 'inline') {
    return (
      <div className={className}>
        <h2 className="mb-2 text-sm font-semibold text-navy-800">{title}</h2>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <ActionItem
                key={action.name}
                action={action}
                className="group inline-flex items-center gap-2.5 rounded-xl py-1.5 pl-1 pr-3 text-[13px] text-navy-800 transition-colors hover:bg-white disabled:opacity-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-800 shadow-sm ring-1 ring-navy-100 transition-colors group-hover:text-indigo-600">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                {action.name}
              </ActionItem>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className={`surface relative overflow-hidden bg-gradient-to-br from-white to-navy-50/70 px-5 py-5 ${className}`}>
      <h2 className={`font-serif text-[17px] text-navy-800 ${dense ? 'mb-1.5' : 'mb-3'}`}>{title}</h2>
      <ul className="space-y-0.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.name}>
              <ActionItem
                action={action}
                className={`group flex w-full items-center gap-3 rounded-xl px-2 text-left text-[13px] text-navy-800 transition-colors hover:bg-white disabled:opacity-50 ${dense ? 'py-1' : 'py-2'}`}
              >
                <span className={`flex flex-shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 ring-1 ring-navy-100 ${dense ? 'h-7 w-7' : 'h-8 w-8'}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="flex-1">{action.name}</span>
                <ChevronRight className="h-4 w-4 text-navy-500/60 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-800" />
              </ActionItem>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default QuickActionList
