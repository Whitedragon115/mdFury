'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  Hash, 
  Tag, 
  Eye, 
  EyeOff, 
  Lock,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface BinControlsProps {
  title: string
  binId: string
  tags: string[]
  isPublic: boolean
  hasPassword: boolean
  password: string
  isLoading: boolean
  onTitleChange: (title: string) => void
  onBinIdChange: (binId: string) => void
  onTagsChange: (tags: string[]) => void
  onPublicChange: (isPublic: boolean) => void
  onPasswordChange: (password: string) => void
  onSave: () => void
  onGenerateId: () => void
}

export default function BinControls({
  title,
  binId,
  tags,
  isPublic,
  hasPassword,
  password,
  isLoading,
  onTitleChange,
  onBinIdChange,
  onTagsChange,
  onPublicChange,
  onPasswordChange,
  onSave,
  onGenerateId
}: BinControlsProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(hasPassword || !!password)

  // Update showPasswordField when hasPassword or password changes
  useEffect(() => {
    setShowPasswordField(hasPassword || !!password)
  }, [hasPassword, password])

  const handleTagsInput = (value: string) => {
    const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    onTagsChange(newTags)
  }

  const togglePasswordProtection = () => {
    const isPlaceholder = password === '••••••••'
    const actuallyHasPassword = hasPassword || (password && !isPlaceholder)
    
    if (actuallyHasPassword) {
      // Remove password protection
      onPasswordChange('')
      setShowPasswordField(false)
      setShowPassword(false)
    } else {
      // Add password protection
      if (isPlaceholder) {
        // Clear placeholder and show field for new password
        onPasswordChange('')
      }
      setShowPasswordField(true)
      setShowPassword(false)
    }
  }

  const currentlyHasPassword = hasPassword || (password && password !== '••••••••')

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg space-y-4">
      {/* Bin ID and Title Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="binId" className="text-sm font-medium whitespace-nowrap">
            <Hash className="w-4 h-4 inline mr-1" />
            ID:
          </Label>
          <div className="flex-1 flex gap-2">
            <Input
              id="binId"
              value={binId}
              onChange={(e) => onBinIdChange(e.target.value)}
              placeholder="Enter custom ID..."
              className="h-8 text-sm bg-white/90 dark:bg-slate-800"
              maxLength={20}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateId}
              className="h-8 px-2"
              title="Generate random ID"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="title" className="text-sm font-medium whitespace-nowrap">
            Title:
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('editor.placeholders.title')}
            className="h-8 text-sm flex-1 bg-white/90 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Tags and Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="flex items-center gap-2">
          <Label htmlFor="tags" className="text-sm font-medium whitespace-nowrap">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags:
          </Label>
          <Input
            id="tags"
            value={tags.join(', ')}
            onChange={(e) => handleTagsInput(e.target.value)}
            placeholder={t('editor.placeholders.tags')}
            className="h-8 text-sm flex-1 bg-white/90 dark:bg-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Public/Private Toggle */}
          <Button
            variant={isPublic ? "default" : "outline"}
            size="sm"
            onClick={() => onPublicChange(!isPublic)}
            className="h-8 px-3"
          >
            {isPublic ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Private
              </>
            )}
          </Button>

          {/* Password Protection */}
          <div className="flex items-center gap-2">
            <Button
              variant={currentlyHasPassword ? "default" : "outline"}
              size="sm"
              onClick={togglePasswordProtection}
              className="h-8 px-3"
            >
              <Lock className="w-3 h-3 mr-1" />
              {currentlyHasPassword ? 'Protected' : 'No Password'}
            </Button>

            {showPasswordField && (
              <div className="flex items-center gap-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder={password === '••••••••' ? 'Change password...' : 'Enter password...'}
                  className="h-8 text-sm w-32 bg-white dark:bg-slate-800"
                  onFocus={() => {
                    // Clear placeholder when user starts typing
                    if (password === '••••••••') {
                      onPasswordChange('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 p-0"
                  disabled={password === '••••••••'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={isLoading || !title.trim()}
            className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
