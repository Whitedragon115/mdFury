"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning"
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", onClose, children, ...props }, ref) => {
    const getToastIcon = () => {
      switch (variant) {
        case "destructive":
          return <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
        default:
          return <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
      }
    }

    const getBorderColor = () => {
      switch (variant) {
        case "destructive":
          return "border-red-400/50"
        case "success":
          return "border-green-400/50"
        case "warning":
          return "border-yellow-400/50"
        default:
          return "border-blue-400/50"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center space-x-3 overflow-hidden rounded-lg border-2 bg-white/10 dark:bg-slate-900/30 backdrop-blur-lg p-3 pr-8 shadow-xl transition-all",
          getBorderColor(),
          className
        )}
        {...props}
      >
        {getToastIcon()}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1 h-6 w-6 rounded-md p-0 text-slate-400 opacity-0 transition-opacity hover:text-slate-100 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-sm font-bold text-slate-900 dark:text-slate-100", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-sm text-slate-700 dark:text-slate-300 ml-2", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

export { Toast, ToastTitle, ToastDescription }
