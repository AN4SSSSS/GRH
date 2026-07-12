import axios from 'axios'
import { store } from './store.js'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

api.interceptors.request.use((config) => {
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

export default api
