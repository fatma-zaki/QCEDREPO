import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const KEY_ADMIN = 'chat:lastSeen:admin'
const KEY_MANAGER = 'chat:lastSeen:manager'

const SupportChat = () => {
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [toRole, setToRole] = useState('admin')
  const [unread, setUnread] = useState({ admin: 0, manager: 0 })
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const recomputeUnread = (role, list) => {
    const key = role === 'admin' ? KEY_ADMIN : KEY_MANAGER
    const lastSeen = parseInt(localStorage.getItem(key) || '0', 10)
    const count = list.filter(m => new Date(m.createdAt).getTime() > lastSeen).length
    setUnread(prev => ({ ...prev, [role]: count }))
  }

  const fetchMessages = async ({ initial = false } = {}) => {
    try {
      setLoading(true)
      const before = !initial && messages.length > 0 ? messages[0]?.createdAt : undefined
      const params = new URLSearchParams({ toRole, limit: '20' })
      if (before) params.set('before', String(new Date(before).toISOString()))
      const res = await axios.get(`/api/messages?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = res.data?.data || []
      const more = !!res.data?.hasMore
      if (initial) {
        setMessages(data.reverse()) // oldest at top after reverse
      } else {
        setMessages(prev => [...data.reverse(), ...prev])
      }
      setHasMore(more)
      // Use server unreadCount if present for active role; keep local for other role
      if (typeof res.data?.unreadCount === 'number') {
        setUnread(prev => ({ ...prev, [toRole]: res.data.unreadCount }))
      } else {
        recomputeUnread(toRole, initial ? data : [...data, ...messages])
      }
    } catch (e) {
      if (initial) setMessages([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages({ initial: true })
  }, [token, toRole])

  useEffect(() => {
    let socket
    const start = () => import('socket.io-client').then(({ io }) => {
      socket = io('/', { auth: { token } })
      socket.on('message:new', (msg) => {
        if (msg.toRole === toRole) {
          setMessages((m) => [...m, msg])
          recomputeUnread(toRole, [...messages, msg])
        } else {
          recomputeUnread(msg.toRole, [msg])
        }
      })
    }).catch(() => {})
    start()
    return () => { socket && socket.disconnect() }
  }, [token, toRole, messages])

  // Mark current channel as read on focus/role change
  useEffect(() => {
    const markSeen = async () => {
      const now = String(Date.now())
      if (toRole === 'admin') localStorage.setItem(KEY_ADMIN, now)
      if (toRole === 'manager') localStorage.setItem(KEY_MANAGER, now)
      try {
        await axios.post('/api/messages/read', { channelRole: toRole }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      } catch {}
      recomputeUnread(toRole, messages)
    }
    window.addEventListener('focus', markSeen)
    markSeen()
    return () => window.removeEventListener('focus', markSeen)
  }, [messages, toRole, token])

  const send = async () => {
    if (!text.trim()) return
    const pending = { _id: `tmp-${Date.now()}`, from: { name: user?.username || user?.name || 'me' }, text: text.trim(), toRole, createdAt: new Date().toISOString(), _pending: true }
    setMessages((m) => [...m, pending])
    const body = { toRole, text: pending.text }
    setText('')
    try {
      const res = await axios.post('/api/messages', body, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      const saved = res.data?.data
      if (saved) {
        setMessages((m) => m.map(msg => msg._id === pending._id ? saved : msg))
      }
    } catch (e) {
      // replace pending with error state
      setMessages((m) => m.map(msg => msg._id === pending._id ? { ...pending, _error: true } : msg))
    }
  }

  const loadOlder = () => fetchMessages({ initial: false })

  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Support Chat</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={toRole}
              onChange={(e) => setToRole(e.target.value)}
              className="input-field pr-10"
            >
              <option value="admin">Admin {unread.admin > 0 ? `(${unread.admin})` : ''}</option>
              <option value="manager">Managers {unread.manager > 0 ? `(${unread.manager})` : ''}</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col h-full">
        <div className="flex-none p-2 border-b">
          {hasMore && (
            <button onClick={loadOlder} disabled={loading} className="text-sm text-qassim-blue hover:text-qassim-blue-dark">
              {loading ? 'Loading…' : 'Load older messages'}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(m => {
            const fromName = m.from?.name || m.from?.username || m.from || 'user'
            const isMine = fromName === (user?.username || user?.name)
            return (
              <div key={m._id || m.id} className={`max-w-[80%] ${isMine ? 'ml-auto text-right' : ''}`}>
                <div className={`inline-block px-3 py-2 rounded-lg ${isMine ? 'bg-qassim-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="text-xs opacity-80 mb-1">{fromName} → {m.toRole}</div>
                  <div className="text-sm">{m.text}{m._error ? ' (failed)' : ''}</div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="border-t p-3 flex items-center space-x-2">
          <input className="input-field flex-1" placeholder="Type your message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
          <button className="btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default SupportChat


