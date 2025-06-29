'use client'

import { useEffect, useState } from 'react'

interface BackgroundLayerProps {
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
}

export default function BackgroundLayer({
  backgroundImage,
  backgroundBlur = 0,
  backgroundBrightness = 100
}: BackgroundLayerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | undefined>(backgroundImage)

  useEffect(() => {
    if (backgroundImage) {
      setCurrentImage(backgroundImage)
      setIsVisible(true)
    } else {
      setIsVisible(false)
      // Delay removing the image to allow fade out animation
      const timer = setTimeout(() => setCurrentImage(undefined), 500)
      return () => clearTimeout(timer)
    }
  }, [backgroundImage])

  if (!currentImage) return null

  return (
    <>
      {/* Background Image Layer */}
      <div
        className={`fixed inset-0 -z-20 transition-all duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness}%)`,
        }}
      />
      
      {/* Overlay for better content readability */}
      <div
        className={`fixed inset-0 -z-10 bg-black/20 dark:bg-black/40 transition-all duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  )
}
