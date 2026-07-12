import { io } from 'socket.io-client'
import { store } from './store.js'

const socket = io('http://localhost:5001', {
  autoConnect: false,
  auth: { token: store.token },
})

socket.on('notification', (notification) => {
  store.notifications.unshift(notification)
})

function connecterSocket() {
  if (socket.connected || !store.token) return
  socket.auth = { token: store.token }
  socket.connect()
}

function deconnecterSocket() {
  socket.disconnect()
}

export { connecterSocket, deconnecterSocket }
