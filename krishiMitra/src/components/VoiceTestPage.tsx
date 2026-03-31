'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { VoiceButton, MicrophoneIcon } from './MicrophoneIcon'
import { Mic, MicOff } from 'lucide-react'

export function VoiceTestPage() {
    const [isListening1, setIsListening1] = useState(false)
    const [isListening2, setIsListening2] = useState(false)
    const [isListening3, setIsListening3] = useState(false)

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🎤 Microphone Icon Test Page
                        <Badge variant="outline">Testing</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Test 1: Original Lucide Icons */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">1. Original Lucide React Icons</h3>
                        <div className="flex items-center gap-4">
                            <Button
                                variant={isListening1 ? "destructive" : "outline"}
                                size="icon"
                                className="h-12 w-12"
                                onClick={() => setIsListening1(!isListening1)}
                            >
                                {isListening1 ? (
                                    <MicOff className="h-6 w-6" />
                                ) : (
                                    <Mic className="h-6 w-6" />
                                )}
                            </Button>
                            <div>
                                <p><strong>Status:</strong> {isListening1 ? 'Recording 🔴' : 'Ready 🎤'}</p>
                                <p className="text-sm text-gray-600">
                                    If you see boxes □ instead of icons, Lucide React is not rendering properly
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Test 2: Enhanced Microphone Icon */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">2. Enhanced Microphone Icon (with fallbacks)</h3>
                        <div className="flex items-center gap-4">
                            <Button
                                variant={isListening2 ? "destructive" : "outline"}
                                size="icon"
                                className="h-12 w-12"
                                onClick={() => setIsListening2(!isListening2)}
                            >
                                <MicrophoneIcon
                                    isListening={isListening2}
                                    className="h-6 w-6"
                                    size={24}
                                />
                            </Button>
                            <div>
                                <p><strong>Status:</strong> {isListening2 ? 'Recording 🔴' : 'Ready 🎤'}</p>
                                <p className="text-sm text-gray-600">
                                    This should always show proper icons with multiple fallback methods
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Test 3: Complete Voice Button */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">3. Complete Voice Button Component</h3>
                        <div className="flex items-center gap-4">
                            <VoiceButton
                                isListening={isListening3}
                                onToggle={() => setIsListening3(!isListening3)}
                                size="md"
                                variant="enhanced"
                            />
                            <div>
                                <p><strong>Status:</strong> {isListening3 ? 'Recording 🔴' : 'Ready 🎤'}</p>
                                <p className="text-sm text-gray-600">
                                    Complete button with enhanced styling and multiple icon fallbacks
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Test 4: Different Sizes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">4. Different Sizes</h3>
                        <div className="flex items-center gap-4">
                            <VoiceButton
                                isListening={false}
                                onToggle={() => { }}
                                size="sm"
                                variant="enhanced"
                            />
                            <VoiceButton
                                isListening={false}
                                onToggle={() => { }}
                                size="md"
                                variant="enhanced"
                            />
                            <VoiceButton
                                isListening={false}
                                onToggle={() => { }}
                                size="lg"
                                variant="enhanced"
                            />
                            <div>
                                <p><strong>Sizes:</strong> Small, Medium, Large</p>
                                <p className="text-sm text-gray-600">All sizes should display proper microphone icons</p>
                            </div>
                        </div>
                    </div>

                    {/* Test 5: Emoji Fallbacks */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">5. Pure Emoji Fallbacks</h3>
                        <div className="flex items-center gap-4">
                            <button
                                className="h-12 w-12 border-2 border-blue-300 bg-blue-50 rounded-full flex items-center justify-center text-2xl hover:bg-blue-100 transition-colors"
                                onClick={() => alert('Emoji microphone clicked!')}
                            >
                                🎤
                            </button>
                            <button
                                className="h-12 w-12 border-2 border-red-600 bg-red-500 rounded-full flex items-center justify-center text-2xl animate-pulse"
                                onClick={() => alert('Emoji recording clicked!')}
                            >
                                🔴
                            </button>
                            <div>
                                <p><strong>Pure Emoji:</strong> Always works, no dependencies</p>
                                <p className="text-sm text-gray-600">
                                    These should always display correctly on any system
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Diagnostic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🔧 Diagnostic Information</h4>
                        <div className="space-y-1 text-sm">
                            <p><strong>Browser:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : 'Unknown'}</p>
                            <p><strong>Speech Recognition:</strong> {typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? '✅ Supported' : '❌ Not Supported'}</p>
                            <p><strong>Lucide React:</strong> {typeof Mic !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded'}</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📋 Instructions</h4>
                        <ul className="space-y-1 text-sm">
                            <li>• Click each microphone button to test functionality</li>
                            <li>• Icons should change from 🎤 (ready) to 🔴 (recording)</li>
                            <li>• If you see boxes □, there&apos;s an icon rendering issue</li>
                            <li>• The enhanced components should always display proper icons</li>
                            <li>• Report any issues with specific test numbers</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default VoiceTestPage