import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const ManagerTeam = () => {
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const [loading, setLoading] = useState(false)
  const [team, setTeam] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/employees/team', { headers: { Authorization: `Bearer ${token}` } })
        setTeam(res.data.data || [])
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load team')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const filtered = team.filter((t) => {
    const hay = `${t.firstName || ''} ${t.lastName || ''} ${t.username || ''} ${t.email || ''} ${t.extension || ''} ${t.position || ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900">My Team</h1>
        </div>
        <div className="relative w-72">
          <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search team..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">{err}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">{filtered.length} team members</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No team members found</td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {(emp.firstName?.[0] || emp.username?.[0] || 'E').toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-gray-500">{emp.department?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.position || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.extension || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" /> {emp.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" /> {emp.phone || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManagerTeam
