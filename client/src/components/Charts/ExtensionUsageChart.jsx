import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ExtensionUsageChart = ({ employees }) => {
  // Calculate extension usage statistics
  const extensions = employees
    .filter(emp => emp.extension)
    .map(emp => parseInt(emp.extension))
    .sort((a, b) => a - b)

  const extensionRanges = [
    { range: '1000-1999', count: extensions.filter(ext => ext >= 1000 && ext < 2000).length },
    { range: '2000-2999', count: extensions.filter(ext => ext >= 2000 && ext < 3000).length },
    { range: '3000-3999', count: extensions.filter(ext => ext >= 3000 && ext < 4000).length },
    { range: '4000-4999', count: extensions.filter(ext => ext >= 4000 && ext < 5000).length },
    { range: '5000+', count: extensions.filter(ext => ext >= 5000).length },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Extension Usage Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={extensionRanges}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ExtensionUsageChart
