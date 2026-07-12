import { reactive } from 'vue'

const theme = reactive({
  mode: localStorage.getItem('theme') || 'light',
})

function appliquerTheme() {
  document.documentElement.setAttribute('data-theme', theme.mode)
}

function toggleTheme() {
  theme.mode = theme.mode === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.mode)
  appliquerTheme()
}

appliquerTheme()

export { theme, toggleTheme }
