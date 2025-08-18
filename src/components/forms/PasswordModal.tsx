'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (_password: string) => void
  currentPassword: string
  hasPassword: boolean
}

export default function PasswordModal({
  isOpen,
  onClose,
  onSave,
  currentPassword,
  hasPassword
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPassword(hasPassword && currentPassword !== '••••••••' ? currentPassword : '')
      setShowPassword(false)
    }
  }, [isOpen, currentPassword, hasPassword])

  const handleSave = () => {
    onSave(password)
    onClose()
  }

  const handleRemove = () => {
    onSave('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Protection
          </DialogTitle>
          <DialogDescription>
            {hasPassword 
              ? 'Update or remove the password for this document.'
              : 'Set a password to protect this document. Anyone with the password will be able to view it.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex items-center gap-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? 'Enter new password...' : 'Enter password...'}
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-10 w-10 p-0"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {password && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Password-protected documents are automatically set to public. 
                Anyone with the password can view the document.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center w-full mt-6">
          <div className="flex">
            {hasPassword && (
              <Button
                variant="outline"
                onClick={handleRemove}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!password.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {hasPassword ? 'Update' : 'Set'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
