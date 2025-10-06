import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const mockNotifs = [
  { id: 1, type: 'schedule', title: 'New schedule assigned', detail: 'Security Training on 2025-10-01 10:00' },
  { id: 2, type: 'change', title: 'Policy updated', detail: 'Remote work policy updated. Please review.' },
]

const EmployeeNotifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    setNotifications(mockNotifs)
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <button
          onClick={() => navigate('/employee/dashboard')}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="bg-white rounded-xl shadow p-4">
            <div className="font-medium text-gray-900">{n.title}</div>
            <div className="text-sm text-gray-500">{n.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployeeNotifications


