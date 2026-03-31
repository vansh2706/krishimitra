import React, { forwardRef } from 'react'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        {...props}
      >
        <div className="h-full w-full overflow-auto">
          {children}
        </div>
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'
