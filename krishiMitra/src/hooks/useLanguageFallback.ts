// Language fallback and validation utilities
import { Language } from './useLanguage'

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export function isValidLanguage(lang: string | null | undefined): lang is SupportedLanguage {
    if (!lang) return false
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
}

export function getSafeLanguage(lang: string | null | undefined): SupportedLanguage {
    return isValidLanguage(lang) ? lang : 'en'
}

export function getLanguageDisplayText(langCode: string | null | undefined): string {
    const safeCode = getSafeLanguage(langCode)
    const displayNames: Record<SupportedLanguage, string> = {
        'en': 'English',
        'hi': 'हिंदी',
        'ta': 'தமிழ்',
        'te': 'తెలుగు',
        'bn': 'বাংলা',
        'gu': 'ગુજરાતી',
        'mr': 'मराठी',
        'pa': 'ਪੰਜਾਬੀ'
    }
    return displayNames[safeCode]
}

export function getLanguageDisplayEmoji(langCode: string | null | undefined): string {
    const safeCode = getSafeLanguage(langCode)
    const emojiMap: Record<SupportedLanguage, string> = {
        'en': '🇺🇸',
        'hi': '🇮🇳',
        'ta': '🇮🇳',
        'te': '🇮🇳',
        'bn': '🇧🇩',
        'gu': '🇮🇳',
        'mr': '🇮🇳',
        'pa': '🇮🇳'
    }
    return emojiMap[safeCode]
}

export function getFullLanguageDisplay(langCode: string | null | undefined): string {
    const safeCode = getSafeLanguage(langCode)
    const text = getLanguageDisplayText(safeCode)
    const emoji = getLanguageDisplayEmoji(safeCode)
    return `${emoji} ${text}`
}

