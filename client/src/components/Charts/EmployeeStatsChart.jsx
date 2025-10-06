import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const EmployeeStatsChart = ({ employees }) => {
  // Calculate monthly employee additions (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', newHires: 2, total: 15 },
    { month: 'Feb', newHires: 1, total: 16 },
    { month: 'Mar', newHires: 3, total: 19 },
    { month: 'Apr', newHires: 2, total: 21 },
    { month: 'May', newHires: 1, total: 22 },
    { month: 'Jun', newHires: 4, total: 26 },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="newHires" fill="#1e3a8a" name="New Hires" />
          <Bar dataKey="total" fill="#fbbf24" name="Total Employees" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EmployeeStatsChart
