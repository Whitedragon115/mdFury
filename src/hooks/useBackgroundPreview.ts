'use client'

import { useState, useCallback, useEffect } from 'react'

interface BackgroundPreviewState {
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  backgroundOpacity?: number
}

let globalPreviewState: BackgroundPreviewState | null = null
let globalListeners: Set<(state: BackgroundPreviewState | null) => void> = new Set()

export function useBackgroundPreview() {
  const [previewState, setPreviewState] = useState<BackgroundPreviewState | null>(globalPreviewState)

  // Update global state and notify all listeners
  const setGlobalPreview = useCallback((state: BackgroundPreviewState | null) => {
    globalPreviewState = state
    globalListeners.forEach(listener => listener(state))
  }, [])

  // Clear preview function
  const clearPreview = useCallback(() => {
    globalPreviewState = null
    globalListeners.forEach(listener => listener(null))
  }, [])

  // Subscribe to changes on mount
  useEffect(() => {
    globalListeners.add(setPreviewState)
    return () => {
      globalListeners.delete(setPreviewState)
    }
  }, [])

  return {
    previewState,
    setPreview: setGlobalPreview,
    clearPreview,
    isPreviewActive: !!globalPreviewState
  }
}