export const translations: Record<string, Record<string, string>> = {
    en: {
        'cameraAccessDenied': 'Camera access denied. Please allow camera permissions to use this feature.',
        'cameraPermissionDenied': 'Camera permission was denied. Please allow camera access in your browser settings.',
        'cameraNotFound': 'No camera found on this device.',
        'cameraInUse': 'Camera is already in use by another application.',
        'cameraNotSupported': 'Camera is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.',
        'cameraSecureContextRequired': 'Camera access requires a secure connection (HTTPS or localhost).',
        'captureFailed': 'Failed to capture photo. Please try again.',
        'videoNotReady': 'Video is not ready yet. Please wait a moment and try again.',
        'capturePhoto': 'Capture Photo',
        'cancel': 'Cancel',
        'recording': 'LIVE',
        'cameraLoading': 'Loading camera...',
        'useCamera': 'Use Camera'
    },
    hi: {
        'cameraAccessDenied': 'कैमरा एक्सेस अस्वीकृत। कृपया इस सुविधा का उपयोग करने के लिए कैमरा अनुमति दें।',
        'cameraPermissionDenied': 'कैमरा अनुमति अस्वीकृत। कृपया अपने ब्राउज़र सेटिंग्स में कैमरा एक्सेस की अनुमति दें।',
        'cameraNotFound': 'इस डिवाइस पर कोई कैमरा नहीं मिला।',
        'cameraInUse': 'कैमरा पहले से ही किसी अन्य एप्लिकेशन द्वारा उपयोग में है।',
        'cameraNotSupported': 'आपके ब्राउज़र में कैमरा समर्थित नहीं है। कृपया Chrome, Firefox या Edge जैसे आधुनिक ब्राउज़र का उपयोग करें।',
        'cameraSecureContextRequired': 'कैमरा एक्सेस के लिए सुरक्षित कनेक्शन (HTTPS या localhost) की आवश्यकता होती है।',
        'captureFailed': 'फोटो कैप्चर करने में विफल। कृपया पुनः प्रयास करें।',
        'videoNotReady': 'वीडियो अभी तैयार नहीं है। कृपया कुछ क्षण प्रतीक्षा करें और पुनः प्रयास करें।',
        'capturePhoto': 'फोटो कैप्चर करें',
        'cancel': 'रद्द करें',
        'recording': 'लाइव',
        'cameraLoading': 'कैमरा लोड हो रहा है...',
        'useCamera': 'कैमरा का उपयोग करें'
    },
    ta: {
        'cameraAccessDenied': 'கைமேரா அணுகல் தான்திரம். இந்த வணிகையைப் பயன்படுத்த கைமேரா அனுமதிகளை அனுமதிக்கவும்.',
        'cameraPermissionDenied': 'கைமேரா அனுமதி தான்திரம். உங்கள் வலைப்பாட்டு அமைப்புகளில் கைமேரா அணுகல் அனுமதியை அனுமதிக்கவும்.',
        'cameraNotFound': 'இந்த உபகரணத்தில் கைமேரா காணப்படவில்லை.',
        'cameraInUse': 'கைமேரா மற்றொரு பயன்பாடு முன்னர் பயன்படுத்திக்கொண்டுள்ளது.',
        'cameraNotSupported': 'உங்கள் வலைப்பாட்டில் கைமேரா அதிக்காரம் உள்ளது. Chrome, Firefox அல்லது Edge போன்ற மாற்றும் வலைப்பாட்டுகளை பயன்படுத்தவும்.',
        'cameraSecureContextRequired': 'கைமேரா அணுகல் ஒரு நம்மத்திரமான இணைப்பில் (HTTPS அல்லது localhost) தேவை.',
        'captureFailed': 'புகைப்பட கைப்பற்றும் தோல்வியாக வழங்கப்பட்டது. மீண்டும் முயற்சிக்கவும்.',
        'videoNotReady': 'வீடியோ இப்போது தயாராகவில்லை. சில நிமிஷங்கள் காத்திருங்கள் மற்றும் மீண்டும் முயற்சிக்கவும்.',
        'capturePhoto': 'புகைப்பட கைப்பற்று',
        'cancel': 'ரத்து செய்',
        'recording': 'இழந்தது',
        'cameraLoading': 'கைமேரா வாங்குகிறது...',
        'useCamera': 'கைமேரா பயன்படுத்து'
    },
    te: {
        'cameraAccessDenied': 'కెమెరా యాక్సెస్ నిరాకరించబడింది. ఈ ఫీచర్‌ను ఉపయోగించడానికి కెమెరా అనుమతులను అనుమతించండి.',
        'cameraPermissionDenied': 'కెమెరా అనుమతి నిరాకరించబడింది. మీ బ్రౌజర్ సెట్టింగ్‌లలో కెమెరా యాక్సెస్‌ను అనుమతించండి.',
        'cameraNotFound': 'ఈ పరికరంలో కెమెరా కనుగొనబడలేదు.',
        'cameraInUse': 'కెమెరా ఇప్పటికే మరొక యాప్ ద్వారా ఉపయోగించబడుతోంది.',
        'cameraNotSupported': 'మీ బ్రౌజర్‌లో కెమెరా మద్దతు లేదు. Chrome, Firefox లేదా Edge వంటి ఆధునిక బ్రౌజర్‌ను ఉపయోగించండి.',
        'cameraSecureContextRequired': 'కెమెరా యాక్సెస్‌కు సురక్షిత కనెక్షన్ (HTTPS లేదా localhost) అవసరం.',
        'captureFailed': 'ఫొటో తీయడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
        'videoNotReady': 'వీడియో ఇంకా సిద్ధంగా లేదు. కొంత సమయం వేచి ఉన్నా మళ్లీ ప్రయత్నించండి.',
        'capturePhoto': 'ఫొటో తీయండి',
        'cancel': 'రద్దు చేయండి',
        'recording': 'లైవ్',
        'cameraLoading': 'కెమెరా లోడవుతోంది...',
        'useCamera': 'కెమెరాను ఉపయోగించండి'
    }
}