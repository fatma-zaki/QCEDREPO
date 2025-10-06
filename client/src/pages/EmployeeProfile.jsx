import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const EmployeeProfile = () => {
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [form, setForm] = useState({
    name: user?.username || user?.name || '',
    email: user?.email || '',
    phone: '',
    position: '',
    address: '',
    idFrontUrl: '',
    idBackUrl: ''
  })
  const [status, setStatus] = useState({ loading: false, msg: null, err: null })
  const [docStatus, setDocStatus] = useState(user?.documentsStatus || 'pending')

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <button
          onClick={() => navigate('/employee/dashboard')}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input className="input-field" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input className="input-field" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Phone</label>
          <input className="input-field" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">ID Front Image URL</label>
            <input className="input-field" value={form.idFrontUrl} onChange={(e)=>setForm({...form,idFrontUrl:e.target.value})} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">ID Back Image URL</label>
            <input className="input-field" value={form.idBackUrl} onChange={(e)=>setForm({...form,idBackUrl:e.target.value})} placeholder="https://..." />
          </div>
        </div>
        <div className="text-sm text-gray-600">Documents status: <span className="font-medium capitalize">{docStatus}</span></div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Position</label>
          <input className="input-field" value={form.position} onChange={(e)=>setForm({...form,position:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Address</label>
          <input className="input-field" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} />
        </div>
        {status.err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-2">{status.err}</div>}
        {status.msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded p-2">{status.msg}</div>}
        <div className="flex items-center justify-between">
          <a href="/change-password" className="btn-secondary">Change Password</a>
          <button
            className="btn-primary"
            disabled={status.loading}
            onClick={async ()=>{
              try {
                setStatus({ loading: true, err: null, msg: null })
                const res = await axios.put('/api/employees/me', form, { headers: { Authorization: `Bearer ${token}` } })
                setStatus({ loading: false, err: null, msg: res.data.message || 'Saved' })
              } catch (e) {
                setStatus({ loading: false, err: e.response?.data?.message || 'Failed to save', msg: null })
              }
            }}
          >
            {status.loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeProfile


