export const getJoinDate = (employee) => {
  const raw = employee.hireDate || employee.createdAt
  const date = raw ? new Date(raw) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

export const startOfMonth = (date, offset = 0) => new Date(date.getFullYear(), date.getMonth() + offset, 1)

// Number of items whose date falls before `cutoff`
export const countBefore = (items, getDate, cutoff) =>
  items.filter((item) => {
    const d = getDate(item)
    return d && d < cutoff
  }).length

// Percentage change, rounded; null when there is no baseline to compare against
export const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? null : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Evaluates `valueAt(cutoff)` at the end of each of the last `months` months
 * (the current month's cutoff is "now"), oldest first.
 */
export const monthlySeries = (months, valueAt, now = new Date()) =>
  Array.from({ length: months }, (_, i) => {
    const cutoff = i === months - 1 ? now : startOfMonth(now, i - (months - 2))
    return valueAt(cutoff)
  })

// Month-over-month change of a series' last two points
export const seriesChange = (series) =>
  series.length < 2 ? null : percentChange(series[series.length - 1], series[series.length - 2])

export const getCreatedDate = (item) => {
  const date = item?.createdAt ? new Date(item.createdAt) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\n')

export const getInitials =(first = '', last = '') =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || '?'
