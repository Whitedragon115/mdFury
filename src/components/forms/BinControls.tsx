'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasswordModal from './PasswordModal'
import { 
  Save, 
  Hash, 
  Tag, 
  Eye, 
  EyeOff, 
  Lock,
  Loader2,
  RefreshCw,
  Shield
} from 'lucide-react'

interface BinControlsProps {
  title: string
  binId?: string // 變成可選
  tags: string[]
  isPublic: boolean
  hasPassword: boolean
  password: string
  isLoading: boolean
  isAnonymous?: boolean // 新增：指示是否為匿名用戶
  onTitleChange: (_title: string) => void
  onBinIdChange?: (_binId: string) => void // 變成可選
  onTagsChange: (_tags: string[]) => void
  onPublicChange: (_isPublic: boolean) => void
  onPasswordChange: (_password: string) => void
  onSave: () => void
  onGenerateId?: () => void // 變成可選
  disabledBinId?: boolean // 新增
}

export default function BinControls({
  title,
  binId,
  tags,
  isPublic,
  hasPassword,
  password,
  isLoading,
  isAnonymous = false,
  onTitleChange,
  onBinIdChange,
  onTagsChange,
  onPublicChange,
  onPasswordChange,
  onSave,
  onGenerateId,
  disabledBinId
}: BinControlsProps) {
  const { t } = useTranslation()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleTagsInput = (value: string) => {
    const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    onTagsChange(newTags)
  }

  const handlePasswordSave = (newPassword: string) => {
    onPasswordChange(newPassword)
    // If setting a password, make document public
    if (newPassword && !isPublic) {
      onPublicChange(true)
    }
  }

  const handlePublicChange = (newIsPublic: boolean) => {
    // If trying to make document private while it has password protection, show warning and prevent it
    if (!newIsPublic && currentlyHasPassword) {
      toast.error('Cannot make password-protected documents private', {
        duration: 3000,
      })
      return
    }
    onPublicChange(newIsPublic)
  }

  const currentlyHasPassword = hasPassword || (password && password !== '••••••••')

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg space-y-4">
      {/* Bin ID and Title Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {binId !== undefined && onBinIdChange && onGenerateId && (
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
                className={`h-8 text-sm bg-white/90 dark:bg-slate-800 ${disabledBinId ? 'opacity-70 cursor-not-allowed bg-slate-200 dark:bg-slate-700' : ''}`}
                maxLength={20}
                disabled={!!disabledBinId}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateId}
                className="h-8 px-2"
                title="Generate random ID"
                disabled={!!disabledBinId}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
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
        </div>        <div className="flex items-center justify-end gap-3">
          {/* Public/Private Toggle - Hide for anonymous users */}
          {!isAnonymous && (
            <div className="relative">
              <Button
                variant={isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => handlePublicChange(!isPublic)}
                className={`h-8 px-3 ${!isPublic && currentlyHasPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isPublic && currentlyHasPassword ? true : false}
                title={currentlyHasPassword && !isPublic ? 'Cannot make password-protected document private' : ''}
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
              {/* 移除警告文字 */}
            </div>
          )}

          {/* Show anonymous note for anonymous users */}
          {isAnonymous && (
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
              <Eye className="w-3 h-3 inline mr-1" />
              Anonymous documents are always public
            </div>
          )}

          {/* Password Protection */}
          <div className="flex items-center gap-2">
            <Button
              variant={currentlyHasPassword ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPasswordModal(true)}
              className={`h-8 px-3 ${!isPublic ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isPublic}
              title={!isPublic ? 'Cannot set password on private documents' : currentlyHasPassword ? 'Password is set' : 'Set password'}
            >
              {currentlyHasPassword ? (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Protected
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Set Password
                </>
              )}
            </Button>
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

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordSave}
        currentPassword={password}
        hasPassword={!!currentlyHasPassword}
      />
    </div>
  )
}
