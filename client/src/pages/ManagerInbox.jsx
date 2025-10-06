import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const KEY = 'inbox:lastSeen:manager'

const ManagerInbox = () => {
  const { token } = useSelector((s) => s.auth)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)

  const recomputeUnread = (list) => {
    const lastSeen = parseInt(localStorage.getItem(KEY) || '0', 10)
    const count = list.filter(m => new Date(m.createdAt).getTime() > lastSeen).length
    setUnread(count)
  }

  const fetchMessages = async ({ initial = false } = {}) => {
    setLoading(true)
    try {
      const before = !initial && messages.length > 0 ? messages[0]?.createdAt : undefined
      const params = new URLSearchParams({ toRole: 'manager', limit: '20' })
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
        if (msg.toRole === 'manager') {
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
      try { await axios.post('/api/messages/read', { channelRole: 'manager' }, { headers: { Authorization: `Bearer ${token}` } }) } catch {}
      recomputeUnread(messages)
    }
    window.addEventListener('focus', markSeen)
    markSeen()
    return () => window.removeEventListener('focus', markSeen)
  }, [messages, token])

  const loadOlder = () => fetchMessages({ initial: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <a href="/manager" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
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
        <div className="p-3 border-b">
          {hasMore && (
            <button onClick={loadOlder} disabled={loading} className="text-sm text-qassim-blue hover:text-qassim-blue-dark">
              {loading ? 'Loading…' : 'Load older'}
            </button>
          )}
        </div>
        {messages.map(m => (
          <div key={m._id} className="p-4">
            <div className="text-sm text-gray-500">From: {m.from?.name || m.from?.email}</div>
            <div className="text-gray-900">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManagerInbox


