// Enhanced microphone icon component with multiple fallback options
import React from 'react'
import { Mic, MicOff } from 'lucide-react'

interface MicrophoneIconProps {
    isListening: boolean
    className?: string
    size?: number
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({
    isListening,
    className = "",
    size = 24
}) => {
    // Fallback SVG paths for microphone icons
    const MicSVG = () => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 1-3 3v4c0 2.21 1.79 4 4 4s4-1.79 4-4V4l-3-3"></path>
            <rect width="16" height="4" x="4" y="10" rx="2"></rect>
            <path d="M16 14v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6"></path>
        </svg>
    )

    const MicOffSVG = () => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="2" y1="2" x2="22" y2="22"></line>
            <path d="m12 1-3 3v4c0 2.21 1.79 4 4 4s4-1.79 4-4V4l-3-3"></path>
            <rect width="16" height="4" x="4" y="10" rx="2"></rect>
            <path d="M16 14v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6"></path>
        </svg>
    )

    try {
        // Primary: Try to use Lucide React icons
        return (
            <div className="relative inline-flex items-center justify-center">
                {isListening ? (
                    <MicOff className={className} strokeWidth={2.5} />
                ) : (
                    <Mic className={className} strokeWidth={2.5} />
                )}
                {/* Emoji fallback - hidden but available for screen readers */}
                <span className="sr-only" role="img" aria-label={isListening ? "Recording" : "Microphone"}>
                    {isListening ? "🔴" : "🎤"}
                </span>
            </div>
        )
    } catch (error) {
        // Fallback 1: Use direct SVG
        try {
            return (
                <div className="relative inline-flex items-center justify-center">
                    {isListening ? <MicOffSVG /> : <MicSVG />}
                    <span className="sr-only" role="img" aria-label={isListening ? "Recording" : "Microphone"}>
                        {isListening ? "🔴" : "🎤"}
                    </span>
                </div>
            )
        } catch {
            // Fallback 2: Use emoji only
            return (
                <span
                    className={`inline-flex items-center justify-center ${className}`}
                    style={{ fontSize: `${size * 0.8}px` }}
                    role="img"
                    aria-label={isListening ? "Recording" : "Microphone"}
                >
                    {isListening ? "🔴" : "🎤"}
                </span>
            )
        }
    }
}

// Enhanced voice button component
interface VoiceButtonProps {
    isListening: boolean
    onToggle: () => void
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'enhanced'
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
    isListening,
    onToggle,
    disabled = false,
    size = 'md',
    variant = 'enhanced'
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    }

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 32
    }

    const baseClasses = `
    ${sizeClasses[size]}
    border-2 
    rounded-full 
    transition-all 
    duration-200 
    flex 
    items-center 
    justify-center
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `

    const stateClasses = isListening
        ? `
      bg-red-500 
      border-red-600 
      text-white
      animate-pulse 
      shadow-lg 
      shadow-red-200 
      hover:bg-red-600
      focus:ring-red-500
    `
        : `
      bg-blue-50 
      border-blue-300 
      text-blue-700
      hover:bg-blue-100 
      hover:border-blue-400 
      shadow-md 
      hover:shadow-lg
      focus:ring-blue-500
    `

    return (
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses}`}
            title={isListening ? 'Stop Recording' : 'Start Voice Input'}
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        >
            <MicrophoneIcon
                isListening={isListening}
                className={isListening ? "text-white" : "text-blue-700"}
                size={iconSizes[size]}
            />
        </button>
    )
}

export default MicrophoneIcon