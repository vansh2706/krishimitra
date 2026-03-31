'use client'

import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PestDetectionCameraTest() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const startCamera = async () => {
        try {
            setError(null)
            
            // Check if we're in a secure context (HTTPS or localhost)
            if (!window.isSecureContext) {
                throw new Error('Camera access requires a secure connection (HTTPS or localhost)')
            }

            // Check if mediaDevices is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera is not supported in your browser')
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setCameraActive(true)
            }
        } catch (error: any) {
            console.error('Camera access failed:', error)
            setError(error.message || 'Failed to access camera')
            setCameraActive(false)
        }
    }

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Camera Test for Pest Detection</h2>
            
            {!cameraActive ? (
                <div className="text-center">
                    <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
                        <Camera className="mr-2 h-4 w-4" /> Start Camera
                    </Button>
                    {error && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                            Error: {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg border-2 border-gray-300"
                    />
                    <Button 
                        onClick={stopCamera} 
                        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700"
                    >
                        <X className="h-4 w-4" /> Stop Camera
                    </Button>
                </div>
            )}
        </div>
    )
}