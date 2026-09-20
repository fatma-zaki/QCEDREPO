import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export const CardLink = ({ to, children }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
  >
    {children}
    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
  </Link>
)

const DashboardCard = ({ title, titleExtra, action, children, className = '', bodyClassName = 'px-6 pb-6' }) => (
  <section
    className={`rounded-2xl border border-navy-100 bg-white shadow-[0_1px_2px_rgba(16,24,64,0.04)] ${className}`}
  >
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 px-6 pb-4 pt-5">
        <h2 className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-base font-semibold text-navy-800">
          {title}
          {titleExtra}
        </h2>
        {action}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
)

export default DashboardCard
