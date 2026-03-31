/**
 * Utility functions for camera operations
 */

export interface CameraError {
    type: 'permission' | 'not-found' | 'in-use' | 'insecure-context' | 'not-supported' | 'unknown';
    message: string;
}

/**
 * Check if camera is supported in the current environment
 */
export function isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Check if we're in a secure context (HTTPS or localhost)
 */
export function isSecureContextAvailable(): boolean {
    return window.isSecureContext === true;
}

/**
 * Get facing mode based on device capabilities
 * Returns 'environment' for mobile devices, 'user' for desktop
 */
export function getPreferredFacingMode(): 'user' | 'environment' {
    // For mobile devices, prefer environment camera
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        return 'environment';
    }
    // For desktop, use user-facing camera
    return 'user';
}

/**
 * Get optimal camera constraints
 */
export function getCameraConstraints(facingMode: 'user' | 'environment' = 'environment') {
    return {
        video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };
}

/**
 * Normalize camera errors into user-friendly messages
 */
export function normalizeCameraError(error: any): CameraError {
    console.error('Camera error:', error);
    
    if (!window.isSecureContext) {
        return {
            type: 'insecure-context',
            message: 'Camera access requires a secure connection (HTTPS or localhost). Please ensure you are accessing this application through a secure connection.'
        };
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
            type: 'not-supported',
            message: 'Camera is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.'
        };
    }
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return {
            type: 'permission',
            message: 'Camera permission was denied. Please allow camera access in your browser settings.'
        };
    }
    
    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
        return {
            type: 'not-found',
            message: 'No camera found on this device. Please ensure a camera is connected and try again.'
        };
    }
    
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        return {
            type: 'in-use',
            message: 'Camera is already in use by another application. Please close other applications using the camera.'
        };
    }
    
    if (error.name === 'AbortError') {
        return {
            type: 'unknown',
            message: 'Camera access was aborted. Please try again.'
        };
    }
    
    return {
        type: 'unknown',
        message: error.message || 'Failed to access camera. Please try again.'
    };
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream | null) {
    if (stream) {
        stream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (error) {
                console.warn('Error stopping track:', error);
            }
        });
    }
}

/**
 * Capture image from video element
 */
export function captureImageFromVideo(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        throw new Error('Unable to create canvas context');
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.offsetWidth || 640;
    canvas.height = video.videoHeight || video.offsetHeight || 480;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL with good quality
    return canvas.toDataURL('image/jpeg', 0.92);
}