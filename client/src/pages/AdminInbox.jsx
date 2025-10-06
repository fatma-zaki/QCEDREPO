import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const KEY = 'inbox:lastSeen:admin'

const AdminInbox = () => {
  const { token } = useSelector((s) => s.auth)
  const employees = useSelector((s) => s.employees.employees || [])
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [recipientType, setRecipientType] = useState('role') // 'role' | 'employee'
  const [recipientRole, setRecipientRole] = useState('admin')
  const [recipientEmployee, setRecipientEmployee] = useState('')

  const recomputeUnread = (list) => {
    const lastSeen = parseInt(localStorage.getItem(KEY) || '0', 10)
    const count = list.filter(m => new Date(m.createdAt).getTime() > lastSeen).length
    setUnread(count)
  }

  const fetchMessages = async ({ initial = false } = {}) => {
    setLoading(true)
    try {
      const before = !initial && messages.length > 0 ? messages[0]?.createdAt : undefined
      const params = new URLSearchParams({ toRole: 'admin', limit: '20' })
      if (before) params.set('before', String(new Date(before).toISOString()))
      const res = await axios.get(`/api/messages?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = res.data?.data || []
      const more = !!res.data?.hasMore
      if (initial) {
        setMessages(data.reverse())
      } else {
        setMessages(prev => [...data.reverse(), ...prev])
      }
      setHasMore(more)
      if (typeof res.data?.unreadCount === 'number') setUnread(res.data.unreadCount)
      else recomputeUnread(initial ? data : [...data, ...messages])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages({ initial: true })
  }, [token])

  useEffect(() => {
    let socket
    ;(async () => {
      const { io } = await import('socket.io-client')
      socket = io('/', { auth: { token } })
      socket.on('message:new', (msg) => {
        if (msg.toRole === 'admin') {
          setMessages((m) => [...m, msg])
          recomputeUnread([...messages, msg])
        }
      })
    })()
    return () => { socket && socket.disconnect() }
  }, [token, messages])

  useEffect(() => {
    const markSeen = async () => {
      localStorage.setItem(KEY, String(Date.now()))
      try { await axios.post('/api/messages/read', { channelRole: 'admin' }, { headers: { Authorization: `Bearer ${token}` } }) } catch {}
      recomputeUnread(messages)
    }
    window.addEventListener('focus', markSeen)
    markSeen()
    return () => window.removeEventListener('focus', markSeen)
  }, [messages, token])

  const loadOlder = () => fetchMessages({ initial: false })

  const send = async () => {
    if (!text.trim()) return
    const toRole = recipientType === 'role' ? recipientRole : 'employee'
    const participants = recipientType === 'employee' && recipientEmployee ? [recipientEmployee] : []
    const pending = { _id: `tmp-${Date.now()}`, from: { name: 'Admin' }, text: text.trim(), toRole, createdAt: new Date().toISOString(), _pending: true }
    setMessages((m) => [...m, pending])
    const body = { toRole, text: pending.text, ...(participants.length ? { participants } : {}) }
    setText('')
    try {
      const res = await axios.post('/api/messages', body, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      const saved = res.data?.data
      if (saved) {
        setMessages((m) => m.map(msg => msg._id === pending._id ? saved : msg))
      }
    } catch (e) {
      setMessages((m) => m.map(msg => msg._id === pending._id ? { ...pending, _error: true } : msg))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <a href="/admin" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </a>
        </div>
        <div>
          {unread > 0 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {unread} new
            </span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select className="input-field" value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
              <option value="role">Role</option>
              <option value="employee">Employee</option>
            </select>
            {recipientType === 'role' ? (
              <select className="input-field" value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)}>
                <option value="admin">Admins</option>
                <option value="manager">Managers</option>
                <option value="employee">Employees</option>
              </select>
            ) : (
              <select className="input-field" value={recipientEmployee} onChange={(e) => setRecipientEmployee(e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.extension})</option>
                ))}
              </select>
            )}
          </div>
          {hasMore && (
            <button onClick={loadOlder} disabled={loading} className="text-sm text-qassim-blue hover:text-qassim-blue-dark">
              {loading ? 'Loading…' : 'Load older'}
            </button>
          )}
        </div>
        {messages.map(m => (
          <div key={m._id} className="p-4">
            <div className="text-sm text-gray-500">From: {m.from?.name || m.from?.email || 'User'}</div>
            <div className="text-gray-900">{m.text}{m._error ? ' (failed)' : ''}</div>
          </div>
        ))}
        <div className="p-3 border-t flex items-center space-x-2">
          <input
            className="input-field flex-1"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          />
          <button className="btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default AdminInbox


