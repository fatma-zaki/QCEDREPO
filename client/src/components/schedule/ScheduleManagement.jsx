import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Clock, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { ActionButton, QassimLoadingSpinner, EmptyState } from '../index'
import { useNotifications } from '../../hooks/useNotifications'
import axios from 'axios'

const ScheduleManagement = ({ departmentId, departmentName }) => {
  const dispatch = useDispatch()
  const { showSuccess, showError } = useNotifications()
  const { token } = useSelector((state) => state.auth)
  
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    monday: { start: '08:00', end: '17:00', breaks: [] },
    tuesday: { start: '08:00', end: '17:00', breaks: [] },
    wednesday: { start: '08:00', end: '17:00', breaks: [] },
    thursday: { start: '08:00', end: '17:00', breaks: [] },
    friday: { start: '08:00', end: '17:00', breaks: [] },
    saturday: { start: '08:00', end: '17:00', breaks: [] },
    sunday: { start: '08:00', end: '17:00', breaks: [] }
  })

  // Fetch existing schedule
  useEffect(() => {
    if (departmentId) {
      fetchSchedule()
    }
  }, [departmentId])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/schedules/department/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success && res.data.data) {
        setSchedule(res.data.data)
        setFormData(res.data.data.schedule || formData)
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
      // If no schedule exists, we'll create a new one
    } finally {
      setLoading(false)
    }
  }

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        department: departmentId,
        schedule: formData,
        isActive: true
      }

      let res
      if (schedule) {
        // Update existing schedule
        res = await axios.put(`/api/schedules/${schedule._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create new schedule
        res = await axios.post('/api/schedules', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      if (res.data.success) {
        setSchedule(res.data.data)
        setEditing(false)
        showSuccess('Schedule saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save schedule:', error)
      showError('Failed to save schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (schedule) {
      setFormData(schedule.schedule || formData)
    }
    setEditing(false)
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  if (loading && !schedule) {
    return <QassimLoadingSpinner size="lg" text="Loading schedule..." className="py-12" />
  }

  return (
    <div className="glass-card">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {departmentName} Schedule
            </h3>
            <p className="text-sm text-gray-500">
              Manage weekly working hours for your department
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!editing ? (
              <ActionButton
                type="primary"
                iconType="edit"
                onClick={() => setEditing(true)}
              >
                Edit Schedule
              </ActionButton>
            ) : (
              <div className="flex items-center space-x-2">
                <ActionButton
                  type="secondary"
                  iconType="delete"
                  onClick={handleCancel}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  type="primary"
                  iconType="add"
                  onClick={handleSave}
                  loading={loading}
                >
                  Save Schedule
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!schedule && !editing ? (
          <EmptyState
            type="files"
            title="No schedule found"
            description="Create a schedule for your department to manage working hours."
            actions={[
              <ActionButton
                key="create-schedule"
                type="primary"
                iconType="add"
                onClick={() => setEditing(true)}
              >
                Create Schedule
              </ActionButton>
            ]}
          />
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-900">
                    {day.label}
                  </div>
                  {editing ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={formData[day.key].start}
                          onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData[day.key].end}
                          onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formData[day.key].start} - {formData[day.key].end}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {(() => {
                    const start = new Date(`2000-01-01 ${formData[day.key].start}`)
                    const end = new Date(`2000-01-01 ${formData[day.key].end}`)
                    const diff = (end - start) / (1000 * 60 * 60)
                    return `${diff} hours`
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduleManagement
