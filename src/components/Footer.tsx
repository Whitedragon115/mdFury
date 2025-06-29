'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Github, MessageCircle, Coffee, Clock } from 'lucide-react'

export function Footer() {
  const [uptime, setUptime] = useState('')

  useEffect(() => {
    // Calculate uptime from launch date
    const startDate = new Date('2025-06-29T18:00:00')
    
    const updateUptime = () => {
      const now = new Date()
      const diff = now.getTime() - startDate.getTime()
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setUptime(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setUptime(`${hours}h ${minutes}m`)
      } else {
        setUptime(`${minutes}m`)
      }
    }

    // Update immediately and then every minute
    updateUptime()
    const interval = setInterval(updateUptime, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Links Row */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <a
                href="https://github.com/Whitedragon115/mdFury"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <a
                href="https://buymeacoffee.com/darklightfury"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                Support
              </a>
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MessageCircle className="w-4 h-4" />
              Discord: darkingfury
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              Uptime: {uptime}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}