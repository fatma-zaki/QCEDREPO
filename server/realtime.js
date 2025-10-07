const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const Employee = require('./models/Employee')
const Message = require('./models/Message')

let ioInstance

function initRealtime(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  })
  ioInstance = io

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')
      if (!token) return next(new Error('No token'))
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await Employee.findById(decoded.userId).select('firstName lastName email role')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      socket.join(`role:${user.role}`)
      socket.join(`user:${user._id}`)
      next()
    } catch (e) {
      next(e)
    }
  })

  io.on('connection', (socket) => {
    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`)
      }
    })
    socket.on('message:send', async (payload, cb) => {
      try {
        const toRole = payload?.toRole || 'admin'
        const text = String(payload?.text || '').trim()
        if (!text) return cb && cb({ ok: false, error: 'Empty message' })
        const msg = await Message.create({ from: socket.user._id, toRole, text })
        const full = await Message.findById(msg._id).populate('from', 'firstName lastName email role')
        io.to(`role:${toRole}`).emit('message:new', full)
        io.to(`user:${socket.user._id}`).emit('message:new', full)
        if (full.conversationId) {
          io.to(`conversation:${full.conversationId}`).emit('message:new', full)
        }
        cb && cb({ ok: true, data: full })
      } catch (e) {
        cb && cb({ ok: false, error: 'Failed to send' })
      }
    })
  })

  return io
}

function getIo() {
  return ioInstance
}

module.exports = { initRealtime, getIo }


