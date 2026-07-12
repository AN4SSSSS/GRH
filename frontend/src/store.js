import { reactive } from 'vue'

const store = reactive({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  demandes: [],
})

function setSession(token, user) {
  store.token = token
  store.user = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

function clearSession() {
  store.token = null
  store.user = null
  store.demandes = []
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export { store, setSession, clearSession }
