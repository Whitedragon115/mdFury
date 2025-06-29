'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X, Save, Loader2 } from 'lucide-react'

interface SaveDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; tags: string[]; isPublic: boolean }) => Promise<void>
  initialTitle?: string
  initialTags?: string[]
  initialIsPublic?: boolean
  isLoading?: boolean
}

export function SaveDialog({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
  initialTags = [],
  initialIsPublic = false,
  isLoading = false
}: SaveDialogProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialTitle)
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '))
  const [isPublic, setIsPublic] = useState(initialIsPublic)

  const handleSave = async () => {
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await onSave({ title, tags, isPublic })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              {t('editor.saveDialog.title')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="btn-animate hover-scale"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('editor.saveDialog.documentTitle')}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('editor.placeholders.title')}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transition-colors focus:ring-2 focus:ring-green-500/20"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Label htmlFor="tags" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('editor.saveDialog.tags')}
              </Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t('editor.placeholders.tags')}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transition-colors focus:ring-2 focus:ring-green-500/20"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded transition-colors"
                disabled={isLoading}
              />
              <div>
                <Label htmlFor="isPublic" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('editor.saveDialog.isPublic')}
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('editor.saveDialog.isPublicDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 btn-animate hover-scale"
            >
              {t('editor.saveDialog.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !title.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 btn-animate hover-glow"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('editor.saveDialog.save')}
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
