'use client'

import { Toaster } from 'react-hot-toast'

export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{}}
      toastOptions={{
        // 預設選項
        duration: 4000,
        style: {
          background: 'rgba(30, 41, 59, 0.95)', // 深色背景，半透明
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          minWidth: '280px',
        },
        // 成功通知
        success: {
          duration: 3000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#ffffff',
            border: '1px solid #10b981',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        // 錯誤通知
        error: {
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#ffffff',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        // 載入通知
        loading: {
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#ffffff',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
          },
        },
      }}
    />
  )
}
