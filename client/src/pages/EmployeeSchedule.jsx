import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const mockItems = [
  { id: 1, title: 'Team Standup', date: '2025-09-25', time: '09:00', location: 'Room A' },
  { id: 2, title: '1:1 with Manager', date: '2025-09-26', time: '13:00', location: 'Room B' },
  { id: 3, title: 'Security Training', date: '2025-10-01', time: '10:00', location: 'Online' },
]

const EmployeeSchedule = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(mockItems)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Schedule</h1>
        <button
          onClick={() => navigate('/employee/dashboard')}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {items.map(ev => (
          <div key={ev.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{ev.title}</div>
              <div className="text-sm text-gray-500">{ev.date} · {ev.time} · {ev.location}</div>
            </div>
            <button className="btn-secondary">Add to Calendar</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployeeSchedule


