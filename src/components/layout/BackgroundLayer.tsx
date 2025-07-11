'use client'

import { useEffect, useState } from 'react'

interface BackgroundLayerProps {
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  backgroundOpacity?: number
}

export default function BackgroundLayer({
  backgroundImage,
  backgroundBlur = 0,
  backgroundBrightness = 100, // Default to 100% to not darken images unless explicitly set
  backgroundOpacity = 0.3 // Default opacity for overlay
}: BackgroundLayerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | undefined>(backgroundImage)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    console.log('BackgroundLayer props:', { backgroundImage, backgroundBlur, backgroundBrightness, backgroundOpacity })
    
    if (backgroundImage) {
      // Test if image can be loaded
      const img = new Image()
      img.onload = () => {
        console.log('Background image loaded successfully:', backgroundImage)
        setImageLoaded(true)
        setCurrentImage(backgroundImage)
        setIsVisible(true)
      }
      img.onerror = () => {
        console.error('Failed to load background image:', backgroundImage)
        setImageLoaded(false)
        setIsVisible(false)
      }
      img.src = backgroundImage
    } else {
      console.log('No background image provided')
      setIsVisible(false)
      setImageLoaded(false)
      // Delay removing the image to allow fade out animation
      const timer = setTimeout(() => setCurrentImage(undefined), 500)
      return () => clearTimeout(timer)
    }
  }, [backgroundImage])

  // Only show background layer if image is loaded and valid
  if (!currentImage || !imageLoaded) return null

  console.log('Rendering background with:', { currentImage, isVisible, backgroundBrightness, backgroundBlur, backgroundOpacity })

  return (
    <>
      {/* Container to clip blur overflow and prevent edge glow */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        {/* Enlarged background with blur - extends beyond viewport to hide blur edges 
            This prevents the CSS blur "growing edge" effect by making the blurred element
            larger than the viewport and clipping the overflow with the parent container */}
        <div
          className={`absolute transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            // Extend beyond viewport by blur amount to hide edge glow
            top: `-${backgroundBlur * 2}px`,
            left: `-${backgroundBlur * 2}px`,
            right: `-${backgroundBlur * 2}px`,
            bottom: `-${backgroundBlur * 2}px`,
            backgroundImage: `url(${currentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness}%)`,
          }}
        />
      </div>
      
      {/* Overlay for better content readability - only show if image is visible */}
      {isVisible && (
        <div 
          className="fixed inset-0 -z-10 transition-all duration-500" 
          style={{
            backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`
          }}
        />
      )}
    </>
  )
}
