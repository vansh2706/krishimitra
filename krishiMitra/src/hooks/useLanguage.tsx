'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { detectInputLanguage, checkLanguageMismatch } from '../utils/languageDetection'

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'pa'

interface Translations {
    [key: string]: {
        en: string
        hi: string
        ta: string
        te: string
        bn: string
        gu: string
        mr: string
        pa: string
    }
}

const translations: Translations = {
    // Dashboard quick stats
    todayWeather: {
        en: 'Today\'s Weather', hi: 'आज का मौसम', ta: 'இன்றைய வானிலை', te: 'ఈరోజు వాతావరణం', bn: 'আজকের আবহাওয়া', gu: 'આજનું હવામાન', mr: 'आजचे हवामान', pa: 'ਅੱਜ ਦਾ ਮੌਸਮ'
    },
    soilMoisture: {
        en: 'Soil Moisture', hi: 'मिट्टी की नमी', ta: 'மண் ஈரப்பதம்', te: 'నేల తేమ', bn: 'মাটির আর্দ্রতা', gu: 'માટી ભેજ', mr: 'मातीतील ओलावा', pa: 'ਮਿੱਟੀ ਦੀ ਨਮੀ'
    },
    wheatPrice: {
        en: 'Wheat Price', hi: 'गेहूं का भाव', ta: 'கோதுமை விலை', te: 'గోధుమ ధర', bn: 'গমের দাম', gu: 'ઘઉં ભાવ', mr: 'गहू किंमत', pa: 'ਗੰਢਮ ਦੀ ਕੀਮਤ'
    },
    alerts: {
        en: 'Alerts', hi: 'चेतावनी', ta: 'எச்சரிக்கை', te: 'హెచ్చరికలు', bn: 'সতর্কতা', gu: 'ચેતવણી', mr: 'इशारे', pa: 'ਚੇਤਾਵਨੀ'
    },

    // Dashboard cards
    aiAdvisor: {
        en: 'AI Advisor', hi: 'एआई सलाहकार', ta: 'ஏஐ ஆலோசகர்', te: 'ఏఐ సలహాదారు', bn: 'এআই উপদেষ্টা', gu: 'એઆઈ સલાહકાર', mr: 'एआय सल्लागार', pa: 'ਏਆਈ ਸਲਾਹਕਾਰ'
    },
    aiAdvisorDesc: {
        en: 'Get instant answers to your farming questions.', hi: 'अपने कृषि सवालों के तुरंत जवाब पाएं।', ta: 'உங்கள் விவசாய கேள்விகளுக்கு உடனடி பதில்கள்.', te: 'మీ వ్యవసాయ ప్రశ్నలకు తక్షణమే సమాధానాలు పొందండి.', bn: 'আপনার কৃষি প্রশ্নের তাৎক্ষণিক উত্তর পান।', gu: 'તમારા ખેતીના પ્રશ્નોના તરત જવાબ મેળવો.', mr: 'तुमच्या शेतीच्या प्रश्नांची त्वरित उत्तरे मिळवा.', pa: 'ਤੁਹਾਡੇ ਖੇਤੀਬਾੜੀ ਸਵਾਲਾਂ ਦੇ ਤੁਰੰਤ ਜਵਾਬ ਲਵੋ।'
    },
    askAnything: {
        en: 'Ask Anything', hi: 'कुछ भी पूछें', ta: 'எதை வேண்டுமானாலும் கேளுங்கள்', te: 'ఏదైనా అడగండి', bn: 'যেকোনো কিছু জিজ্ঞাসা করুন', gu: 'કંઈ પણ પૂછો', mr: 'काहीही विचारा', pa: 'ਕੁਝ ਵੀ ਪੁੱਛੋ'
    },
    weatherAlerts: {
        en: 'Weather Alerts', hi: 'मौसम अलर्ट', ta: 'வானிலை எச்சரிக்கை', te: 'వాతావరణ హెచ్చరికలు', bn: 'আবহাওয়া সতর্কতা', gu: 'હવામાન ચેતવણી', mr: 'हवामान इशारे', pa: 'ਮੌਸਮ ਚੇਤਾਵਨੀ'
    },
    weatherAlertsDesc: {
        en: 'Stay updated with real-time weather alerts.', hi: 'रीयल-टाइम मौसम अलर्ट के साथ अपडेट रहें।', ta: 'நேரடி வானிலை எச்சரிக்கைகளுடன் புதுப்பிக்கப்படுங்கள்.', te: 'రియల్-టైమ్ వాతావరణ హెచ్చరికలతో అప్డేట్ అవ్వండి.', bn: 'রিয়েল-টাইম আবহাওয়া সতর্কতার সাথে আপডেট থাকুন।', gu: 'રિયલ-ટાઈમ હવામાન ચેતવણી સાથે અપડેટ રહો.', mr: 'रिअल-टाइम हवामान इशाऱ्यांसह अपडेट रहा.', pa: 'ਰੀਅਲ-ਟਾਈਮ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ ਨਾਲ ਅੱਪਡੇਟ ਰਹੋ।'
    },
    realTimeData: {
        en: 'Real-time Data', hi: 'रीयल-टाइम डेटा', ta: 'நேரடி தரவு', te: 'రియల్-టైమ్ డేటా', bn: 'রিয়েল-টাইম ডেটা', gu: 'રિયલ-ટાઈમ ડેટા', mr: 'रिअल-टाइम डेटा', pa: 'ਰੀਅਲ-ਟਾਈਮ ਡੇਟਾ'
    },
    soilFertilizer: {
        en: 'Soil & Fertilizer', hi: 'मिट्टी और उर्वरक', ta: 'மண் மற்றும் உரம்', te: 'నేల & ఎరువు', bn: 'মাটি ও সার', gu: 'માટી અને ખાતર', mr: 'माती आणि खत', pa: 'ਮਿੱਟੀ ਅਤੇ ਖਾਦ'
    },
    soilFertilizerDesc: {
        en: 'Get recommendations for soil and fertilizer.', hi: 'मिट्टी और उर्वरक के लिए सिफारिशें प्राप्त करें।', ta: 'மண் மற்றும் உரத்திற்கான பரிந்துரைகளைப் பெறுங்கள்.', te: 'నేల మరియు ఎరువుల కోసం సిఫార్సులు పొందండి.', bn: 'মাটি ও সারের জন্য সুপারিশ পান।', gu: 'માટી અને ખાતર માટે ભલામણો મેળવો.', mr: 'माती आणि खतासाठी शिफारसी मिळवा.', pa: 'ਮਿੱਟੀ ਅਤੇ ਖਾਦ ਲਈ ਸਿਫਾਰਸ਼ਾਂ ਲਵੋ।'
    },
    getRecommendations: {
        en: 'Get Recommendations', hi: 'सिफारिशें प्राप्त करें', ta: 'பரிந்துரைகளைப் பெறுங்கள்', te: 'సిఫార్సులు పొందండి', bn: 'সুপারিশ পান', gu: 'ભલામણો મેળવો', mr: 'शिफारसी मिळवा', pa: 'ਸਿਫਾਰਸ਼ਾਂ ਲਵੋ'
    },
    pestDetection: {
        en: 'Pest Detection', hi: 'कीट पहचान', ta: 'பூச்சி கண்டறிதல்', te: 'పురుగు గుర్తింపు', bn: 'পোকা শনাক্তকরণ', gu: 'કીડ નિયંત્રણ', mr: 'किड नियंत्रण', pa: 'ਕੀੜੀ ਪਛਾਣ'
    },
    pestDetectionDesc: {
        en: 'Detect pests by uploading a photo.', hi: 'फोटो अपलोड करके कीट पहचानें।', ta: 'புகைப்படத்தை பதிவேற்றுவதன் மூலம் பூச்சிகளை கண்டறியுங்கள்.', te: 'ఫోటోను అప్‌లోడ్ చేసి పురుగులను గుర్తించండి.', bn: 'ছবি আপলোড করে পোকা শনাক্ত করুন।', gu: 'ફોટો અપલોડ કરીને કીડ ઓળખો.', mr: 'फोटो अपलोड करून किड ओळखा.', pa: 'ਫੋਟੋ ਅੱਪਲੋਡ ਕਰਕੇ ਕੀੜੀ ਪਛਾਣੋ।'
    },
    uploadPhoto: {
        en: 'Upload Photo', hi: 'फोटो अपलोड करें', ta: 'புகைப்படத்தை பதிவேற்றவும்', te: 'ఫోటోను అప్‌లోడ్ చేయండి', bn: 'ছবি আপলোড করুন', gu: 'ફોટો અપલોડ કરો', mr: 'फोटो अपलोड करा', pa: 'ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ'
    },
    marketPrices: {
        en: 'Market Prices', hi: 'बाजार भाव', ta: 'சந்தை விலை', te: 'మార్కెట్ ధరలు', bn: 'বাজার মূল্য', gu: 'બજાર ભાવ', mr: 'बाजार भाव', pa: 'ਬਾਜ਼ਾਰ ਕੀਮਤਾਂ'
    },
    marketPricesDesc: {
        en: 'Check live market prices for crops.', hi: 'फसलों के लिए लाइव बाजार भाव देखें।', ta: 'பயிர்களுக்கு நேரடி சந்தை விலைகளைப் பார்க்கவும்.', te: 'పంటల కోసం లైవ్ మార్కెట్ ధరలను చూడండి.', bn: 'ফসলের জন্য লাইভ বাজার মূল্য দেখুন।', gu: 'પાક માટે લાઈવ બજાર ભાવ જુઓ.', mr: 'पिकांसाठी लाईव्ह बाजार भाव पहा.', pa: 'ਫਸਲਾਂ ਲਈ ਲਾਈਵ ਬਾਜ਼ਾਰ ਕੀਮਤਾਂ ਵੇਖੋ।'
    },
    liveRates: {
        en: 'Live Rates', hi: 'लाइव रेट', ta: 'நேரடி விகிதங்கள்', te: 'లైవ్ రేట్లు', bn: 'লাইভ রেট', gu: 'લાઈવ રેટ', mr: 'लाईव्ह दर', pa: 'ਲਾਈਵ ਰੇਟ'
    },
    voiceSupport: {
        en: 'Voice Support', hi: 'वॉयस सपोर्ट', ta: 'குரல் ஆதரவு', te: 'వాయిస్ సపోర్ట్', bn: 'ভয়েস সাপোর্ট', gu: 'વોઇસ સપોર્ટ', mr: 'व्हॉइस सपोर्ट', pa: 'ਵੌਇਸ ਸਹਾਇਤਾ'
    },
    voiceSupportDesc: {
        en: 'Test voice features for accessibility.', hi: 'सुलभता के लिए वॉयस फीचर्स का परीक्षण करें।', ta: 'அணுகலுக்காக குரல் அம்சங்களை சோதிக்கவும்.', te: 'ప్రాప్యత కోసం వాయిస్ ఫీచర్లను పరీక్షించండి.', bn: 'অ্যাক্সেসিবিলিটির জন্য ভয়েস ফিচার পরীক্ষা করুন।', gu: 'ઍક્સેસિબિલિટી માટે વોઇસ ફીચર્સ તપાસો.', mr: 'सुलभतेसाठी व्हॉइस फीचर्स तपासा.', pa: 'ਐਕਸੈਸਬਿਲਿਟੀ ਲਈ ਵੌਇਸ ਫੀਚਰ ਜਾਂਚੋ।'
    },

    // Footer
    footerText: {
        en: '© 2025 KrishiMitra. All rights reserved.', hi: '© 2025 कृषिमित्र। सर्वाधिकार सुरक्षित।', ta: '© 2025 கிருஷிமித்ரா. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', te: '© 2025 కృషిమిత్ర. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.', bn: '© 2025 কৃষিমিত্র। সর্বস্বত্ব সংরক্ষিত।', gu: '© 2025 કૃષિમિત્ર. સર્વાધિકારો સુરક્ષિત.', mr: '© 2025 कृषिमित्र. सर्व हक्क राखीव.', pa: '© 2025 ਕ੍ਰਿਸ਼ਿਮਿਤ੍ਰਾ। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।'
    },
    supportedLanguages: {
        en: 'Supported Languages', hi: 'समर्थित भाषाएँ', ta: 'ஆதரவு மொழிகள்', te: 'మద్దతు భాషలు', bn: 'সমর্থিত ভাষা', gu: 'આધારિત ભાષાઓ', mr: 'समर्थित भाषा', pa: 'ਸਹਾਇਕ ਭਾਸ਼ਾਵਾਂ'
    },
    voiceEnabled: {
        en: 'Voice Enabled', hi: 'वॉयस सक्षम', ta: 'குரல் இயக்கப்பட்டது', te: 'వాయిస్ ప్రారంభించబడింది', bn: 'ভয়েস সক্রিয়', gu: 'વોઇસ સક્રિય', mr: 'व्हॉइस सक्षम', pa: 'ਵੌਇਸ ਚਾਲੂ ਹੈ'
    },
    yes: {
        en: 'Yes', hi: 'हाँ', ta: 'ஆம்', te: 'అవును', bn: 'হ্যাঁ', gu: 'હા', mr: 'होय', pa: 'ਹਾਂ'
    },
    no: {
        en: 'No', hi: 'नहीं', ta: 'இல்లை', te: 'కాదు', bn: 'না', gu: 'ના', mr: 'नाही', pa: 'ਨਹੀਂ'
    },

    // Welcome message for farmer friend
    welcomeFarmer: {
        en: 'Welcome My Farmer Friend!',
        hi: 'स्वागत है मेरे किसान मित्र!',
        ta: 'வரவேற்கிறோம் என் விவசாயி நண்பரே!',
        te: 'స్వాగతం నా రైతు మిత్రమా!',
        bn: 'স্বাগতম আমার কৃষক বন্ধু!',
        gu: 'સ્વાગત છે મારા ખેડૂત મિત્ર!',
        mr: 'स्वागत आहे माझ्या शेतकरी मित्रा!',
        pa: 'ਸੁਆਗਤ ਹੈ ਮੇਰੇ ਕਿਸਾਨ ਮਿੱਤਰ!'
    },
    // App Title and Navigation
    appTitle: {
        en: 'KrishiMitra',
        hi: 'कृषिमित्र',
        ta: 'விவசாய மித்திரன்',
        te: 'కృషిమిత్ర',
        bn: 'কৃষিমিত্র',
        gu: 'કૃષિમિત્ર',
        mr: 'कृषीमित्र',
        pa: 'ਕ੍ਰਿਸ਼ਿਮਿਤ੍ਰ'
    },
    appSubtitle: {
        en: 'AI-powered farming guidance for better yields',
        hi: 'बेहतर उत्पादन के लिए AI-संचालित कृषि मार्गदर्शन',
        ta: 'சிறந்த மகசூலுக்காக AI-ஆல் இயக்கப்படும் விவசாய வழிகாட்டுதல்',
        te: 'మెరుగైన దిగుబడి కోసం AI-శక్తితో కూడిన వ్యవసాయ మార్గదర్శకత్వం',
        bn: 'ভাল ফলনের জন্য AI-চালিত কৃষি নির্দেশনা',
        gu: 'વધુ સારા ઉત્પાદન માટે AI-સંચાલિત ખેતી માર્ગદર્શન',
        mr: 'चांगल्या उत्पादनासाठी AI-चालित शेती मार्गदर्शन',
        pa: 'ਬਿਹਤਰ ਫਸਲ ਲਈ AI-ਸੰਚਾਲਿਤ ਖੇਤੀ ਮਾਰਗਦਰਸ਼ਨ'
    },
    dashboard: {
        en: 'Dashboard',
        hi: 'डैशबोर्ड',
        ta: 'டாஷ்போர்டு',
        te: 'డాష్‌బోర్డ్',
        bn: 'ড্যাশবোর্ড',
        gu: 'ડેશબોર્ડ',
        mr: 'डॅशबोर्ड',
        pa: 'ਡੈਸ਼ਬੋਰਡ'
    },
    advisor: {
        en: 'Advisor',
        hi: 'सलाहकार',
        ta: 'ஆலோசகர்',
        te: 'సలహాదారు',
        bn: 'পরামর্শদাতা',
        gu: 'સલાહકાર',
        mr: 'सल्लागार',
        pa: 'ਸਲਾਹਕਾਰ'
    },
    weather: {
        en: 'Weather',
        hi: 'मौसम',
        ta: 'வானிலை',
        te: 'వాతావరణం',
        bn: 'আবহাওয়া',
        gu: 'હવામાન',
        mr: 'हवामान',
        pa: 'ਮੌਸਮ'
    },
    soil: {
        en: 'Soil',
        hi: 'मिट्टी',
        ta: 'மண்',
        te: 'మట్టి',
        bn: 'মাটি',
        gu: 'માટી',
        mr: 'माती',
        pa: 'ਮਿੱਟੀ'
    },
    pest: {
        en: 'Pest',
        hi: 'कीट',
        ta: 'பூச்சி',
        te: 'కీటకం',
        bn: 'পোকামাকড়',
        gu: 'જીવાત',
        mr: 'किडे',
        pa: 'ਕੀੜੇ'
    },
    market: {
        en: 'Market',
        hi: 'बाज़ार',
        ta: 'சந்தை',
        te: 'మార్కెట్',
        bn: 'বাজার',
        gu: 'બજાર',
        mr: 'बाजार',
        pa: 'ਬਾਜ਼ਾਰ'
    },
    feedback: {
        en: 'Feedback',
        hi: 'फीडबैक',
        ta: 'கருத்து',
        te: 'అభిప్రాయం',
        bn: 'মতামত',
        gu: 'પ્રતિસાદ',
        mr: 'फीडबॅक',
        pa: 'ਫੀਡਬੈਕ'
    },

    // Crop Calendar
    calendar: {
        en: 'Calendar',
        hi: 'कैलेंडर',
        ta: 'நாட்காட்டி',
        te: 'క్యాలెండర్',
        bn: 'ক্যালেন্ডার',
        gu: 'કૅલેન્ડર',
        mr: 'दिनदर्शिका',
        pa: 'ਕੈਲੰਡਰ'
    },
    cropCalendar: {
        en: 'Crop Calendar',
        hi: 'फसल कैलेंडर',
        ta: 'பயிர் நாட்காட்டி',
        te: 'పంట క్యాలెండర్',
        bn: 'ফসল ক্যালেন্ডার',
        gu: 'પાક કૅલેન્ડર',
        mr: 'पीक दिनदर्शिका',
        pa: 'ਫਸਲ ਕੈਲੰਡਰ'
    },
    cropCalendarDesc: {
        en: 'View seasonal crop planting and harvesting schedules',
        hi: 'ऋतुओं के अनुसार फसल बोने और काटने का समय प्राप्त करें',
        ta: 'பருவகால பயிர் விதைப்பு மற்றும் அறுவடை நேரத்தைப் பார்க்கவும்',
        te: 'ఋతుమాన పంట నాటడం మరియు పంట కోసడం షెడ్యూల్‌లను చూడండి',
        bn: 'মৌসুমি ফসল রোপণ এবং ফসল কাটার সময়সূচী দেখুন',
        gu: 'ઋતુઓ મુજબ પાક રોપણ અને કાપવાનો સમય જુઓ',
        mr: 'हंगामानुसार पीक लावण्याची आणि कापण्याची वेळ पहा',
        pa: 'ਮੌਸਮੀ ਫਸਲ ਲਗਾਉਣ ਅਤੇ ਕਟਾਈ ਦਾ ਸਮਾਂ ਵੇਖੋ'
    },
    viewFullCalendar: {
        en: 'View Full Calendar',
        hi: 'पूर्ण कैलेंडर देखें',
        ta: 'முழு நாட்காட்டியைப் பார்க்கவும்',
        te: 'పూర్తి క్యాలెండర్‌ను చూడండి',
        bn: 'সম্পূর্ণ ক্যালেন্ডার দেখুন',
        gu: 'પૂર્ણ કૅલેન્ડર જુઓ',
        mr: 'संपूर्ण दिनदर्शिका पहा',
        pa: 'ਪੂਰਾ ਕੈਲੰਡਰ ਵੇਖੋ'
    },

    // Voice and Language Controls
    voiceOn: {
        en: 'Voice On',
        hi: 'आवाज चालू',
        ta: 'குரல் இயக்கத்தில்',
        te: 'వాయిస్ ఆన్',
        bn: 'ভয়েস চালু',
        gu: 'અવાજ ચાલુ',
        mr: 'आवाज चालू',
        pa: 'ਆਵਾਜ਼ ਚਾਲੂ'
    },
    voiceOff: {
        en: 'Voice Off',
        hi: 'आवाज बंद',
        ta: 'குரல் அணைக்கப்பட்டது',
        te: 'వాయిస్ ఆఫ్',
        bn: 'ভয়েস বন্ধ',
        gu: 'અવાજ બંધ',
        mr: 'आवाज बंद',
        pa: 'ਆਵਾਜ਼ ਬੰਦ'
    },
    testVoice: {
        en: 'Test Voice',
        hi: 'आवाज का परीक्षण करें',
        ta: 'குரல் சோதனை',
        te: 'వాయిస్ టెస్ట్',
        bn: 'ভয়েস পরীক্ষা',
        gu: 'અવાજ પરીક્ષણ',
        mr: 'आवाज चाचणी',
        pa: 'ਆਵਾਜ਼ ਟੈਸਟ'
    },
    welcomeMessage: {
        en: 'Welcome to KrishiMitra. How can I help you today?',
        hi: 'कृषिमित्र में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
        ta: 'விவசாய மித்திரனுக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        te: 'కృషిమిత్రకు స్వాగతం. నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?',
        bn: 'কৃষিমিত্রে আপনাদের স্বাগতম। আজ আমি আপনাদের কীভাবে সাহায্য করতে পারি?',
        gu: 'કૃષિમિત્રમાં આપનું સ્વાગત છે. આજે હું તમારી કેવી રીતે મદદ કરી શકું?',
        mr: 'कृषीमित्रात आपले स्वागत आहे. आज मी तुमची कशी मदत करू शकतो?',
        pa: 'ਕ੍ਰਿਸ਼ਿਮਿਤ੍ਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?'
    },

    // Common actions
    submit: {
        en: 'Submit',
        hi: 'सबमिट करें',
        ta: 'சமர்ப்பிக்கவும்',
        te: 'సమర్పించు',
        bn: 'জমা দিন',
        gu: 'સબમિટ કરો',
        mr: 'सबमिट करा',
        pa: 'ਜਮ੍ਹਾਂ ਕਰੋ'
    },
    loading: {
        en: 'Loading...',
        hi: 'लोड हो रहा है...',
        ta: 'ஏற்றுகிறது...',
        te: 'లోడ్ అవుతోంది...',
        bn: 'লোড হচ্ছে...',
        gu: 'લોડ થઈ રહ્યું છે...',
        mr: 'लोड होत आहे...',
        pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...'
    },

    // Crops - Extended list
    wheat: {
        en: 'Wheat',
        hi: 'गेहूं',
        ta: 'கோதுமை',
        te: 'గోధుమలు',
        bn: 'গম',
        gu: 'ઘઉં',
        mr: 'गहू',
        pa: 'ਕਣਕ'
    },
    rice: {
        en: 'Rice',
        hi: 'चावल',
        ta: 'அரிசி',
        te: 'వరి',
        bn: 'ধান',
        gu: 'ચોખા',
        mr: 'भात',
        pa: 'ਚਾਵਲ'
    },
    cotton: {
        en: 'Cotton',
        hi: 'कपास',
        ta: 'பருத்தி',
        te: 'పత్తి',
        bn: 'তুলা',
        gu: 'કપાસ',
        mr: 'कापूस',
        pa: 'ਕਪਾਹ'
    },
    sugarcane: {
        en: 'Sugarcane',
        hi: 'गन्ना',
        ta: 'கரும்பு',
        te: 'చెరకు',
        bn: 'আখ',
        gu: 'શેરડી',
        mr: 'ऊस',
        pa: 'ਗੰਨਾ'
    },
    maize: {
        en: 'Maize',
        hi: 'मक्का',
        ta: 'சோளம்',
        te: 'మొక్కజొన్న',
        bn: 'ভুট্টা',
        gu: 'મકાઈ',
        mr: 'मका',
        pa: 'ਮੱਕੀ'
    },
    soybean: {
        en: 'Soybean',
        hi: 'सोयाबीन',
        ta: 'சோயாபீன்',
        te: 'సోయాబీన్',
        bn: 'সয়াবিন',
        gu: 'સોયાબીન',
        mr: 'सोयाबीन',
        pa: 'ਸੋਇਆਬੀਨ'
    },
    groundnut: {
        en: 'Groundnut',
        hi: 'मूंगफली',
        ta: 'நிலக்கடலை',
        te: 'వేరుశనగ',
        bn: 'চিনাবাদাম',
        gu: 'મગફળી',
        mr: 'भुईमूग',
        pa: 'ਮੂੰਗਫਲੀ'
    },
    mustard: {
        en: 'Mustard',
        hi: 'सरसों',
        ta: 'கடுகு',
        te: 'ఆవాలు',
        bn: 'সরিষা',
        gu: 'રાઈ',
        mr: 'मोहरी',
        pa: 'ਸਰੋਂ'
    },
    sunflower: {
        en: 'Sunflower',
        hi: 'सूरजमुखी',
        ta: 'சூரியகாந்தி',
        te: 'పొద్దుతిరుగుడు',
        bn: 'সূর্যমুখী',
        gu: 'સૂર્યમુખી',
        mr: 'सूर्यफूल',
        pa: 'ਸੂਰਜਮੁਖੀ'
    },
    chickpea: {
        en: 'Chickpea',
        hi: 'चना',
        ta: 'கொண்டைக்கடலை',
        te: 'శనగలు',
        bn: 'ছোলা',
        gu: 'ચણા',
        mr: 'हरभरा',
        pa: 'ਚਣਾ'
    },
    pigeon_pea: {
        en: 'Pigeon Pea',
        hi: 'अरहर',
        ta: 'துவரை',
        te: 'కందులు',
        bn: 'অড়হর',
        gu: 'તુવેર',
        mr: 'तूर',
        pa: 'ਅਰਹਰ'
    },
    lentil: {
        en: 'Lentil',
        hi: 'मसूर',
        ta: 'மசூர்',
        te: 'మసూర్',
        bn: 'মসূર',
        gu: 'મસૂર',
        mr: 'मसूर',
        pa: 'ਮਸੂਰ'
    },
    barley: {
        en: 'Barley',
        hi: 'जौ',
        ta: 'வாற்கோதுமை',
        te: 'యవలు',
        bn: 'যব',
        gu: 'જવ',
        mr: 'जव',
        pa: 'ਜੌਂ'
    },
    millet: {
        en: 'Millet',
        hi: 'बाजरा',
        ta: 'கம்பு',
        te: 'సజ్జలు',
        bn: 'বাজরা',
        gu: 'બાજરી',
        mr: 'बाजरी',
        pa: 'ਬਾਜਰਾ'
    },
    sorghum: {
        en: 'Sorghum',
        hi: 'ज्वार',
        ta: 'சோளம்',
        te: 'జొన్న',
        bn: 'জোয়ার',
        gu: 'જુવાર',
        mr: 'ज्वारी',
        pa: 'ਜੁਆਰ'
    },
    onion: {
        en: 'Onion',
        hi: 'प्याज',
        ta: 'வெங்காயம்',
        te: 'ఉల్లిపాయ',
        bn: 'পেঁয়াজ',
        gu: 'ડુંગળી',
        mr: 'कांदा',
        pa: 'ਪਿਆਜ਼'
    },
    potato: {
        en: 'Potato',
        hi: 'आलू',
        ta: 'உருளைக்கிழங்கு',
        te: 'బంగాళాదుంప',
        bn: 'আলু',
        gu: 'બટાકા',
        mr: 'बटाटा',
        pa: 'ਆਲੂ'
    },
    tomato: {
        en: 'Tomato',
        hi: 'टमाटर',
        ta: 'தக்காளி',
        te: 'టమాటో',
        bn: 'টমেটো',
        gu: 'ટમેટા',
        mr: 'टोमेटो',
        pa: 'ਟਮਾਟਰ'
    },
    chilli: {
        en: 'Chilli',
        hi: 'मिर्च',
        ta: 'மிளகாய்',
        te: 'మిర్చి',
        bn: 'লঙ্কা',
        gu: 'મરચું',
        mr: 'मिरची',
        pa: 'ਮਿਰਚ'
    },
    turmeric: {
        en: 'Turmeric',
        hi: 'हल्दी',
        ta: 'மஞ்சள்',
        te: 'పసుపు',
        bn: 'হলুদ',
        gu: 'હળદર',
        mr: 'हळद',
        pa: 'ਹਲਦੀ'
    },

    // Cost benefit analysis
    costBenefit: {
        en: 'Cost-Benefit Analysis',
        hi: 'लागत-लाभ विश्लेषण',
        ta: 'செலவு-நன்மை பகுப்பாய்வு',
        te: 'వ్యయ-లాభ విశ్లేషణ',
        bn: 'খরচ-সুবিধা বিশ্লেষণ',
        gu: 'ખર્ચ-લાભ વિશ્લેષણ',
        mr: 'खर्च-फायदा विश्लेषण',
        pa: 'ਲਾਗਤ-ਲਾਭ ਵਿਸ਼ਲੇਸ਼ਣ'
    },
    profitCalculator: {
        en: 'Profit Calculator',
        hi: 'लाभ कैलकुलेटर',
        ta: 'லாப கணக்கீடு',
        te: 'లాభ కాలిక్యులేటర్',
        bn: 'লাভ ক্যালকুলেটর',
        gu: 'નફો કેલ્ક્યુલેટર',
        mr: 'नफा कॅल्क्युलेटर',
        pa: 'ਲਾਭ ਕੈਲਕੁਲੇਟਰ'
    },

    // Feedback
    advisoryFeedback: {
        en: 'Advisory Feedback',
        hi: 'सलाहकार फीडबैक',
        ta: 'ஆலோசனை கருத்து',
        te: 'సలహా అభిప్రాయం',
        bn: 'পরামর্শ মতামত',
        gu: 'સલાહકાર પ્રતિસાદ',
        mr: 'सल्लागार फीडबॅक',
        pa: 'ਸਲਾਹਕਾਰ ਫੀਡਬੈਕ'
    },
    submitFeedback: {
        en: 'Submit Feedback',
        hi: 'फीडबैक सबमिट करें',
        ta: 'கருத்தை சமர்ப்பிக்கவும்',
        te: 'అభిప్రాయం సమర్పించండి',
        bn: 'মতামত জমা দিন',
        gu: 'પ્રતિસાદ સબમિટ કરો',
        mr: 'फीडबॅक सबमिट करा',
        pa: 'ਫੀਡਬੈਕ ਜਮ੍ਹਾਂ ਕਰੋ'
    },

    // Offline status
    offlineMode: {
        en: 'Offline Mode',
        hi: 'ऑफलाइन मोड',
        ta: 'ஆஃப்லைன் முறை',
        te: 'ఆఫ్‌లైన్ మోడ్',
        bn: 'অফলাইন মোড',
        gu: 'ઓફલાઇન મોડ',
        mr: 'ऑफलाइन मोड',
        pa: 'ਆਫਲਾਈਨ ਮੋਡ'
    },
    syncing: {
        en: 'Syncing...',
        hi: 'सिंक हो रहा है...',
        ta: 'ஒத்திசைக்கப்படுகிறது...',
        te: 'సింక్ అవుతోంది...',
        bn: 'সিঙ্ক হচ্ছে...',
        gu: 'સિંક થઈ રહ્યું છે...',
        mr: 'सिंक होत आहे...',
        pa: 'ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ...'
    },
    thinkingAI: {
        en: 'AI is thinking...',
        hi: 'AI सोच रहा है...',
        ta: 'AI சிந்திக்கிறது...',
        te: 'AI ఆలోచిస్తోంది...',
        bn: 'AI চিন্তা করছে...',
        gu: 'AI વિચારી રહ્યું છે...',
        mr: 'AI विचार करत आहे...',
        pa: 'AI ਸੋਚ ਰਿਹਾ ਹੈ...'
    },
    typeMessage: {
        en: 'Type your message here...',
        hi: 'अपना संदेश यहाँ टाइप करें...',
        ta: 'உங்கள் செய்தியை இங்கே தட்டச்சு செய்யுங்கள்...',
        te: 'మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...',
        bn: 'এখানে আপনার বার্তা টাইপ করুন...',
        gu: 'તમારો સંદેશ અહીં ટાઇપ કરો...',
        mr: 'आपला संदेश येथे टाइप करा...',
        pa: 'ਆਪਣਾ ਸੁਨੇਹਾ ਇੱਥੇ ਟਾਈਪ ਕਰੋ...'
    },
    selectCrop: {
        en: 'Select Crop',
        hi: 'फसल चुनें',
        ta: 'பயிரைத் தேர்ந்தெடுக்கவும்',
        te: 'పంటను ఎంచుకోండి',
        bn: 'ফসল নির্বাচন করুন',
        gu: 'પાક પસંદ કરો',
        mr: 'पीक निवडा',
        pa: 'ਫਸਲ ਚੁਣੋ'
    },
    soilType: {
        en: 'Soil Type',
        hi: 'मिट्टी का प्रकार',
        ta: 'மண் வகை',
        te: 'మట్టి రకం',
        bn: 'মাটির ধরন',
        gu: 'માટીનો પ્રકાર',
        mr: 'मातीचा प्रकार',
        pa: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ'
    },
    selectSoilType: {
        en: 'Select Soil Type',
        hi: 'मिट्टी का प्रकार चुनें',
        ta: 'மண் வகையைத் தேர்ந்தெடுக்கவும்',
        te: 'మట్టి రకాన్ని ఎంచుకోండి',
        bn: 'মাটির ধরন নির্বাচন করুন',
        gu: 'માટીનો પ્રકાર પસંદ કરો',
        mr: 'मातीचा प्रकार निवडा',
        pa: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਚੁਣੋ'
    },

    // Language detection suggestions
    languageSwitchSuggestion: {
        en: 'Language Switch Suggestion',
        hi: 'भाषा बदलने का सुझाव',
        ta: 'மொழி மாற்ற பரிந்துரை',
        te: 'భాష మార్చు సూచన',
        bn: 'ভাষা পরিবর্তনের পরামর্শ',
        gu: 'ભાષા બદલવાનું સૂચન',
        mr: 'भाषा बदलण्याची सूचना',
        pa: 'ਭਾਸ਼ਾ ਬਦਲਣ ਦਾ ਸੁਝਾਅ'
    },
    languageDetectedMessage: {
        en: 'Your input appears to be in {language} ({confidence}% confidence). Would you like to switch languages?',
        hi: 'आपका इनपुट {language} में लगता है ({confidence}% विश्वास)। क्या आप भाषा बदलना चाहते हैं?',
        ta: 'உங்கள் உள்ளீடு {language} இல் உள்ளது ({confidence}% நம்பிक்கை). மொழியை மாற்ற விரும்புகிறீர்களா?',
        te: 'మీ ఇన్‌పుట్ {language} లో ఉన్నట్లు కనిపిస్తోంది ({confidence}% నమ్మకం). భాషను మార్చాలనుకుంటున్నారా?',
        bn: 'আপনার ইনপুট {language} এ রয়েছে বলে মনে হচ্ছে ({confidence}% আস্থা)। আপনি কি ভাষা পরিবর্তন করতে চান?',
        gu: 'તમારું ઇનપુટ {language} માં લાગે છે ({confidence}% વિશ્વાસ). શું તમે ભાષા બદલવા માંગો છો?',
        mr: 'तुमचा इनपुट {language} मध्ये आहे असे दिसते ({confidence}% विश्वास). तुम्हाला भाषा बदलायची आहे का?',
        pa: 'ਤੁਹਾਡਾ ਇਨਪੁੱਟ {language} ਵਿੱਚ ਲੱਗਦਾ ਹੈ ({confidence}% ਭਰੋਸਾ)। ਕੀ ਤੁਸੀਂ ਭਾਸ਼ਾ ਬਦਲਣਾ ਚਾਹੁੰਦੇ ਹੋ?'
    },
    yesSwitch: {
        en: 'Yes, Switch',
        hi: 'हाँ, बदलें',
        ta: 'ஆம், மாற்றவும்',
        te: 'అవును, మార్చండి',
        bn: 'হ্যাঁ, পরিবর্তন করুন',
        gu: 'હા, બદલો',
        mr: 'होय, बदला',
        pa: 'ਹਾਂ, ਬਦਲੋ'
    },
    noThanks: {
        en: 'No, Thanks',
        hi: 'नहीं, धन्यवाद',
        ta: 'இல்லை, நன்றி',
        te: 'లేదు, ధన్యవాదాలు',
        bn: 'না, ধন্যবাদ',
        gu: 'ના, આભાર',
        mr: 'नाही, धन्यवाद',
        pa: 'ਨਹੀਂ, ਧੰਨਵਾਦ'
    },
    quickQuestions: {
        en: 'Quick Questions',
        hi: 'त्वरित प्रश्न',
        ta: 'விரைவு கேள்விகள்',
        te: 'త్వరిత ప్రశ్నలు',
        bn: 'দ্রুত প্রশ্ন',
        gu: 'ઝડપી પ્રશ્નો',
        mr: 'द्रुत प्रश्न',
        pa: 'ਤੇਜ਼ ਸਵਾਲ'
    },

    // Login Form Translations
    loginTitle: {
        en: 'KrishiMitra Login',
        hi: 'कृषिमित्र में प्रवेश',
        ta: 'கிருஷிமித்ரா உள்நுழைவு',
        te: 'కృషిమిత్ర లాగిన్',
        bn: 'কৃষিমিত্র লগইন',
        gu: 'કૃષિમિત્ર લોગિન',
        mr: 'कृषिमित्र लॉगिन',
        pa: 'ਕ੍ਰਿਸ਼ਿਮਿਤ੍ਰ ਲਾਗਇਨ'
    },
    loginSubtitle: {
        en: 'Start your agricultural journey',
        hi: 'अपनी कृषि यात्रा शुरू करें',
        ta: 'உங்கள் விவசாய பயணத்தைத் தொடங்குங்கள்',
        te: 'మీ వ్యవసాయ ప్రయాణాన్ని ప్రారంభించండి',
        bn: 'আপনার কৃষি যাত্রা শুরু করুন',
        gu: 'તમારી કૃષિ યાત્રા શરૂ કરો',
        mr: 'तुमचा शेती प्रवास सुरू करा',
        pa: 'ਆਪਣੀ ਖੇਤੀਬਾੜੀ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ'
    },
    fullName: {
        en: 'Full Name',
        hi: 'पूरा नाम',
        ta: 'முழு பெயர்',
        te: 'పూర్తి పేరు',
        bn: 'পূর্ণ নাম',
        gu: 'પૂરું નામ',
        mr: 'पूर्ण नाव',
        pa: 'ਪੂਰਾ ਨਾਮ'
    },
    enterFullName: {
        en: 'Enter your full name',
        hi: 'अपना पूरा नाम दर्ज करें',
        ta: 'உங்கள் முழு பெயரை உள்ளிடுங்கள்',
        te: 'మీ పూర్తి పేరును నమోదు చేయండి',
        bn: 'আপনার পূর্ণ নাম লিখুন',
        gu: 'તમારું પૂરું નામ દાખલ કરો',
        mr: 'तुमचे पूर्ण नाव प्रविष्ट करा',
        pa: 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ'
    },
    mobileNumber: {
        en: 'Mobile Number',
        hi: 'मोबाइल नंबर',
        ta: 'மொபைல் எண்',
        te: 'మొబైల్ నంబర్',
        bn: 'মোবাইল নম্বর',
        gu: 'મોબાઇલ નંબર',
        mr: 'मोबाइल नंबर',
        pa: 'ਮੋਬਾਈਲ ਨੰਬਰ'
    },
    securityCode: {
        en: 'Security Code',
        hi: 'सुरक्षा कोड',
        ta: 'பாதுகாப்பு குறியீடு',
        te: 'భద్రతా కోడ్',
        bn: 'নিরাপত্তা কোড',
        gu: 'સિક્યુરિટી કોડ',
        mr: 'सिक्यूरिटी कोड',
        pa: 'ਸਿਕਿਉਰਿਟੀ ਕੋਡ'
    },
    enterCaptcha: {
        en: 'Enter captcha',
        hi: 'कैप्चा दर्ज करें',
        ta: 'கேப்ட்சாவை உள்ளிடுங்கள்',
        te: 'కాప్చాను నమోదు చేయండి',
        bn: 'ক্যাপচা লিখুন',
        gu: 'કેપ્ચા દાખલ કરો',
        mr: 'कॅप्चा प्रविष्ट करा',
        pa: 'ਕੈਪਚਾ ਦਰਜ ਕਰੋ'
    },
    secureLogin: {
        en: 'Secure Login',
        hi: 'सुरक्षित प्रवेश',
        ta: 'பாதுகாப்பான உள்நுழைவு',
        te: 'సురక్షిత లాగిన్',
        bn: 'নিরাপদ লগইন',
        gu: 'સુરક્ષિત લોગિન',
        mr: 'सुरक्षित लॉगिन',
        pa: 'ਸੁਰੱਖਿਅਤ ਲਾਗਇਨ'
    },
    loggingIn: {
        en: 'Logging in...',
        hi: 'प्रवेश हो रहा है...',
        ta: 'உள்நுழைகிறது...',
        te: 'లాగిన్ అవుతోంది...',
        bn: 'লগইন হচ্ছে...',
        gu: 'લૉગિન થઈ રહ્યું છે...',
        mr: 'लॉगिन होत आहे...',
        pa: 'ਲਾਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...'
    },
    securityNote: {
        en: '🔒 Your information is secure and will only be used for agricultural advice',
        hi: '🔒 आपकी जानकारी सुरक्षित है और केवल कृषि सलाह के लिए उपयोग की जाएगी',
        ta: '🔒 உங்கள் தகவல் பாதுகாப்பானது மற்றும் விவசாய ஆலோசனைக்கு மட்டுமே பயன்படுத்தப்படும்',
        te: '🔒 మీ సమాచారం సురక్షితం మరియు వ్యవసాయ సలహా కోసం మాత్రమే ఉపయోగించబడుతుంది',
        bn: '🔒 আপনার তথ্য নিরাপদ এবং শুধুমাত্র কৃষি পরামর্শের জন্য ব্যবহৃত হবে',
        gu: '🔒 તમારી માહિતી સુરક્ષિત છે અને ફક્ત કૃષિ સલાહ માટે જ ઉપયોગ થશે',
        mr: '🔒 तुमची माहिती सुरक्षित आहे आणि फक्त शेती सल्ल्यासाठी वापरली जाईल',
        pa: '🔒 ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਹੈ ਅਤੇ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਲਈ ਵਰਤੀ ਜਾਵੇਗੀ'
    },
    // Validation Messages
    nameRequired: {
        en: 'Name is required',
        hi: 'नाम आवश्यक है',
        ta: 'பெயர் தேவை',
        te: 'పేరు అవసరం',
        bn: 'নাম প্রয়োজন',
        gu: 'નામ આવશ્યક છે',
        mr: 'नाव आवश्यक आहे',
        pa: 'ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ'
    },
    nameMinLength: {
        en: 'Name must be at least 2 characters',
        hi: 'नाम कम से कम 2 अक्षर का होना चाहिए',
        ta: 'பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்',
        te: 'పేరు కనీసం 2 అక్షరాలు ఉండాలి',
        bn: 'নাম কমপক্ষে 2 অক্ষরের হতে হবে',
        gu: 'નામ ઓછામાં ઓછા 2 અક્ષર હોવું જોઈએ',
        mr: 'नाव किमान 2 अक्षरांचे असावे',
        pa: 'ਨਾਮ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ'
    },
    nameLettersOnly: {
        en: 'Name should contain only letters',
        hi: 'नाम में केवल अक्षर होने चाहिए',
        ta: 'பெயரில் எழுத்துகள் மட்டுமே இருக்க வேண்டும்',
        te: 'పేరులో అక్షరాలు మాత్రమే ఉండాలి',
        bn: 'নামে শুধুমাত্র অক্ষর থাকতে হবে',
        gu: 'નામમાં ફક્ત અક્ષરો હોવા જોઈએ',
        mr: 'नावात फक्त अक्षरे असावीत',
        pa: 'ਨਾਮ ਵਿੱਚ ਸਿਰਫ਼ ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ'
    },
    mobileRequired: {
        en: 'Mobile number is required',
        hi: 'मोबाइल नंबर आवश्यक है',
        ta: 'மொபைல் எண் தேவை',
        te: 'మొబైల్ నంబర్ అవసరం',
        bn: 'মোবাইল নম্বর প্রয়োজন',
        gu: 'મોબાઇલ નંબર આવશ્યક છે',
        mr: 'मोबाइल नंबर आवश्यक आहे',
        pa: 'ਮੋਬਾਈਲ ਨੰਬਰ ਜ਼ਰੂਰੀ ਹੈ'
    },
    mobileInvalid: {
        en: 'Enter valid Indian mobile number (10 digits)',
        hi: 'वैध भारतीय मोबाइल नंबर दर्ज करें (10 अंक)',
        ta: 'சரியான இந்திய மொபைல் எண்ணை உள்ளிடுங்கள் (10 இலக்கங்கள்)',
        te: 'చెల్లుబాటు అయ్యే భారతీయ మొబైల్ నంబర్‌ను నమోదు చేయండి (10 అంకెలు)',
        bn: 'বৈধ ভারতীয় মোবাইল নম্বর লিখুন (10 সংখ্যা)',
        gu: 'માન્ય ભારતીય મોબાઇલ નંબર દાખલ કરો (10 અંકો)',
        mr: 'वैध भारतीय मोबाइल नंबर प्रविष्ट करा (10 अंक)',
        pa: 'ਸਹੀ ਭਾਰਤੀ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ (10 ਅੰਕ)'
    },
    captchaRequired: {
        en: 'Captcha is required',
        hi: 'कैप्चा आवश्यक है',
        ta: 'கேப்ட்சா தேவை',
        te: 'కాప్చా అవసరం',
        bn: 'ক্যাপচা প্রয়োজন',
        gu: 'કેપ્ચા આવશ્યક છે',
        mr: 'कॅप्चा आवश्यक आहे',
        pa: 'ਕੈਪਚਾ ਜ਼ਰੂਰੀ ਹੈ'
    },
    captchaIncorrect: {
        en: 'Incorrect captcha',
        hi: 'गलत कैप्चा',
        ta: 'தவறான கேப்ட்சா',
        te: 'తప్పు కాప్చా',
        bn: 'ভুল ক্যাপচা',
        gu: 'ખોટો કેપ્ચા',
        mr: 'चुकीचा कॅप्चा',
        pa: 'ਗਲਤ ਕੈਪਚਾ'
    },
    loginError: {
        en: 'Login error',
        hi: 'लॉगिन में त्रुटि',
        ta: 'உள்நுழைவு பிழை',
        te: 'లాగిన్ లోపం',
        bn: 'লগইন ত্রুটি',
        gu: 'લૉગિન ભૂલ',
        mr: 'लॉगिन त्रुटी',
        pa: 'ਲਾਗਇਨ ਗਲਤੀ'
    },
    newCaptcha: {
        en: 'New captcha',
        hi: 'नया कैप्चा',
        ta: 'புதிய கேப்ட்சா',
        te: 'కొత్త కాప్చా',
        bn: 'নতুন ক্যাপচা',
        gu: 'નવો કેપ્ચા',
        mr: 'नवा कॅप्चा',
        pa: 'ਨਵਾਂ ਕੈਪਚਾ'
    },
    // Weather Alerts
    noAlertsForLocation: {
        en: 'No alerts for your location',
        hi: 'आपके स्थान के लिए कोई चेतावनी नहीं है',
        ta: 'உங்கள் இடத்திற்கு எச்சரிக்கைகள் இல்லை',
        te: 'మీ స్థానం కోసం హెచ్చరికలు లేవు',
        bn: 'আপনার অবস্থানের জন্য কোনও সতর্কতা নেই',
        gu: 'તમારા સ્થાન માટે ચેતવણીઓ નથી',
        mr: 'तुमच्या स्थानासाठी कोणत्याही चेतावण्या नाहीत',
        pa: 'ਤੁਹਾਡੇ ਸਥਾਨ ਲਈ ਕੋਈ ਚੇਤਾਵਨੀਆਂ ਨਹੀਂ ਹਨ'
    },

    // Analysis History
    recentAnalyses: {
        en: 'Recent Analyses', hi: 'हाल के विश्लेषण', ta: 'சமீபத்திய பகுப்பாய்வுகள்', te: 'ఇటీవలి విశ్లేషణలు', bn: 'সাম্প্রতিক বিশ্লেষণ', gu: 'તાજેતરના વિશ્લેષણો', mr: 'अलीकडील विश्लेषणे', pa: 'ਹਾਲ ਦੇ ਵਿਸ਼ਲੇਸ਼ਣ'
    },
    showingRecent: {
        en: 'Showing 3 most recent analyses', hi: '3 सबसे हालिया विश्लेषण दिखाए जा रहे हैं', ta: '3 மிக சமீபத்திய பகுப்பாய்வுகளை காட்டுகிறது', te: '3 అత్యంత ఇటీవలి విశ్లేషణలను చూపిస్తోంది', bn: '3টি সর্বশেষ বিশ্লেষণ দেখানো হচ্ছে', gu: '3 સૌથી તાજેતરના વિશ્લેષણો બતાવી રહ્યા છે', mr: '3 सर्वात अलीकडील विश्लेषणे दाखवत आहे', pa: '3 ਸਭ ਤੋਂ ਹਾਲੀਆ ਵਿਸ਼ਲੇਸ਼ਣ ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ'
    },
    totalAnalyses: {
        en: 'total', hi: 'कुल', ta: 'மொத்தம்', te: 'మొత్తం', bn: 'মোট', gu: 'કુલ', mr: 'एकूण', pa: 'ਕੁੱਲ'
    },
    // Image Quality Warnings
    lowQualityWarning: {
        en: 'Your image quality is very poor but I gave you the analysis according to quality of image for better understanding',
        hi: 'आपकी तस्वीर की गुणवत्ता बहुत खराब है लेकिन बेहतर समझ के लिए मैंने छवि की गुणवत्ता के अनुसार विश्लेषण दिया है',
        ta: 'உங்கள் படத்தின் தரம் மிகவும் மோசமானது ஆனால் சிறந்த புரிதலுக்காக படத்தின் தரத்தின் படி பகுப்பாய்வு செய்துள்ளேன்',
        te: 'మీ చిత్రం యొక్క నాణ్యత చాలా దారుణంగా ఉంది కానీ మంచి అవగాహన కోసం చిత్రం యొక్క నాణ్యత ప్రకారం విశ్లేషణ ఇచ్చాను',
        bn: 'আপনার ছবির মান খুবই খারাপ কিন্তু ভাল বোঝার জন্য ছবির মান অনুযায়ী বিশ্লেষণ দিয়েছি',
        gu: 'તમારી છબીની ગુણવત્તા ખૂબ જ ખરાબ છે પરંતુ વધુ સારી સમજ માટે છબીની ગુણવત્તા અનુસાર વિશ્લેષણ આપ્યું છે',
        mr: 'तुमच्या प्रतिमेची गुणवत्ता खूप वाईट आहे परंतु चांगल्या समजुतीसाठी प्रतिमेच्या गुणवत्तेनुसार विश्लेषण दिले आहे',
        pa: 'ਤੁਹਾਡੀ ਤਸਵੀਰ ਦੀ ਗੁਣਵੱਤਾ ਬਹੁਤ ਮਾੜੀ ਹੈ ਪਰ ਬਿਹਤਰ ਸਮਝ ਲਈ ਮੈਂ ਤਸਵੀਰ ਦੀ ਗੁਣਵੱਤਾ ਅਨੁਸਾਰ ਵਿਸ਼ਲੇਸ਼ਣ ਦਿੱਤਾ ਹੈ'
    },
    imageQualityPoor: {
        en: 'Image quality is poor (below 200x200 pixels)',
        hi: 'तस्वीर की गुणवत्ता खराब है (200x200 पिक्सेल से कम)',
        ta: 'படத்தின் தரம் மோசமானது (200x200 பிக்சல்களுக்கு கீழே)',
        te: 'చిత్రం యొక్క నాణ్యత దారుణంగా ఉంది (200x200 పిక్సెల్స్ కంటే తక్కువ)',
        bn: 'ছবির মান খারাপ (200x200 পিক্সেলের নিচে)',
        gu: 'છબીની ગુણવત્તા ખરાબ છે (200x200 પિક્સેલથી નીચે)',
        mr: 'प्रतिमेची गुणवत्ता वाईट आहे (200x200 पिक्सेलच्या खाली)',
        pa: 'ਤਸਵੀਰ ਦੀ ਗੁਣਵੱਤਾ ਮਾੜੀ ਹੈ (200x200 ਪਿਕਸਲ ਤੋਂ ਘੱਟ)'
    },
    delete: {
        en: 'Delete', hi: 'हटाएं', ta: 'அழிக்கவும்', te: 'తొలగించు', bn: 'মুছে ফেলুন', gu: 'મુકો', mr: 'हटवा', pa: 'ਮਿਟਾਓ'
    },
    // Pest Detection UI Elements
    detectionResult: {
        en: 'Detection Result', hi: 'पहचान परिणाम', ta: 'கண்டறிதல் முடிவு', te: 'గుర్తింపు ఫలితం', bn: 'শনাক্করণ ফলাফল', gu: 'શોધ પરિણામ', mr: 'ओळख परिणाम', pa: 'ਪਿਛਾਣ ਨਤੀਜਾ'
    },
    symptoms: {
        en: 'Symptoms', hi: 'लक्षण', ta: 'அறிகுறிகள்', te: 'లక్షణాలు', bn: 'লক্ষণ', gu: 'લક્ષણો', mr: 'लक्षणे', pa: 'ਲੱਖਣ'
    },
    treatment: {
        en: 'Treatment', hi: 'उपचार', ta: 'சிகிச்சை', te: 'చికిత్స', bn: 'চিকিৎসা', gu: 'ઉપચાર', mr: 'उपचार', pa: 'ਇਲਾਜ'
    },
    prevention: {
        en: 'Prevention', hi: 'रोकथाम', ta: 'தடுப்பு', te: 'రోగనివారణ', bn: 'প্রতিরোধ', gu: 'રોકથામ', mr: 'प्रतिबंध', pa: 'ਰੋਕਥਾਮ'
    },
    details: {
        en: 'Details', hi: 'विवरण', ta: 'விவரங்கள்', te: 'వివరాలు', bn: 'বিস্তারিত', gu: 'વિસ્તાર', mr: 'तपशील', pa: 'ਵੇਰਵਾ'
    },
    organicTreatment: {
        en: 'Organic Treatment', hi: 'जैविक उपचार', ta: 'இயற்கை சிகிச்சை', te: 'సేంద్రియ చికిత్స', bn: 'জৈবিক চিকিৎসা', gu: 'અવયવી ઉપચાર', mr: 'देशी उपचार', pa: 'ਕੁਦਰਤੀ ਇਲਾਜ'
    },
    chemicalTreatment: {
        en: 'Chemical Treatment', hi: 'रासायनिक उपचार', ta: 'வேதியியல் சிகிச்சை', te: 'రాసాయనిక చికిత్స', bn: 'রাসায়নিক চিকিৎসা', gu: 'રાસાયણિક ઉપચાર', mr: 'रासायनिक उपचार', pa: 'ਰਸਾਇਣਿਕ ਇਲਾਜ'
    },
    affectedCrops: {
        en: 'Affected Crops', hi: 'प्रभावित फसलें', ta: 'பாதிக்கப்பட்ட பயிர்கள்', te: 'ప్రభావిత పంటలు', bn: 'ক্ষতিগ্রস্ত ফসল', gu: 'પ્રાવિત પાક', mr: 'रोगग्रस्त पिके', pa: 'ਪ੍ਰਭਾਵਿਤ ਫਸਲਾਂ'
    },
    seasonality: {
        en: 'Seasonality', hi: 'मौसमी जानकारी', ta: 'பருவகால தகவல்', te: 'ఋతువుల సమాచారం', bn: 'ঋতুগত তথ্য', gu: 'ઋતુગત માહિતી', mr: 'हवामानातील माहिती', pa: 'ਮੌਸਮੀ ਜਾਣਕਾਰੀ'
    },
    symptomsToLookFor: {
        en: 'Symptoms to Look For', hi: 'देखने योग्य लक्षण', ta: 'தேடவேண்டிய அறிகுறிகள்', te: 'చూడవలసిన లక్షణాలు', bn: 'যে লক্ষণগুলি খেয়াল করুন', gu: 'જોવા યોગ્ય લક્ષણો', mr: 'पाहायची लक्षणे', pa: 'ਵੇਖਣ ਲਈ ਲੱਖਣ'
    },
    preventionStrategies: {
        en: 'Prevention Strategies', hi: 'रोकथाम रणनीतियाँ', ta: 'தடுப்பு வழிகள்', te: 'రోగనివారణ వ్యూహాలు', bn: 'প্রতিরোধের কৌশল', gu: 'રોકથામી રણનીતિઓ', mr: 'प्रतिबंधात्मक उपाय', pa: 'ਰੋਕਥਾਮ ਰਣਨੀਤੀਆਂ'
    }
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    isOnline: boolean
    isDarkMode: boolean
    toggleDarkMode: () => void
    detectAndSuggestLanguage: (text: string) => {
        detectedLanguage: Language
        shouldSuggest: boolean
        confidence: number
    }
    autoSetLanguageFromInput: (text: string) => boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en') // No default language, start with English
    const [isOnline, setIsOnline] = useState(true)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)

    // Handle hydration first
    useEffect(() => {
        setIsHydrated(true)
    }, [])

    // Load saved language on mount - only after hydration
    useEffect(() => {
        if (isHydrated && typeof window !== 'undefined') {
            try {
                const savedLanguage = localStorage.getItem('krishimitra-language') as Language
                if (savedLanguage && ['en', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'].includes(savedLanguage)) {
                    console.log('Loading saved language:', savedLanguage)
                    setLanguageState(savedLanguage)
                }
                // No default language setting - let user choose
            } catch (error) {
                console.warn('Failed to load saved language:', error)
                // No default language - let user choose
            }
        }
    }, [isHydrated])

    // Wrapper function for setLanguage with persistence and logging
    const setLanguage = (newLanguage: Language) => {
        console.log('Language change requested:', language, '->', newLanguage)
        setLanguageState(newLanguage)

        if (isHydrated && typeof window !== 'undefined') {
            try {
                localStorage.setItem('krishimitra-language', newLanguage)
            } catch (error) {
                console.warn('Failed to save language to localStorage:', error)
            }
        }
        console.log('Language changed and saved to localStorage:', newLanguage)

        // Run on the next macrotask so React updates and any selection handlers finish first.
        setTimeout(() => {
            if (isHydrated && typeof window !== 'undefined') {
                // Blur any focused element so focus-based dropdowns/menus close.
                try {
                    ; (document.activeElement as HTMLElement | null)?.blur()
                } catch (e) {
                    console.warn('Unable to blur active element after language change', e)
                }

                // Emit framework-friendly custom event so components can explicitly close on language change.
                try {
                    window.dispatchEvent(new CustomEvent('krishimitra:language-changed', { detail: { language: newLanguage } }))
                    // Also emit a generic "close menus" event to support components that listen for explicit close signals.
                    window.dispatchEvent(new CustomEvent('krishimitra:close-menus'))
                    // Emit data reload event for Soil & Pest components
                    window.dispatchEvent(new CustomEvent('krishimitra:language-data-reload', {
                        detail: {
                            language: newLanguage,
                            previousLanguage: language,
                            timestamp: new Date().toISOString(),
                            components: ['soil', 'pest', 'market']
                        }
                    }))
                } catch (e) {
                    console.warn('Unable to dispatch language-changed/close-menus events', e)
                }

                // Fire lightweight pointer/click events to trigger outside-click handlers (some UI libs listen for these).
                try {
                    const down = new PointerEvent('pointerdown', { bubbles: true })
                    const up = new PointerEvent('pointerup', { bubbles: true })
                    const click = new MouseEvent('click', { bubbles: true })
                    document.dispatchEvent(down)
                    document.dispatchEvent(up)
                    document.dispatchEvent(click)
                } catch (e) {
                    // If synthetic pointer events aren't supported, don't break flow.
                    console.warn('Unable to emit synthetic pointer/click events after language change', e)
                }
            }
        }, 0)
    }

    // Monitor online status - only after hydration
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [isHydrated])

    // Load dark mode preference - only after hydration
    useEffect(() => {
        if (isHydrated && typeof window !== 'undefined') {
            try {
                const savedTheme = localStorage.getItem('krishimitra-theme')
                if (savedTheme === 'dark') {
                    setIsDarkMode(true)
                    document.documentElement.classList.add('dark')
                }
            } catch (error) {
                console.warn('Failed to load theme preference:', error)
            }
        }
    }, [isHydrated])

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)

        if (isHydrated && typeof window !== 'undefined') {
            try {
                if (newDarkMode) {
                    document.documentElement.classList.add('dark')
                    localStorage.setItem('krishimitra-theme', 'dark')
                } else {
                    document.documentElement.classList.remove('dark')
                    localStorage.setItem('krishimitra-theme', 'light')
                }
            } catch (error) {
                console.warn('Failed to save theme preference:', error)
            }
        }
    }

    const t = (key: string): string => {
        const translation = translations[key]
        if (!translation) {
            console.warn(`Missing translation for key: ${key}`)
            return key
        }
        return translation[language] || translation.en
    }

    // Language detection functions
    const detectAndSuggestLanguage = (text: string) => {
        const result = checkLanguageMismatch(text, language)
        return {
            detectedLanguage: result.detectedLanguage,
            shouldSuggest: result.shouldSuggestChange,
            confidence: result.confidence
        }
    }

    const autoSetLanguageFromInput = (text: string): boolean => {
        if (!text || text.trim().length < 5) return false

        const detectedLang = detectInputLanguage(text)
        const result = checkLanguageMismatch(text, language)

        // Auto-switch if confidence is very high and language is different
        if (result.shouldSuggestChange && result.confidence > 80) {
            console.log(`Auto-switching language from ${language} to ${detectedLang} (confidence: ${result.confidence}%)`)
            setLanguage(detectedLang)
            return true
        }

        return false
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isOnline, isDarkMode, toggleDarkMode, detectAndSuggestLanguage, autoSetLanguageFromInput }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
