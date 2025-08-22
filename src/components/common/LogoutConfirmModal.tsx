'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LogOut, X } from 'lucide-react'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
}

export function LogoutConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Logout Required",
  description = "To apply these changes, you need to logout and login again. Your changes have been saved to the database."
}: LogoutConfirmModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await onConfirm()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <DialogDescription className="text-sm text-gray-600 mb-6">
            {description}
          </DialogDescription>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoggingOut}
              className="px-4 py-2"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
