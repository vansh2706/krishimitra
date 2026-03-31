import React, { useState, useRef, useEffect } from 'react'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleItemSelect = (itemValue: string) => {
    onValueChange?.(itemValue)
    setIsOpen(false)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const getDisplayValue = () => {
    const items: Array<{ value: string; label: string }> = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        React.Children.forEach((child.props as any).children, (item) => {
          if (React.isValidElement(item) && item.type === SelectItem) {
            items.push({
              value: (item.props as any).value,
              label: (item.props as any).children
            })
          }
        })
      }
    })
    const selectedItem = items.find(item => item.value === value)
    return selectedItem ? selectedItem.label : value || 'Select...'
  }

  // Check if we have a SelectTrigger child
  const hasTrigger = React.Children.toArray(children).some(child =>
    React.isValidElement(child) && child.type === SelectTrigger
  )

  return (
    <div ref={selectRef} className="relative w-32">
      {/* Render default trigger if no SelectTrigger is provided */}
      {!hasTrigger && (
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={handleToggle}
        >
          <span className="truncate text-left">{getDisplayValue()}</span>
          <svg
            className={`h-4 w-4 ml-2 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Render custom trigger if provided */}
      {hasTrigger && React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: handleToggle,
            children: React.Children.map((child.props as any).children, (triggerChild) => {
              if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
                return getDisplayValue()
              }
              return triggerChild
            })
          })
        }
        return null
      })}

      {isOpen && (
        <div
          className="absolute top-full left-0 z-[10000] w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl py-1 mt-1 max-h-60 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.Children.map((child.props as any).children, (item, index) => {
                if (React.isValidElement(item) && item.type === SelectItem) {
                  const itemValue = (item.props as any).value
                  const itemLabel = (item.props as any).children
                  const isSelected = itemValue === value
                  return (
                    <div
                      key={itemValue || index}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleItemSelect(itemValue)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="truncate">{itemLabel}</span>
                    </div>
                  )
                }
                return null
              })
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

// These are production-ready components for the select functionality
export function SelectTrigger({ children, className, onClick, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any 
}) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 ml-2 transition-transform duration-200 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  return <span className="truncate text-left">{children || placeholder || 'Select...'}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <>{children}</>
}
