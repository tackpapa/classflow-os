'use client'

import { useState, useEffect } from 'react'

export type Theme = 'color' | 'dark' | 'white'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('color')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('livescreen-theme') as Theme | null
    if (savedTheme && ['color', 'dark', 'white'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('livescreen-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
