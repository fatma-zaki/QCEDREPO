import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const DepartmentChart = ({ departments, employees }) => {
  // Calculate department data
  const departmentData = departments.map(dept => {
    const employeeCount = employees.filter(emp => emp.department?._id === dept._id).length
    return {
      name: dept.name,
      value: employeeCount,
      percentage: ((employeeCount / employees.length) * 100).toFixed(1)
    }
  })

  const COLORS = ['#1e3a8a', '#fbbf24', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Distribution by Department</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={departmentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, 'Employees']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DepartmentChart
