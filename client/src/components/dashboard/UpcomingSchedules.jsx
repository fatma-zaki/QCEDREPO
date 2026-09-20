import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import DashboardCard, { CardLink } from './DashboardCard'

const fmt = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/**
 * Current and upcoming weekly department schedules (from /api/schedules).
 */
const UpcomingSchedules = ({ limit = 3, viewAllHref = '/schedule' }) => {
  const { token } = useSelector((state) => state.auth)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const load = async () => {
      try {
        const res = await axios.get('/api/schedules?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = (res.data?.data || [])
          .map((s) => ({ ...s, start: new Date(s.weekStart), end: new Date(s.weekEnd) }))
          .filter((s) => s.end >= today)
          .sort((a, b) => a.start - b.start)
          .slice(0, limit)
        if (!cancelled) setItems(upcoming)
      } catch (error) {
        console.error('Failed to fetch schedules:', error)
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token, limit])

  return (
    <DashboardCard title="Upcoming Schedules" action={<CardLink to={viewAllHref}>View all</CardLink>} bodyClassName="px-6 pb-4">
      {loading ? (
        <div className="space-y-3 pb-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-navy-50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-navy-500">No upcoming schedules</p>
      ) : (
        <ul className="divide-y divide-navy-100">
          {items.map((s) => (
            <li key={s._id} className="flex items-center gap-4 py-3">
              <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-navy-50 text-indigo-700">
                <span className="text-lg font-medium leading-none">{s.start.getDate()}</span>
                <span className="mt-0.5 text-[10px]">{s.start.toLocaleDateString('en-US', { month: 'short' })}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-navy-800">
                  {s.department?.name || 'Department'} Schedule
                </p>
                <p className="mt-0.5 text-xs text-navy-500">
                  {fmt(s.start)} – {fmt(s.end)} · {s.isPublished ? 'Published' : 'Draft'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}

export default UpcomingSchedules
