import { io } from 'socket.io-client'

let socketInstance = null

export function getSocket(token) {
  if (socketInstance) return socketInstance
  socketInstance = io('/', { auth: { token } })
  return socketInstance
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}


