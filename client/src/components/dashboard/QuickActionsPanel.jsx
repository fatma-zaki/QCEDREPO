import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'

/**
 * Dark navy action list. Each action: { name, icon, href } or { name, icon, onClick }.
 */
const QuickActionsPanel = ({ actions = [], title = 'Quick Actions' }) => (
  <section className="relative overflow-hidden rounded-2xl bg-navy-950 text-white shadow-[0_10px_30px_-12px_rgba(10,21,64,0.6)]">
    <img
      src="/background.webp"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover object-right opacity-40"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-950/85 to-navy-900/30" />

    <div className="relative px-6 py-6">
      <h2 className="mb-5 flex items-center gap-2 text-[17px] font-medium">
        <Sparkles className="h-4 w-4 text-navy-400" />
        {title}
      </h2>
      <ul className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          const content = (
            <>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </span>
              <span className="flex-1 text-left text-[13px] text-white/90">{action.name}</span>
              <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white/80" />
            </>
          )
          const cls =
            'group flex w-full items-center gap-4 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-white/5 focus-visible:ring-offset-navy-950'
          return (
            <li key={action.name}>
              {action.href ? (
                <Link to={action.href} className={cls}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={action.onClick} className={cls}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  </section>
)

export default QuickActionsPanel
