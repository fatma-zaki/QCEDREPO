import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEmployees } from '../store/slices/employeeSlice'
import { getSocket } from '../utils/socket'
import { Search, Send, Paperclip, Smile, Bell, MoreVertical } from 'lucide-react'

const avatarFor = (seed) => {
  const letter = String(seed || 'U').slice(0,1).toUpperCase()
  return (
    <div className="h-9 w-9 rounded-full bg-qassim-blue/10 text-qassim-blue flex items-center justify-center text-sm font-semibold">
      {letter}
    </div>
  )
}

const displayNameFor = (emp) => {
  return (emp?.name || (emp?.firstName && emp?.lastName ? `${emp.firstName} ${emp.lastName}` : undefined) || emp?.username || emp?.email || 'Unknown')
}

const resolveNames = (participants = [], employees = [], currentUserId) => {
  const others = participants.map(String).filter(id => String(id) !== String(currentUserId))
  const map = new Map(employees.map(e => [String(e._id), displayNameFor(e)]))
  const names = others.map(id => map.get(String(id)) || 'Unknown')
  return names
}

const ConversationsList = ({ conversations, activeId, onSelect, loading, onSearch, search, employees, onCompose, currentUserId }) => {
  const [composeId, setComposeId] = useState('')
  return (
    <div className="w-full md:w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <div className="space-y-2">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              className="bg-transparent flex-1 ml-2 outline-none text-sm"
              placeholder="Search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="input-field flex-1" value={composeId} onChange={(e) => setComposeId(e.target.value)}>
              <option value="">New message…</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{displayNameFor(emp)}{emp.extension ? ` (${emp.extension})` : ''}</option>
              ))}
            </select>
            <button className="btn-primary" disabled={!composeId} onClick={() => { if (composeId) { onCompose(composeId); setComposeId('') } }}>Start</button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">No conversations yet</div>
      ) : (
        <ul className="divide-y overflow-y-auto">
          {conversations.map((c) => {
            const names = resolveNames(c.participants, employees, currentUserId)
            const title = c.title || (names.length > 0 ? names.join(', ') : `${(c.participants || []).length} participants`)
            return (
            <li
              key={c._id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeId === c._id ? 'bg-gray-100' : ''}`}
              onClick={() => onSelect(c)}
            >
              <div className="flex items-center space-x-3">
                {avatarFor(title)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
                    {c.lastMessage && (
                      <div className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(c.lastMessage.createdAt).toLocaleTimeString()}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="text-xs text-gray-600 truncate max-w-[11rem]">{c.lastMessage ? c.lastMessage.text : '—'}</div>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-4 rounded-full bg-qassim-blue text-white">{c.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )})}
        </ul>
      )}
    </div>
  )
}

const ChatWindow = ({ active, messages, currentUserName, onLoadOlder, hasMore, loading }) => {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="h-16 bg-white border-b px-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{active?.title || 'Conversation'}</div>
          <div className="text-xs text-gray-500">{(active?.participants || []).length} participants</div>
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          <Bell className="h-4 w-4" />
          <MoreVertical className="h-4 w-4" />
        </div>
      </div>
      <div className="flex-none p-2 border-b bg-white">
        {hasMore && (
          <button onClick={onLoadOlder} disabled={loading} className="text-sm text-qassim-blue hover:text-qassim-blue-dark">
            {loading ? 'Loading…' : 'Load older messages'}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m) => {
          const fromName = displayNameFor(m.from) || 'user'
          const mine = fromName === currentUserName
          return (
            <div key={m._id || m.id} className={`max-w-[70%] ${mine ? 'ml-auto text-right' : ''}`}>
              <div className={`inline-block px-4 py-2 rounded-2xl shadow ${mine ? 'bg-qassim-blue text-white' : 'bg-white text-gray-800'}`}>
                <div className="text-xs opacity-80 mb-1">{fromName} • {new Date(m.createdAt).toLocaleTimeString()}</div>
                <div className="text-sm leading-relaxed">{m.text}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

const MessageInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('')
  const send = async () => {
    if (!text.trim() || disabled) return
    await onSend(text.trim())
    setText('')
  }
  return (
    <div className="h-16 bg-white border-t px-4 flex items-center space-x-2">
      <button className="p-2 text-gray-500 hover:text-gray-700"><Paperclip className="h-5 w-5" /></button>
      <button className="p-2 text-gray-500 hover:text-gray-700"><Smile className="h-5 w-5" /></button>
      <input
        className="input-field flex-1"
        placeholder="Write something…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send() }}
      />
      <button className="btn-primary inline-flex items-center" onClick={send} disabled={disabled}>
        <Send className="h-4 w-4 mr-1" />
        Send
      </button>
    </div>
  )
}

const Sidebar = ({ user }) => {
  return (
    <div className="hidden md:flex md:w-64 bg-gradient-to-b from-qassim-blue to-qassim-blue-dark text-white flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
          {String(user?.username || user?.name || 'U').slice(0,1)}
        </div>
        <div>
          <div className="text-sm font-semibold">{user?.username || user?.name}</div>
          <div className="text-xs text-white/80 capitalize">{user?.role}</div>
        </div>
      </div>
      <nav className="px-4 py-2 space-y-1 text-sm">
        <a href="/" className="block px-3 py-2 rounded hover:bg-white/10">Home</a>
        <a href="/chat" className="block px-3 py-2 rounded bg-white/20">Messages</a>
      </nav>
    </div>
  )
}

const ChatPage = () => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((s) => s.auth)
  const employees = useSelector((s) => s.employees.employees || [])
  const [conversations, setConversations] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')
  const [hasMore, setHasMore] = useState(false)

  const loadConversations = async () => {
    setLoadingConvs(true)
    try {
      const res = await axios.get(`/api/messages/user/${user?.id || user?._id}`, { headers: { Authorization: `Bearer ${token}` } })
      let data = res.data?.data || []
      if (search.trim()) {
        const s = search.toLowerCase()
        data = data.filter(c => (c.lastMessage?.text || '').toLowerCase().includes(s))
      }
      setConversations(data)
    } finally {
      setLoadingConvs(false)
    }
  }

  useEffect(() => { if (token && user) loadConversations() }, [token, user, search])
  useEffect(() => {
    // Ensure employees list present for name resolution
    if (employees.length === 0 && token) {
      try { dispatch(fetchEmployees()) } catch {}
    }
  }, [employees.length, token, dispatch])

  useEffect(() => {
    const socket = getSocket(token)
    if (active?._id) {
      socket.emit('joinConversation', active._id)
    }
    const onNew = (msg) => {
      if (!msg?.conversationId) return
      const convId = String(msg.conversationId)
      const mine = (msg.from?.name || msg.from?.username) === (user?.username || user?.name)
      if (active?._id && String(active._id) === convId) {
        setMessages((m) => [...m, msg])
        setConversations((list) => list.map(c => String(c._id) === convId ? { ...c, lastMessage: { _id: msg._id, text: msg.text, createdAt: msg.createdAt }, unreadCount: 0 } : c))
      } else {
        setConversations((list) => {
          const exists = list.some(c => String(c._id) === convId)
          if (!exists) {
            return [
              { _id: convId, participants: [], lastMessageAt: msg.createdAt, lastMessage: { _id: msg._id, text: msg.text, createdAt: msg.createdAt }, unreadCount: mine ? 0 : 1 },
              ...list
            ]
          }
          return list.map(c => {
            if (String(c._id) !== convId) return c
            const nextUnread = mine ? (c.unreadCount || 0) : ((c.unreadCount || 0) + 1)
            return { ...c, lastMessage: { _id: msg._id, text: msg.text, createdAt: msg.createdAt }, unreadCount: nextUnread }
          })
        })
      }
    }
    socket.on('message:new', onNew)
    return () => { socket.off('message:new', onNew) }
  }, [token, active, user])

  const openConversation = async (conv) => {
    setActive(conv)
    setLoadingMsgs(true)
    try {
      const res = await axios.get(`/api/messages/${conv._id}`, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(res.data?.data || [])
      setHasMore(!!res.data?.hasMore)
      try {
        await axios.post(`/api/messages/${conv._id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
        setConversations((list) => list.map(c => String(c._id) === String(conv._id) ? { ...c, unreadCount: 0 } : c))
      } catch {}
    } finally {
      setLoadingMsgs(false)
    }
  }

  const loadOlder = async () => {
    if (!active?._id || messages.length === 0) return
    setLoadingMsgs(true)
    try {
      const before = messages[0].createdAt
      const res = await axios.get(`/api/messages/${active._id}?before=${encodeURIComponent(before)}&limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      const older = res.data?.data || []
      setHasMore(!!res.data?.hasMore)
      setMessages((m) => [...older, ...m])
    } finally {
      setLoadingMsgs(false)
    }
  }

  const sendMessage = async (text) => {
    if (!active?._id) return
    const mineName = user?.username || user?.name
    const pending = { _id: `tmp-${Date.now()}`, from: { name: mineName }, text, conversationId: active._id, createdAt: new Date().toISOString(), _pending: true }
    setMessages((m) => [...m, pending])
    try {
      const others = (active.participants || []).filter(p => (String(p) !== String(user?.id || user?._id)))
      const toRole = others.length > 0 ? 'employee' : 'admin'
      const res = await axios.post('/api/messages', { toRole, text, participants: others }, { headers: { Authorization: `Bearer ${token}` } })
      const saved = res.data?.data
      if (saved) {
        setMessages((m) => m.map(msg => msg._id === pending._id ? saved : msg))
        setConversations((list) => list.map(c => String(c._id) === String(active._id) ? { ...c, lastMessage: { _id: saved._id, text: saved.text, createdAt: saved.createdAt }, unreadCount: 0 } : c))
      }
    } catch (e) {
      setMessages((m) => m.map(msg => msg._id === pending._id ? { ...pending, _error: true } : msg))
    }
  }

  const composeDM = async (employeeId) => {
    try {
      // send an empty greeting or a system initial message; here we send a placeholder text
      const text = 'Hi'
      const res = await axios.post('/api/messages', { toRole: 'employee', text, participants: [employeeId] }, { headers: { Authorization: `Bearer ${token}` } })
      const saved = res.data?.data
      if (saved?.conversationId) {
        // Prepend new conversation entry and open it
        const conv = { _id: saved.conversationId, participants: [employeeId, user?.id || user?._id], lastMessageAt: saved.createdAt, lastMessage: { _id: saved._id, text: saved.text, createdAt: saved.createdAt }, unreadCount: 0 }
        setConversations((list) => [conv, ...list])
        await openConversation(conv)
      } else {
        // Fallback: reload conversations
        await loadConversations()
      }
    } catch {}
  }

  useEffect(() => {
    const onFocus = async () => {
      if (active?._id) {
        try {
          await axios.post(`/api/messages/${active._id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
          setConversations((list) => list.map(c => String(c._id) === String(active._id) ? { ...c, unreadCount: 0 } : c))
        } catch {}
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [active, token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex">
      <Sidebar user={user} />
      <div className="flex-1 flex">
        <ConversationsList
          conversations={conversations}
          activeId={active?._id}
          onSelect={openConversation}
          loading={loadingConvs}
          search={search}
          onSearch={setSearch}
          employees={employees}
          onCompose={composeDM}
          currentUserId={user?.id || user?._id}
        />
        <div className="flex-1 flex flex-col">
          <ChatWindow active={active} messages={messages} currentUserName={user?.username || user?.name} onLoadOlder={loadOlder} hasMore={hasMore} loading={loadingMsgs} />
          <MessageInput onSend={sendMessage} disabled={loadingMsgs || !active} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage


