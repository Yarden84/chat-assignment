import { ref } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
const isDark = ref(false)

export function useTheme() {
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      theme.value = savedTheme
    } else if (prefersDark) {
      theme.value = 'dark'
    } else {
      theme.value = 'light'
    }
    
    isDark.value = theme.value === 'dark'
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    
    if (theme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    isDark.value = theme.value === 'dark'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    isDark.value = newTheme === 'dark'
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      theme.value = e.matches ? 'dark' : 'light'
      isDark.value = theme.value === 'dark'
      applyTheme()
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return {
    theme,
    isDark,
    initializeTheme,
    toggleTheme,
    setTheme
  }
}
