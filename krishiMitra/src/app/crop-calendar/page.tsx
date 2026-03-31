'use client'

import { useState, useEffect } from 'react'
import { Calendar, Search, Filter, Sprout, Sun, CloudRain, Wind } from 'lucide-react'

// Define the language type
type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'pa'

// Define the crop data structure
interface CropData {
  id: number
  name: {
    en: string
    hi: string
    ta: string
    te: string
    bn: string
    gu: string
    mr: string
    pa: string
  }
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All'
  cropType: 'Cereal' | 'Oilseeds' | 'Fibers' | 'Fruits' | 'Pulses' | 'Vegetables' | 'All'
  sowingStart: number
  sowingEnd: number
  harvestingStart: number
  harvestingEnd: number
  description?: {
    en: string
    hi: string
    ta: string
    te: string
    bn: string
    gu: string
    mr: string
    pa: string
  }
  waterRequirement: 'Low' | 'Medium' | 'High'
  soilType: string[]
  bestYield: string
  icon?: string // optional icon path in /public/crop-icons
}

export default function CropCalendarPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<'Kharif' | 'Rabi' | 'Zaid' | 'All'>('All')
  const [selectedCropType, setSelectedCropType] = useState<'Cereal' | 'Oilseeds' | 'Fibers' | 'Fruits' | 'Pulses' | 'Vegetables' | 'All'>('All')
  const [waterFilter, setWaterFilter] = useState<'Any' | 'Low' | 'Medium' | 'High'>('Any')
  const [simpleView, setSimpleView] = useState<boolean>(true)
  const [sortBy, setSortBy] = useState<'sowingStart' | 'name' | 'season'>('sowingStart')
  
  // Get month name by index (1-12)
  const getMonthName = (monthIndex: number): string => {
    const months = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      hi: ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
      ta: ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'],
      te: ['జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్', 'జూలై', 'ఆగ', 'సెప్టెం', 'అక్టో', 'నవం', 'డిసెం'],
      bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
      gu: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
      mr: ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
      pa: ['ਜਨ', 'ਫਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ']
    }
    return months[language][monthIndex - 1] || ''
  }

  // Centralized translations for UI labels
  const translations: Record<Language, Record<string, string>> = {
    en: {
      cropCalendar: 'Crop Calendar',
      searchPlaceholder: 'Search crops...',
      allSeasons: 'All Seasons',
      allTypes: 'All Types',
      type: 'Type',
      water: 'Water',
      soil: 'Soil',
      yield: 'Yield',
      sowing: 'Sowing',
      harvesting: 'Harvesting',
      noCrops: 'No crops found',
      adjustFilters: 'Try adjusting your search or filters',
      sortBy: 'Sort',
      sortSowing: 'Sort: Sowing Month',
      sortName: 'Sort: Name',
      sortSeason: 'Sort: Season',
      waterFilter: 'Water Filter',
      any: 'Any',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      simpleView: 'Simple View',
      advancedView: 'Advanced View',
      resultsFound: 'crops found',
    },
    hi: {
      cropCalendar: 'फसल कैलेंडर',
      searchPlaceholder: 'फसल खोजें...',
      allSeasons: 'सभी ऋतुएँ',
      allTypes: 'सभी प्रकार',
      type: 'प्रकार',
      water: 'पानी',
      soil: 'मिट्टी',
      yield: 'उत्पादन',
      sowing: 'बोना',
      harvesting: 'काटना',
      noCrops: 'कोई फसल नहीं मिली',
      adjustFilters: 'अपने खोज या फ़िल्टर को समायोजित करने का प्रयास करें',
      sortBy: 'क्रम',
      sortSowing: 'क्रम: बुवाई माह',
      sortName: 'क्रम: नाम',
      sortSeason: 'क्रम: ऋतु',
      waterFilter: 'पानी फ़िल्टर',
      any: 'कोई भी',
      low: 'कम',
      medium: 'मध्यम',
      high: 'अधिक',
      simpleView: 'सरल दृश्य',
      advancedView: 'उन्नत दृश्य',
      resultsFound: 'फसलें मिलीं',
    },
    ta: {
      cropCalendar: 'பயிர் நாட்காட்டி',
      searchPlaceholder: 'பயிர்களைத் தேடு...',
      allSeasons: 'அனைத்து பருவங்கள்',
      allTypes: 'அனைத்து வகைகள்',
      type: 'வகை',
      water: 'நீர்',
      soil: 'மண்',
      yield: 'விளைச்சல்',
      sowing: 'விதைத்தல்',
      harvesting: 'அறுவடை',
      noCrops: 'பயிர்கள் எதுவும் கிடைக்கவில்லை',
      adjustFilters: 'உங்கள் தேடல் அல்லது வடிப்பான்களைச் சரிசெய்ய முயற்சிக்கவும்',
      sortBy: 'வரிசை',
      sortSowing: 'வரிசை: விதைப்பு மாதம்',
      sortName: 'வரிசை: பெயர்',
      sortSeason: 'வரிசை: பருவம்',
      waterFilter: 'நீர் வடிப்பான்',
      any: 'எதுவும்',
      low: 'குறைவு',
      medium: 'நடுத்தரம்',
      high: 'அதிகம்',
      simpleView: 'எளிய பார்வு',
      advancedView: 'மேம்பட்ட பார்வு',
      resultsFound: 'பயிர்கள் கண்டறியப்பட்டன',
    },
    te: {
      cropCalendar: 'పంట క్యాలెండర్',
      searchPlaceholder: 'పంటలను శోధించండి...',
      allSeasons: 'అన్ని ఋతువులు',
      allTypes: 'అన్ని రకాలు',
      type: 'రకం',
      water: 'నీరు',
      soil: 'నేల',
      yield: 'దిగుబడి',
      sowing: 'నాటడం',
      harvesting: 'పంట కోత',
      noCrops: 'పంటలు ఏవీ కనబడలేదు',
      adjustFilters: 'మీ శోధన లేదా ఫిల్టర్లను సర్దుబాటు చేయండి',
      sortBy: 'క్రమం',
      sortSowing: 'క్రమం: నాటే నెల',
      sortName: 'క్రమం: పేరు',
      sortSeason: 'క్రమం: ఋతువు',
      waterFilter: 'నీటి ఫిల్టర్',
      any: 'ఏదైనా',
      low: 'తక్కువ',
      medium: 'మధ్యస్థ',
      high: 'ఎక్కువ',
      simpleView: 'సరళ దృశ్యం',
      advancedView: 'అధునాతన దృశ్యం',
      resultsFound: 'పంటలు కనుగొనబడ్డాయి',
    },
    bn: {
      cropCalendar: 'ফসল ক্যালেন্ডার',
      searchPlaceholder: 'ফসল খুঁজুন...',
      allSeasons: 'সব মৌসুম',
      allTypes: 'সব ধরণ',
      type: 'ধরণ',
      water: 'জল',
      soil: 'মাটি',
      yield: 'ফলন',
      sowing: 'রোপণ',
      harvesting: 'কাটা',
      noCrops: 'কোন ফসল পাওয়া যায়নি',
      adjustFilters: 'অনুসন্ধান বা ফিল্টার সামঞ্জস্য করুন',
      sortBy: 'ক্রম',
      sortSowing: 'ক্রম: রোপণের মাস',
      sortName: 'ক্রম: নাম',
      sortSeason: 'ক্রম: মৌসুম',
      waterFilter: 'জল ফিল্টার',
      any: 'যে কোনো',
      low: 'কম',
      medium: 'মাঝারি',
      high: 'উচ্চ',
      simpleView: 'সহজ দৃশ্য',
      advancedView: 'উন্নত দৃশ্য',
      resultsFound: 'টি ফসল পাওয়া গেছে',
    },
    gu: {
      cropCalendar: 'પાક કૅલેન્ડર',
      searchPlaceholder: 'પાક શોધો...',
      allSeasons: 'બધા ઋતુ',
      allTypes: 'બધા પ્રકાર',
      type: 'પ્રકાર',
      water: 'પાણી',
      soil: 'માટી',
      yield: 'ઉત્પાદન',
      sowing: 'રોપણ',
      harvesting: 'કાપવું',
      noCrops: 'કોઈ પાક મળ્યું નથી',
      adjustFilters: 'શોધ અથવા ફિલ્ટરો સમાયોજિત કરો',
      sortBy: 'ક્રમ',
      sortSowing: 'ક્રમ: રોપણ મહિનો',
      sortName: 'ક્રમ: નામ',
      sortSeason: 'ક્રમ: ઋતુ',
      waterFilter: 'પાણી ફિલ્ટર',
      any: 'કોઈપણ',
      low: 'ઓછું',
      medium: 'મધ્યમ',
      high: 'વધારે',
      simpleView: 'સરળ દૃશ્ય',
      advancedView: 'પ્રગતિશીલ દૃશ્ય',
      resultsFound: 'પાક મળ્યા',
    },
    mr: {
      cropCalendar: 'पीक दिनदर्शिका',
      searchPlaceholder: 'पीक शोधा...',
      allSeasons: 'सर्व ऋतू',
      allTypes: 'सर्व प्रकार',
      type: 'प्रकार',
      water: 'पाणी',
      soil: 'जमीन',
      yield: 'उत्पादन',
      sowing: 'लावणे',
      harvesting: 'कापणी',
      noCrops: 'कोणतीही पीक मिळाली नाही',
      adjustFilters: 'शोध किंवा फिल्टर समायोजित करा',
      sortBy: 'क्रम',
      sortSowing: 'क्रम: लावणी महिना',
      sortName: 'क्रम: नाव',
      sortSeason: 'क्रम: हंगाम',
      waterFilter: 'पाणी गाळणी',
      any: 'कोणतेही',
      low: 'कमी',
      medium: 'मध्यम',
      high: 'जास्त',
      simpleView: 'साधा दृश्य',
      advancedView: 'प्रगत दृश्य',
      resultsFound: 'पीक मिळाली',
    },
    pa: {
      cropCalendar: 'ਫਸਲ ਕੈਲੰਡਰ',
      searchPlaceholder: 'ਫਸਲਾਂ ਦੀ ਖੋਜ ਕਰੋ...',
      allSeasons: 'ਸਾਰੇ ਮੌਸਮ',
      allTypes: 'ਸਾਰੇ ਕਿਸਮਾਂ',
      type: 'ਕਿਸਮ',
      water: 'ਪਾਣੀ',
      soil: 'ਮਿੱਟੀ',
      yield: 'ਪੈਦਾਵਾਰ',
      sowing: 'ਬੋਨਾ',
      harvesting: 'ਕਟਾਈ',
      noCrops: 'ਕੋਈ ਫਸਲ ਨਹੀਂ ਮਿਲੀ',
      adjustFilters: 'ਖੋਜ ਜਾਂ ਫਿਲਟਰਾਂ ਨੂੰ ਸਮਾਯੋਜਿਤ ਕਰੋ',
      sortBy: 'ਕ੍ਰਮ',
      sortSowing: 'ਕ੍ਰਮ: ਬੀਜਣ ਮਹੀਨਾ',
      sortName: 'ਕ੍ਰਮ: ਨਾਮ',
      sortSeason: 'ਕ੍ਰਮ: ਮੌਸਮ',
      waterFilter: 'ਪਾਣੀ ਫਿਲਟਰ',
      any: 'ਕੋਈ ਵੀ',
      low: 'ਘੱਟ',
      medium: 'ਦਰਮਿਆਨਾ',
      high: 'ਵੱਧ',
      simpleView: 'ਸਧਾਰਣ ਦ੍ਰਿਸ਼',
      advancedView: 'ਉন্নਤ ਦ੍ਰਿਸ਼',
      resultsFound: 'ਫਸਲਾਂ ਮਿਲੀਆਂ',
    },
  }

  const t = (key: string): string => translations[language][key] ?? translations.en[key] ?? key

  const typeTranslations: Record<CropData['cropType'], Record<Language, string>> = {
    Cereal: { en: 'Cereal', hi: 'अनाज', ta: 'தானியம்', te: 'ధాన్యాలు', bn: 'শস্য', gu: 'અનાજ', mr: 'धान्य', pa: 'ਅਨਾਜ' },
    Pulses: { en: 'Pulses', hi: 'दालें', ta: 'பருப்புகள்', te: 'పప్పులు', bn: 'ডাল', gu: 'દાળ', mr: 'डाळी', pa: 'ਦਾਲਾਂ' },
    Oilseeds: { en: 'Oilseeds', hi: 'तिलहन', ta: 'எண்ணெய் விதைகள்', te: 'ఎండు ధాన్యాలు', bn: 'তেল বীজ', gu: 'તેલદાણાં', mr: 'तेलबियाणे', pa: 'ਤੇਲ ਦਾਣੇ' },
    Vegetables: { en: 'Vegetables', hi: 'सब्जियाँ', ta: 'காய்கறிகள்', te: 'కూరగాయలు', bn: 'সবজি', gu: 'શાકભાજી', mr: 'भाज्या', pa: 'ਸਬਜ਼ੀਆਂ' },
    Fruits: { en: 'Fruits', hi: 'फल', ta: 'பழங்கள்', te: 'పండ్లు', bn: 'ফল', gu: 'ફળો', mr: 'फळे', pa: 'ਫਲ' },
    Fibers: { en: 'Fibers', hi: 'रेशा', ta: 'இழைகள்', te: 'ఫైబర్లు', bn: 'ফাইবার', gu: 'રેશા', mr: 'तंतू', pa: 'ਰੇਸ਼ੇ' },
    All: { en: 'All', hi: 'सभी', ta: 'அனைத்து', te: 'అన్ని', bn: 'সব', gu: 'બધા', mr: 'सर्व', pa: 'ਸਾਰੇ' },
  }

  const tType = (type: CropData['cropType']) => typeTranslations[type][language] ?? typeTranslations[type].en

  const monthInitial = (m: number) => (getMonthName(m).charAt(0) || '').toUpperCase()

  // Map known crop icons (from public/crop-icons)
  const cropIconMap: Record<string, string> = {
    rice: '/crop-icons/rice.svg',
    wheat: '/crop-icons/wheat.svg',
    maize: '/crop-icons/maize.svg',
    barley: '/crop-icons/barley.svg',
    mustard: '/crop-icons/mustard.svg',
    cotton: '/crop-icons/cotton.svg',
    sugarcane: '/crop-icons/sugarcane.svg',
    watermelon: '/crop-icons/watermelon.svg',
    tomato: '/crop-icons/tomato.svg',
    moong: '/crop-icons/moong.svg',
  }

  const getCropIcon = (enName: string): string | undefined => {
    const key = enName.toLowerCase().replace(/\s+/g, '')
    if (cropIconMap[key]) return cropIconMap[key]
    // try simple key (first word)
    const fw = enName.split(' ')[0].toLowerCase()
    return cropIconMap[fw]
  }

  // month range as set, supports wrap-around (e.g., Oct(10) -> Feb(2))
  const getRangeMonths = (start: number, end: number): Set<number> => {
    const res = new Set<number>()
    if (start <= end) {
      for (let m = start; m <= end; m++) res.add(m)
    } else {
      for (let m = start; m <= 12; m++) res.add(m)
      for (let m = 1; m <= end; m++) res.add(m)
    }
    return res
  }

  // Extended crop data with more Indian crops
  const allCrops: CropData[] = [
    {
      id: 1,
      name: { en: 'Rice', hi: 'चावल', ta: 'அரிசி', te: 'బియ్యం', bn: 'ধান', gu: 'ચોખા', mr: 'तांदूळ', pa: 'ਚਾਵਲ' },
      season: 'Kharif',
      cropType: 'Cereal',
      sowingStart: 6, // June
      sowingEnd: 7,   // July
      harvestingStart: 10, // October
      harvestingEnd: 11,   // November
      description: {
        en: 'Major Kharif crop requiring plenty of water',
        hi: 'प्रमुख खरीफ फसल जिसके लिए पर्याप्त पानी की आवश्यकता होती है',
        ta: 'நீர் அதிகமாக தேவைப்படும் முக்கிய கரீஃப் பயிர்',
        te: 'చాలా నీరు అవసరమైన ప్రధాన ఖరీఫ్ పంట',
        bn: 'প্রচুর জল প্রয়োজন হয় এমন প্রধান খরিফ ফসল',
        gu: 'પ્રચુર પાણીની જરૂર ધરાવતી મુખ્ય ખરીફ પાક',
        mr: 'पुष्कळ पाण्याची आवश्यकता असलेली मुख्य खरीफ पीक',
        pa: 'ਬਹੁਤ ਸਾਰਾ ਪਾਣੀ ਚਾਹੁੰਦੀ ਹੈ ਮੁੱਖ ਖਰੀਫ ਫਸਲ'
      },
      waterRequirement: 'High',
      soilType: ['Clay', 'Loamy'],
      bestYield: '4-6 tons/hectare',
      icon: getCropIcon('Rice')
    },
    {
      id: 2,
      name: { en: 'Wheat', hi: 'गेहूँ', ta: 'கோதுமை', te: 'గోధుమ', bn: 'গম', gu: 'ઘઉં', mr: 'गहू', pa: 'ਕਣਕ' },
      season: 'Rabi',
      cropType: 'Cereal',
      sowingStart: 10, // October
      sowingEnd: 11,   // November
      harvestingStart: 3,  // March
      harvestingEnd: 4,    // April
      description: {
        en: 'Major Rabi crop sown in winter',
        hi: 'प्रमुख रबी फसल शीतकाल में बोई जाती है',
        ta: 'குளிர்காலத்தில் விதைக்கப்படும் முக்கிய ரபி பயிர்',
        te: 'శీతాకాలంలో నాటే ప్రధాన రబీ పంట',
        bn: 'শীতকালে রোপণ করা প্রধান রবি ফসল',
        gu: 'શિયાળામાં રોપવામાં આવતી મુખ્ય રબી પાક',
        mr: 'हिवाळ्यात लावलेली मुख्य रब्बी पीक',
        pa: 'ਸਰਦੀਆਂ ਵਿੱਚ ਲਗਾਈ ਜਾਣ ਵਾਲੀ ਮੁੱਖ ਰਬੀ ਫਸਲ'
      },
      waterRequirement: 'Medium',
      soilType: ['Loamy', 'Sandy Loam'],
      bestYield: '3-5 tons/hectare',
      icon: getCropIcon('Wheat')
    },
    {
      id: 3,
      name: { en: 'Maize', hi: 'मक्का', ta: 'சோளம்', te: 'మొక్కజొన్న', bn: 'ভুট্টা', gu: 'મકાઈ', mr: 'मका', pa: 'ਮੱਕੀ' },
      season: 'Kharif',
      cropType: 'Cereal',
      sowingStart: 6, // June
      sowingEnd: 8, // August
      harvestingStart: 9, // September
      harvestingEnd: 11, // November
      description: {
        en: 'Kharif cereal crop used for food and fodder',
        hi: 'खरीफ अनाज फसल जिसका उपयोग खाद्य और चारा के लिए किया जाता है',
        ta: 'உணவு மற்றும் தீன்றுகொள்ளுதலுக்காக பயன்படுத்தப்படும் கரீஃப் கோதுமை பயிர்',
        te: 'ఆహారం మరియు ఎండబెట్టుకోడానికి ఉపయోగించే ఖరీఫ్ ధాన్యం',
        bn: 'খাদ্য এবং চারা হিসাবে ব্যবহৃত খরিফ শস্য ফসল',
        gu: 'ખાદ્ય અને ચારો માટે ઉપયોગમાં લેવાતી ખરીફ અનાજની પાક',
        mr: 'अन्न आणि चारा म्हणून वापरली जाणारी खरीफ धान्य पीक',
        pa: 'ਖੁਰਾਕ ਅਤੇ ਚਾਰਾ ਲਈ ਵਰਤੀ ਜਾਣ ਵਾਲੀ ਖਰੀਫ ਅਨਾਜ ਫਸਲ'
      },
      waterRequirement: 'High',
      soilType: ['Loamy', 'Sandy Loam'],
      bestYield: '3-8 tons/hectare',
      icon: getCropIcon('Maize')
    },
    {
      id: 4,
      name: { en: 'Barley', hi: 'जौ', ta: 'வாற்கோதுமை', te: 'యవలు', bn: 'যব', gu: 'જવ', mr: 'जव', pa: 'ਜੌਂ' },
      season: 'Rabi',
      cropType: 'Cereal',
      sowingStart: 10, // October
      sowingEnd: 11, // November
      harvestingStart: 3, // March
      harvestingEnd: 4, // April
      description: {
        en: 'Rabi cereal crop tolerant to cold and drought',
        hi: 'रबी अनाज फसल जो ठंड और सूखे के प्रति सहनशील है',
        ta: 'குளிர் மற்றும் வறட்சிக்கு தாங்கும் ரபி கோதுமை பயிர்',
        te: 'చల్లడం మరియు వర్షం లేకపోవడం పట్ల ఓపిక కలిగిన రబీ ధాన్యం',
        bn: 'ঠান্ডা এবং শুকনো আবহাওয়ার প্রতি সহনশীল রবি শস্য ফসল',
        gu: 'શીત અને સૂકા પ્રત્યે સહનશીલ રબી અનાજની પાક',
        mr: 'थंड आणि ड्राऊट यांच्या प्रति सहनशील रब्बी धान्य पीक',
        pa: 'ਠੰਢ ਅਤੇ ਡਰਾਊਟ ਪ੍ਰਤੀ ਸਹਿਣਸ਼ੀਲ ਰਬੀ ਅਨਾਜ ਫਸਲ'
      },
      waterRequirement: 'Low',
      soilType: ['Sandy Loam', 'Loamy'],
      bestYield: '2-4 tons/hectare',
      icon: getCropIcon('Barley')
    },
    {
      id: 5,
      name: { en: 'Mustard', hi: 'सरसों', ta: 'கடுகு', te: 'ఆవాలు', bn: 'সরিষা', gu: 'રાઈ', mr: 'मोहरी', pa: 'ਸਰੋਂ' },
      season: 'Rabi',
      cropType: 'Oilseeds',
      sowingStart: 10, // October
      sowingEnd: 12, // December
      harvestingStart: 2, // February
      harvestingEnd: 4, // April
      description: {
        en: 'Major Rabi oilseed crop',
        hi: 'प्रमुख रबी तिलहन फसल',
        ta: 'முக்கிய ரபி எண்ணெய் பயிர்',
        te: 'ప్రధాన రబీ ఎండు ధాన్యం',
        bn: 'প্রধান রবি তেল ফসল',
        gu: 'મુખ્ય રબી તેલદાણાંની પાક',
        mr: 'मुख्य रब्बी तेलबियाणे पीक',
        pa: 'ਮੁੱਖ ਰਬੀ ਤੇਲ ਫਸਲ'
      },
      waterRequirement: 'Medium',
      soilType: ['Clay Loam', 'Loamy'],
      bestYield: '1-2 tons/hectare',
      icon: getCropIcon('Mustard')
    },
    {
      id: 6,
      name: { en: 'Cotton', hi: 'कपास', ta: 'பருத்தி', te: 'పత్తి', bn: 'তুলা', gu: 'કપાસ', mr: 'कापूस', pa: 'ਕਪਾਹ' },
      season: 'Kharif',
      cropType: 'Fibers',
      sowingStart: 5, // May
      sowingEnd: 7, // July
      harvestingStart: 10, // October
      harvestingEnd: 12, // December
      description: {
        en: 'Kharif fiber crop',
        hi: 'खरीफ रेशम फसल',
        ta: 'கரீஃப் இழை பயிர்',
        te: 'ఖరీఫ్ ఫైబర్ పంట',
        bn: 'খরিফ ফাইবার ফসল',
        gu: 'ખરીફ રેશમની પાક',
        mr: 'खरीफ फायबर पीक',
        pa: 'ਖਰੀਫ ਰੇਸ਼ਮ ਫਸਲ'
      },
      waterRequirement: 'Medium',
      soilType: ['Black', 'Loamy'],
      bestYield: '400-600 kg/hectare',
      icon: getCropIcon('Cotton')
    },
    {
      id: 7,
      name: { en: 'Sugarcane', hi: 'गन्ना', ta: 'கரும்பு', te: 'చెరకు', bn: 'আখ', gu: 'શેરડી', mr: 'ऊस', pa: 'ਗੰਨਾ' },
      season: 'Zaid',
      cropType: 'Cereal',
      sowingStart: 1, // January
      sowingEnd: 3, // March
      harvestingStart: 9, // September
      harvestingEnd: 12, // December
      description: {
        en: 'Long duration Zaid crop',
        hi: 'लंबी अवधि की ज़ैद फसल',
        ta: 'நீண்ட கால ஜைத் பயிர்',
        te: 'దీర్ఘకాలం పడిన జైత్ పంట',
        bn: 'দীর্ঘ সময়ের জাইদ ফসল',
        gu: 'લાંબા સમયની જૈત પાક',
        mr: 'दीर्घ कालीन जैत पीक',
        pa: 'ਲੰਬੇ ਸਮੇਂ ਦੀ ਜ਼ੈਦ ਫਸਲ'
      },
      waterRequirement: 'High',
      soilType: ['Alluvial', 'Black'],
      bestYield: '60-80 tons/hectare',
      icon: getCropIcon('Sugarcane')
    },
    {
      id: 8,
      name: { en: 'Watermelon', hi: 'तरबूज', ta: 'தர்பூசணி', te: 'బంతాకాయ', bn: 'তরমুজ', gu: 'તરબૂચ', mr: 'तरबूज', pa: 'ਤਰਬੂਜ਼' },
      season: 'Zaid',
      cropType: 'Fruits',
      sowingStart: 3, // March
      sowingEnd: 5, // May
      harvestingStart: 6, // June
      harvestingEnd: 8, // August
      description: {
        en: 'Summer Zaid fruit crop',
        hi: 'ग्रीष्मकालीन ज़ैद फल फसल',
        ta: 'கோடை ஜைத் பழ பயிர்',
        te: 'వేసవి జైత్ పండు పంట',
        bn: 'গ্রীষ্মকালীন জাইদ ফল ফসল',
        gu: 'ઉનાળાની જૈત ફળની પાક',
        mr: 'उन्हाळ्यातील जैत फळ पीक',
        pa: 'ਗਰਮੀਆਂ ਦੀ ਜ਼ੈਦ ਫਲ ਫਸਲ'
      },
      waterRequirement: 'High',
      soilType: ['Sandy Loam', 'Loamy'],
      bestYield: '20-30 tons/hectare',
      icon: getCropIcon('Watermelon')
    },
    {
      id: 9,
      name: { en: 'Groundnut', hi: 'मूंगफली', ta: 'நிலக்கடலை', te: 'భూభున్న', bn: 'চলা মেচ', gu: 'ચુખા', mr: 'भुईमूग', pa: 'ਮੰਗਫਲੀ' },
      season: 'Kharif',
      cropType: 'Oilseeds',
      sowingStart: 6, // June
      sowingEnd: 7, // July
      harvestingStart: 9, // September
      harvestingEnd: 10, // October
      description: {
        en: 'Kharif oilseed crop grown underground',
        hi: 'खरीफ तिलहन फसल जो भूमि के नीचे उगती है',
        ta: 'மண்ணடியில் வளரும் கரீஃப் எண்ணெய் பயிர்',
        te: 'భూగర్భంలో పెరిగే ఖరీఫ్ ఎండు ధాన్యం',
        bn: 'মাটির নিচে গজানো খরিফ তেল ফসল',
        gu: 'જમીન નીચે ઉગતી ખરીફ તેલદાણાંની પાક',
        mr: 'जमिनीखाली वाढणारी खरीफ तेलबियाणे पीक',
        pa: 'ਧਰਤੀ ਹੇਠਾਂ ਵਧਣ ਵਾਲੀ ਖਰੀਫ ਤੇਲ ਫਸਲ'
      },
      waterRequirement: 'Medium',
      soilType: ['Sandy Loam', 'Red'],
      bestYield: '1.5-2.5 tons/hectare'
    },
    {
      id: 10,
      name: { en: 'Pulses', hi: 'दालें', ta: 'பருப்புகள்', te: 'పప్పులు', bn: 'ডাল', gu: 'દાળ', mr: 'डाळी', pa: 'ਦਾਲਾਂ' },
      season: 'Rabi',
      cropType: 'Pulses',
      sowingStart: 10, // October
      sowingEnd: 11, // November
      harvestingStart: 2, // February
      harvestingEnd: 4, // April
      description: {
        en: 'Rabi pulse crops rich in protein',
        hi: 'प्रोटीन से समृद्ध रबी दाल फसलें',
        ta: 'புரதம் சத்தான ரபி பருப்பு பயிர்கள்',
        te: 'ప్రోటీన్ లో ధనికమైన రబీ పప్పు పంటలు',
        bn: 'প্রোটিন সমৃদ্ধ রবি ডাল ফসল',
        gu: 'પ્રોટીનથી સમૃદ્ધ રબી દાળની પાક',
        mr: 'प्रोटीनयुक्त रब्बी डाळी पीक',
        pa: 'ਪ੍ਰੋਟੀਨ ਨਾਲ ਭਰਪੂਰ ਰਬੀ ਦਾਲਾਂ ਦੀਆਂ ਫਸਲਾਂ'
      },
      waterRequirement: 'Low',
      soilType: ['Loamy', 'Sandy Loam'],
      bestYield: '0.8-1.5 tons/hectare',
      icon: getCropIcon('Moong')
    },
    {
      id: 11,
      name: { en: 'Potato', hi: 'आलू', ta: 'உருளைக்கிழங்கு', te: 'ఉల్లిగడ్డ', bn: 'আলু', gu: 'બટાટા', mr: 'बटाटा', pa: 'ਆਲੂ' },
      season: 'Rabi',
      cropType: 'Vegetables',
      sowingStart: 10, // October
      sowingEnd: 12, // December
      harvestingStart: 1, // January
      harvestingEnd: 3, // March
      description: {
        en: 'Cool season vegetable crop',
        hi: 'शीत ऋतु की सब्जी फसल',
        ta: 'குளிர்கால காய்கறி பயிர்',
        te: 'చల్లని ఋతువు కూరగాయల పంట',
        bn: 'শীতকালীন সবজি ফসল',
        gu: 'શિયાળાની શાકભાજીની પાક',
        mr: 'हिवाळ्यातील भाजीपाला पीक',
        pa: 'ਠੰਢੀ ਮੌਸਮ ਦੀ ਸਬਜ਼ੀ ਦੀ ਫਸਲ'
      },
      waterRequirement: 'Medium',
      soilType: ['Sandy Loam', 'Loamy'],
      bestYield: '15-25 tons/hectare'
    },
    {
      id: 12,
      name: { en: 'Onion', hi: 'प्याज', ta: 'வெங்காயம்', te: 'ఉల్లిపాయ', bn: 'পেঁয়াজ', gu: 'દુંગળી', mr: 'कांदा', pa: 'ਪਿਆਜ਼' },
      season: 'Rabi',
      cropType: 'Vegetables',
      sowingStart: 10, // October
      sowingEnd: 11, // November
      harvestingStart: 1, // January
      harvestingEnd: 2, // February
      description: {
        en: 'Rabi vegetable crop with high market value',
        hi: 'उच्च बाजार मूल्य वाली रबी सब्जी फसल',
        ta: 'அதிக சந்தை மதிப்புடைய ரபி காய்கறி பயிர்',
        te: 'అధిక మార్కెట్ విలువ కలిగిన రబీ కూరగాయల పంట',
        bn: 'উচ্চ বাজার মূল্যের রবি সবজি ফসল',
        gu: 'ઉચ્ચ બજાર મૂલ્ય ધરાવતી રબી શાકભાજીની પાક',
        mr: 'उच्च बाजार भावाची रब्बी भाजीपाला पीक',
        pa: 'ਉੱਚ ਬਾਜ਼ਾਰ ਮੁੱਲ ਵਾਲੀ ਰਬੀ ਸਬਜ਼ੀ ਦੀ ਫਸਲ'
      },
      waterRequirement: 'Low',
      soilType: ['Sandy Loam', 'Loamy'],
      bestYield: '10-15 tons/hectare'
    },
    // Added crops to expand coverage
    {
      id: 13,
      name: { en: 'Tomato', hi: 'टमाटर', ta: 'தக்காளி', te: 'టమోటా', bn: 'টমেটো', gu: 'ટમેટું', mr: 'टमाटर', pa: 'ਟਮਾਟਰ' },
      season: 'All',
      cropType: 'Vegetables',
      sowingStart: 7,
      sowingEnd: 10,
      harvestingStart: 10,
      harvestingEnd: 2,
      description: {
        en: 'Widely grown vegetable with multiple seasons', hi: 'टमाटर सब्जी कई मौसमों में उगाई जाती है', ta: 'பல பருவங்களில் பயிரிடப்படும் காய்கறி', te: 'అనేక ఋతువుల్లో పండించే కూరగాయ', bn: 'বহু মৌসুমে জন্মানো সবজি', gu: 'ઘણા ઋતુઓમાં ઉગાડાતી શાકભાજી', mr: 'अनेक हंगामात घेतली जाणारी भाजी', pa: 'ਕਈ ਮੌਸਮਾਂ ਵਿੱਚ ਉਗਾਈ ਜਾਂਦੀ ਸਬਜ਼ੀ'
      },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '25-40 tons/hectare',
      icon: getCropIcon('Tomato')
    },
    {
      id: 14,
      name: { en: 'Chickpea (Gram)', hi: 'चना', ta: 'கொண்டைக்கடலை', te: 'సెనగలు', bn: 'ছোলা', gu: 'ચણા', mr: 'हरभरा', pa: 'ਚਨਾ' },
      season: 'Rabi',
      cropType: 'Pulses',
      sowingStart: 10,
      sowingEnd: 11,
      harvestingStart: 2,
      harvestingEnd: 4,
      description: { en: 'Protein-rich pulse crop', hi: 'प्रोटीन से भरपूर दाल', ta: 'சத்து மிக்க பருப்பு', te: 'ప్రోటీన్ అధిక పప్పు', bn: 'প্রোটিন সমৃদ্ধ ডাল', gu: 'પ્રોટીન સમૃદ્ધ દાળ', mr: 'प्रथिनेयुक्त डाळ', pa: 'ਪ੍ਰੋਟੀਨ ਸੰਮ੍ਰਿੱਧ ਦਾਲ' },
      waterRequirement: 'Low',
      soilType: ['Loamy', 'Sandy Loam'],
      bestYield: '1-2 tons/hectare'
    },
    {
      id: 15,
      name: { en: 'Pigeon Pea (Tur/Arhar)', hi: 'अरहर', ta: 'துவரம்', te: 'కందులు', bn: 'আরহার', gu: 'તુવેર', mr: 'तूर', pa: 'ਅਰਹਰ' },
      season: 'Kharif',
      cropType: 'Pulses',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 11,
      harvestingEnd: 1,
      description: { en: 'Important Kharif pulse', hi: 'महत्वपूर्ण खरीफ दाल', ta: 'முக்கிய கரீஃப் பருப்பு', te: 'ప్రధాన ఖరీఫ్ పప్పు', bn: 'গুরুত্বপূর্ণ খরিফ ডাল', gu: 'મહત્વપૂર્ણ ખરીફ દાળ', mr: 'महत्वाची खरीफ डाळ', pa: 'ਮਹੱਤਵਪੂਰਨ ਖਰੀਫ ਦਾਲ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '1-2 tons/hectare'
    },
    {
      id: 16,
      name: { en: 'Lentil (Masoor)', hi: 'मसूर', ta: 'மசூர்', te: 'మసూర్', bn: 'মসুর', gu: 'મસૂર', mr: 'मसूर', pa: 'ਮਸੂਰ' },
      season: 'Rabi',
      cropType: 'Pulses',
      sowingStart: 10,
      sowingEnd: 11,
      harvestingStart: 2,
      harvestingEnd: 3,
      description: { en: 'Winter pulse crop', hi: 'शीतकालीन दाल', ta: 'குளிர்கால பருப்பு', te: 'శీత ఋతువు పప్పు', bn: 'শীতকালীন ডাল', gu: 'શિયાળુ દાળ', mr: 'हिवाळ्यातील डाळ', pa: 'ਸਰਦੀ ਦੀ ਦਾਲ' },
      waterRequirement: 'Low',
      soilType: ['Loamy'],
      bestYield: '1-1.5 tons/hectare'
    },
    {
      id: 17,
      name: { en: 'Soybean', hi: 'सोयाबीन', ta: 'சோயாபீன்', te: 'సోయాబీన్', bn: 'সয়াবিন', gu: 'સોયાબીન', mr: 'सोयाबीन', pa: 'ਸੋਯਾਬੀਨ' },
      season: 'Kharif',
      cropType: 'Oilseeds',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 9,
      harvestingEnd: 10,
      description: { en: 'Popular Kharif oilseed', hi: 'लोकप्रिय खरीफ तिलहन', ta: 'பிரபலமான கரீஃப் எண்ணெய்', te: 'ప్రసిద్ధ ఖరీఫ్ ఆయిల్‌సీడ్', bn: 'জনপ্রিয় খরিফ তেল ফসল', gu: 'લોકપ્રિય ખરીફ તેલદાણા', mr: 'लोकप्रिय खरीफ तेलबिया', pa: 'ਲੋਕਪ੍ਰਿਯ ਖਰੀਫ ਤੇਲਦਾਰ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '1.5-3 tons/hectare'
    },
    {
      id: 18,
      name: { en: 'Sorghum (Jowar)', hi: 'ज्वार', ta: 'சோளம் (சோர்கம்)', te: 'జోన్న', bn: 'জোয়ার', gu: 'જ્વાર', mr: 'ज्वारी', pa: 'ਜੋਆਰ' },
      season: 'Kharif',
      cropType: 'Cereal',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 10,
      harvestingEnd: 11,
      description: { en: 'Drought-tolerant cereal', hi: 'सूखा सहनशील अनाज', ta: 'வறட்சியைத் தாங்கும் தானியம்', te: 'ఎండను భరించే ధాన్యం', bn: 'খরা-সহনশীল শস্য', gu: 'સૂકા સહનશીલ અનાજ', mr: 'दुष्काळ सहनशील धान्य', pa: 'ਸੁੱਖਾ ਸਹਿਣਸ਼ੀਲ ਅਨਾਜ' },
      waterRequirement: 'Low',
      soilType: ['Red', 'Sandy Loam'],
      bestYield: '2-3 tons/hectare'
    },
    {
      id: 19,
      name: { en: 'Pearl Millet (Bajra)', hi: 'बाजरा', ta: 'கம்பு', te: 'బజ్రా', bn: 'বাজরা', gu: 'બાજરી', mr: 'बाजरी', pa: 'ਬਾਜਰਾ' },
      season: 'Kharif',
      cropType: 'Cereal',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 9,
      harvestingEnd: 10,
      description: { en: 'Hardy millet for arid regions', hi: 'शुष्क क्षेत्रों के लिए कठोर बाजरा', ta: 'வறண்ட பகுதிகளுக்கு உகந்த கம்பு', te: 'ఎడారి ప్రాంతాలకు సరైన బాజ్రా', bn: 'শুষ্ক অঞ্চলের জন্য উপযুক্ত মিলেট', gu: 'શુષ્ક વિસ્તારો માટે અનુકૂળ બાજરી', mr: 'अरिद भागांसाठी योग्य बाजरी', pa: 'ਸ਼ੁਸ਼ਕ ਖੇਤਰਾਂ ਲਈ ਉਚਿਤ ਬਾਜਰਾ' },
      waterRequirement: 'Low',
      soilType: ['Sandy'],
      bestYield: '1.5-2.5 tons/hectare'
    },
    {
      id: 20,
      name: { en: 'Finger Millet (Ragi)', hi: 'रागी', ta: 'கேழ்வரகு', te: 'రాగులు', bn: 'রাগি', gu: 'નાચણી', mr: 'नाचणी', pa: 'ਰਾਗੀ' },
      season: 'Kharif',
      cropType: 'Cereal',
      sowingStart: 6,
      sowingEnd: 8,
      harvestingStart: 10,
      harvestingEnd: 12,
      description: { en: 'Nutritious millet crop', hi: 'पौष्टिक मिलेट फसल', ta: 'சத்தான கேழ்வரகு', te: 'పౌష్టికమైన రాగులు', bn: 'পুষ্টিকর মিলেট', gu: 'પૌષ્ટિક નાચણી', mr: 'पौष्टिक नाचणी', pa: 'ਪੌਸ਼ਟੀਕ ਰਾਗੀ' },
      waterRequirement: 'Low',
      soilType: ['Red', 'Loamy'],
      bestYield: '1.5-2 tons/hectare'
    },
    {
      id: 21,
      name: { en: 'Sunflower', hi: 'सूरजमुखी', ta: 'சூரியகாந்தி', te: 'సూర్యకాంతి', bn: 'সূর্যমুখী', gu: 'સુર્યમુખી', mr: 'सूर्यमुखी', pa: 'ਸੂਰਜਮੁਖੀ' },
      season: 'Zaid',
      cropType: 'Oilseeds',
      sowingStart: 1,
      sowingEnd: 3,
      harvestingStart: 4,
      harvestingEnd: 6,
      description: { en: 'Edible oilseed crop', hi: 'खाद्य तेल तिलहन', ta: 'உண்ணக்கூடிய எண்ணெய் பயிர்', te: 'ఆహార నూనె పంట', bn: 'খাদ্য তেল ফসল', gu: 'ખાદ્ય તેલ પાક', mr: 'खाद्य तेल पीक', pa: 'ਖਾਣਯੋਗ ਤੇਲ ਫਸਲ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '1.2-2 tons/hectare'
    },
    {
      id: 22,
      name: { en: 'Sesame (Til)', hi: 'तिल', ta: 'எள்ளு', te: 'నువ్వులు', bn: 'তিল', gu: 'તલ', mr: 'तीळ', pa: 'ਤਿਲ' },
      season: 'Kharif',
      cropType: 'Oilseeds',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 9,
      harvestingEnd: 10,
      description: { en: 'Oilseed with high-quality oil', hi: 'उच्च गुणवत्ता तेल तिलहन', ta: 'உயர் தர எண்ணெய் பயிர்', te: 'ఉత్కృష్ట నూనె పంట', bn: 'উচ্চ মানের তেল ফসল', gu: 'ઉચ્ચ ગુણવત્તાવાળું તેલદાણું', mr: 'उच्च दर्जाचे तेलबिया', pa: 'ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲੀ ਤੇਲ ਫਸਲ' },
      waterRequirement: 'Low',
      soilType: ['Sandy', 'Loamy'],
      bestYield: '0.6-1.2 tons/hectare'
    },
    {
      id: 23,
      name: { en: 'Rapeseed', hi: 'तोरी', ta: 'எண்ணெய் கொள்', te: 'రేప్‌సీడ్', bn: 'রেপসিড', gu: 'રાયડો', mr: 'रायडा', pa: 'ਰੇਪਸੀਡ' },
      season: 'Rabi',
      cropType: 'Oilseeds',
      sowingStart: 10,
      sowingEnd: 11,
      harvestingStart: 2,
      harvestingEnd: 3,
      description: { en: 'Rabi oilseed similar to mustard', hi: 'सरसों जैसी रबी तिलहन', ta: 'கடுகுக்கு ஒத்த ரபி எண்ணெய்', te: 'ఆవాలకు సమానమైన రబీ ఆయిల్‌సీడ్', bn: 'সরিষার মতো রবি তেল ফসল', gu: 'રાઈ જેવી રબી તેલદાળા', mr: 'मोहरीसारखे रब्बी तेलबिया', pa: 'ਸਰੋਂ ਵਰਗਾ ਰਬੀ ਤੇਲਦਾਰ' },
      waterRequirement: 'Low',
      soilType: ['Loamy'],
      bestYield: '1-2 tons/hectare'
    },
    {
      id: 24,
      name: { en: 'Banana', hi: 'केला', ta: 'வாழை', te: 'అరటి', bn: 'কলা', gu: 'કેળું', mr: 'केळी', pa: 'ਕੇਲਾ' },
      season: 'All',
      cropType: 'Fruits',
      sowingStart: 1,
      sowingEnd: 12,
      harvestingStart: 9,
      harvestingEnd: 12,
      description: { en: 'Year-round fruit crop', hi: 'सालभर का फल', ta: 'ஆண்டு முழுவதும் கிடைக்கும் பழம்', te: 'సంవత్సరం అంతా పండే పండు', bn: 'সারা বছর ফল', gu: 'વર્ષભરનું ફળ', mr: 'वर्षभर उपलब्ध फळ', pa: 'ਸਾਲਭਰ ਦਾ ਫਲ' },
      waterRequirement: 'High',
      soilType: ['Alluvial', 'Loamy'],
      bestYield: '40-60 tons/hectare'
    },
    {
      id: 25,
      name: { en: 'Cauliflower', hi: 'फूलगोभी', ta: 'காலிஃப்ளவர்', te: 'కాఫీ పూలు', bn: 'ফুলকপি', gu: 'ફુલાવર', mr: 'फुलकोबी', pa: 'ਫੁੱਲਗੋਭੀ' },
      season: 'Rabi',
      cropType: 'Vegetables',
      sowingStart: 9,
      sowingEnd: 10,
      harvestingStart: 12,
      harvestingEnd: 2,
      description: { en: 'Cool season vegetable', hi: 'शीत ऋतु की सब्जी', ta: 'குளிர்கால காய்கறி', te: 'చల్లని ఋతువు కూరగాయ', bn: 'শীতকালীন সবজি', gu: 'શિયાળુ શાકભાજી', mr: 'हिवाळी भाजी', pa: 'ਸਰਦੀਆਂ ਦੀ ਸਬਜ਼ੀ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '15-25 tons/hectare'
    },
    {
      id: 26,
      name: { en: 'Cabbage', hi: 'पत्तागोभी', ta: 'முட்டைக்கோசு', te: 'క్యాబేజీ', bn: 'বাঁধাকপি', gu: 'કોબી', mr: 'कोबी', pa: 'ਪਤਾਗੋਭੀ' },
      season: 'Rabi',
      cropType: 'Vegetables',
      sowingStart: 9,
      sowingEnd: 10,
      harvestingStart: 12,
      harvestingEnd: 2,
      description: { en: 'Winter vegetable crop', hi: 'सर्दियों की सब्जी', ta: 'குளிர்கால காய்கறி', te: 'శీత ఋతువు కూరగాయ', bn: 'শীতকালীন সবজি', gu: 'શિયાળુ શાકભાજી', mr: 'हिवाळ्यातील भाजी', pa: 'ਸਰਦੀ ਦੀ ਸਬਜ਼ੀ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '20-30 tons/hectare'
    },
    {
      id: 27,
      name: { en: 'Okra (Ladyfinger)', hi: 'भिंडी', ta: 'வெண்டைக்காய்', te: 'బెండకాయ', bn: 'ঢেঁড়স', gu: 'ભીંડા', mr: 'भेंडी', pa: 'ਭਿੰਡੀ' },
      season: 'Zaid',
      cropType: 'Vegetables',
      sowingStart: 2,
      sowingEnd: 4,
      harvestingStart: 5,
      harvestingEnd: 7,
      description: { en: 'Summer vegetable crop', hi: 'ग्रीष्मकालीन सब्जी', ta: 'கோடை காய்கறி', te: 'వేసవి కూరగాయ', bn: 'গ্রীষ্মকালীন সবজি', gu: 'ઉનાળુ શાકભાજી', mr: 'उन्हाळ्यातील भाजी', pa: 'ਗਰਮੀਆਂ ਦੀ ਸਬਜ਼ੀ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy', 'Sandy Loam'],
      bestYield: '8-12 tons/hectare'
    },
    {
      id: 28,
      name: { en: 'Brinjal (Eggplant)', hi: 'बैंगन', ta: 'கத்தரிக்காய்', te: 'వంకాయ', bn: 'বেগুন', gu: 'રીંગણ', mr: 'वांगी', pa: 'ਬੈਂਗਣ' },
      season: 'All',
      cropType: 'Vegetables',
      sowingStart: 7,
      sowingEnd: 10,
      harvestingStart: 10,
      harvestingEnd: 3,
      description: { en: 'Widely grown vegetable', hi: 'व्यापक रूप से उगाई जाने वाली सब्जी', ta: 'விரைவாக பயிரிடப்படும் காய்கறி', te: 'విస్తృతంగా పండించే కూరగాయ', bn: 'বিস্তৃতভাবে চাষ করা সবজি', gu: 'વ્યાપક રીતે ઉગાડાતી શાકભાજી', mr: 'प्रचलित भाजी', pa: 'ਵਿਆਪਕ ਤੌਰ ਤੇ ਉਗਾਈ ਜਾਂਦੀ ਸਬਜ਼ੀ' },
      waterRequirement: 'Medium',
      soilType: ['Loamy'],
      bestYield: '20-35 tons/hectare'
    },
    {
      id: 29,
      name: { en: 'Green Gram (Moong)', hi: 'मूंग', ta: 'பயிறு', te: 'పెసర్లు', bn: 'মুগ', gu: 'મગ', mr: 'मुग', pa: 'ਮੂੰਗ' },
      season: 'Kharif',
      cropType: 'Pulses',
      sowingStart: 6,
      sowingEnd: 7,
      harvestingStart: 9,
      harvestingEnd: 10,
      description: { en: 'Short duration pulse', hi: 'कम अवधि की दाल', ta: 'குறைந்த கால பருப்பு', te: 'తక్కువ వ్యవధి పప్పు', bn: 'স্বল্প মেয়াদী ডাল', gu: 'ટૂંકા ગાળાની દાળ', mr: 'अल्पकालीन डाळ', pa: 'ਛੋਟੀ ਮਿਆਦ ਦੀ ਦਾਲ' },
      waterRequirement: 'Low',
      soilType: ['Sandy Loam'],
      bestYield: '0.8-1.2 tons/hectare',
      icon: getCropIcon('Moong')
    }
  ]

  // Filter crops based on search and filters
  const filteredCrops = allCrops.filter(crop => {
    const matchesSearch = crop.name[language].toLowerCase().includes(searchQuery.toLowerCase()) || 
                          crop.description?.[language].toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeason = selectedSeason === 'All' || crop.season === selectedSeason
    const matchesCropType = selectedCropType === 'All' || crop.cropType === selectedCropType
    const matchesWater = waterFilter === 'Any' || crop.waterRequirement === waterFilter
    
    return matchesSearch && matchesSeason && matchesCropType && matchesWater
  })

  // Sort crops
  const sortedCrops = [...filteredCrops].sort((a, b) => {
    if (sortBy === 'name') return a.name.en.localeCompare(b.name.en)
    if (sortBy === 'season') return a.season.localeCompare(b.season)
    // default by sowing start month
    return a.sowingStart - b.sowingStart
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 mb-4 shadow-lg">
            <Calendar className="text-green-600 dark:text-green-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">{t('cropCalendar')}</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-base sm:text-lg">
            {language === 'hi'
              ? 'अपनी फसलों के लिए समय पर बोने और काटने की जानकारी प्राप्त करें। इस कैलेंडर का उपयोग करके अपनी फसलों की उपज को अधिकतम करें।'
              : language === 'ta'
                ? 'உங்கள் பயிர்களை நேரம் செலுத்தி விதைக்கவும் மற்றும் அறுவடை செய்யவும் தகவலைப் பெறுங்கள். இந்த நாட்காட்டியைப் பயன்படுத்தி உங்கள் பயிர் விளைச்சலை அதிகரிக்கவும்.'
                : language === 'te'
                  ? 'మీ పంటలను సమయానికి నాటడం మరియు పంట కోసడం కోసం సమాచారం పొందండి. ఈ క్యాలెండర్‌ను ఉపయోగించడం ద్వారా మీ పంట దిగుబడిని గరిష్ఠం చేయండి.'
                  : language === 'bn'
                    ? 'আপনার ফসলগুলি সময়মতো রোপণ এবং ফসল কাটার জন্য তথ্য পান। এই ক্যালেন্ডারটি ব্যবহার করে আপনার ফসলের ফলন সর্বাধিক করুন।'
                    : language === 'gu'
                      ? 'તમારા પાકના સમયસર રોપણ અને કાપવા માટે માહિતી મેળવો. આ કૅલેન્ડરનો ઉપયોગ કરીને તમારા પાકની ઉપજ વધારો.'
                      : language === 'mr'
                        ? 'तुमच्या पिकांच्या वेळेवर लावण्यासाठी आणि कापण्यासाठी माहिती मिळवा. या दिनदर्शिकेचा वापर करून तुमच्या पिकाची उत्पादन वाढवा.'
                        : language === 'pa'
                          ? 'ਆਪਣੀਆਂ ਫਸਲਾਂ ਨੂੰ ਸਮੇਂ ਸਿੱਟਣ ਅਤੇ ਕਟਾਈ ਲਈ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ। ਇਸ ਕੈਲੰਡਰ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀ ਪੈਦਾਵਾਰ ਵਧਾਓ।'
                          : 'Get timely information for sowing and harvesting your crops. Maximize your crop yield by using this calendar.'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg shadow-md p-4 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Season Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Sun className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value as 'Kharif' | 'Rabi' | 'Zaid' | 'All')}
                >
                  <option value="All">{t('allSeasons')}</option>
                  <option value="Kharif">Kharif ({language === 'hi' ? 'खरीफ' : 'Monsoon'})</option>
                  <option value="Rabi">Rabi ({language === 'hi' ? 'रबी' : 'Winter'})</option>
                  <option value="Zaid">Zaid ({language === 'hi' ? 'जैद' : 'Summer'})</option>
                </select>
              </div>
            </div>

            {/* Crop Type Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Sprout className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  value={selectedCropType}
                  onChange={(e) => setSelectedCropType(e.target.value as 'Cereal' | 'Oilseeds' | 'Fibers' | 'Fruits' | 'Pulses' | 'Vegetables' | 'All')}
                >
                  <option value="All">{t('allTypes')}</option>
                  <option value="Cereal">{tType('Cereal')}</option>
                  <option value="Pulses">{tType('Pulses')}</option>
                  <option value="Oilseeds">{tType('Oilseeds')}</option>
                  <option value="Vegetables">{tType('Vegetables')}</option>
                  <option value="Fruits">{tType('Fruits')}</option>
                  <option value="Fibers">{tType('Fibers')}</option>
                </select>
              </div>
            </div>

            {/* Water Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  value={waterFilter}
                  onChange={(e) => setWaterFilter(e.target.value as any)}
                >
                  <option value="Any">{t('waterFilter')}: {t('any')}</option>
                  <option value="Low">{t('waterFilter')}: {t('low')}</option>
                  <option value="Medium">{t('waterFilter')}: {t('medium')}</option>
                  <option value="High">{t('waterFilter')}: {t('high')}</option>
                </select>
              </div>
            </div>

            {/* Sort By */}
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'sowingStart' | 'name' | 'season')}
                >
                  <option value="sowingStart">{t('sortSowing')}</option>
                  <option value="name">{t('sortName')}</option>
                  <option value="season">{t('sortSeason')}</option>
                </select>
              </div>
            </div>

            {/* Simple/Advanced toggle */}
            <div className="w-full md:w-48 flex items-center">
              <button
                onClick={() => setSimpleView(v => !v)}
                className="w-full p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {simpleView ? t('advancedView') : t('simpleView')}
              </button>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex flex-wrap rounded-md shadow-sm" role="group">
            {(['en', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-3 py-2 text-sm font-medium ${
                  language === lang
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-600 first:rounded-l-lg last:rounded-r-lg`}
              >
                {lang === 'en' ? 'English' : 
                 lang === 'hi' ? 'हिंदी' : 
                 lang === 'ta' ? 'தமிழ்' : 
                 lang === 'te' ? 'తెలుగు' : 
                 lang === 'bn' ? 'বাংলা' : 
                 lang === 'gu' ? 'ગુજરાતી' : 
                 lang === 'mr' ? 'मराठी' : 'ਪੰਜਾਬੀ'}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">{filteredCrops.length} {t('resultsFound')}</p>
        </div>

        {/* Crop List */}
        {sortedCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedCrops.map(crop => {
              const sowSet = getRangeMonths(crop.sowingStart, crop.sowingEnd)
              const harvSet = getRangeMonths(crop.harvestingStart, crop.harvestingEnd)
              const iconSrc = crop.icon ?? getCropIcon(crop.name.en)
              return (
                <div key={crop.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {iconSrc ? (
                        <img src={iconSrc} alt="" className="w-10 h-10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100 flex items-center justify-center font-bold">
                          {crop.name.en.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{crop.name[language]}</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-300">{t('type')}: {tType(crop.cropType)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      crop.season === 'Kharif'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : crop.season === 'Rabi'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : crop.season === 'Zaid'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                    }`}>{crop.season}</span>
                  </div>

                  {crop.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{crop.description[language]}</p>
                  )}

                  {/* Timeline */}
                  <div className="mt-1">
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const sow = sowSet.has(m)
                        const harv = harvSet.has(m)
                        const base = 'h-2 rounded-sm'
                        const cls = sow && harv
                          ? 'bg-gradient-to-b from-green-500 to-amber-500'
                          : sow
                            ? 'bg-green-500'
                            : harv
                              ? 'bg-amber-500'
                              : 'bg-gray-200 dark:bg-gray-600'
                        return <div key={m} className={`${base} ${cls}`} title={`${getMonthName(m)}`}></div>
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-300 mt-1">
                      {Array.from({ length: 12 }, (_, i) => monthInitial(i+1)).map((l, idx) => (
                        <span key={idx}>{l}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 dark:text-gray-300">
                      <div className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-green-500"></span> {t('sowing')}</div>
                      <div className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-amber-500"></span> {t('harvesting')}</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className={`mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 ${simpleView ? 'hidden sm:grid' : ''}`}>
                    <div className="flex items-center"><CloudRain className="w-3 h-3 mr-1"/> {t('water')}: {crop.waterRequirement}</div>
                    <div className="flex items-center"><Wind className="w-3 h-3 mr-1"/> {t('soil')}: {crop.soilType.join(', ')}</div>
                    <div className="col-span-2"> <span className="font-medium">{t('yield')}:</span> {crop.bestYield}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {language === 'hi' ? 'कोई फसल नहीं मिली' : language === 'ta' ? 'பயிர்கள் எதுவும் கிடைக்கவில்லை' : language === 'te' ? 'పంటలు ఏవీ కనబడలేదు' : language === 'bn' ? 'কোন ফসল পাওয়া যায়নি' : language === 'gu' ? 'કોઈ પાક મળ્યું નથી' : language === 'mr' ? 'कोणतीही पीक मिळाली नाही' : language === 'pa' ? 'ਕੋਈ ਫਸਲ ਨਹੀਂ ਮਿਲੀ' : 'No crops found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'hi'
                ? 'अपने खोज या फ़िल्टर को समायोजित करने का प्रयास करें'
                : language === 'ta' ? 'உங்கள் தேடல் அல்லது வடிப்பான்களைச் சரிசெய்ய முயற்சிக்கவும்'
                : language === 'te' ? 'మీ శోధన లేదా ఫిల్టర్లను సర్దుబాటు చేయడానికి ప్రయత్నించండి'
                : language === 'bn' ? 'আপনার অনুসন্ধান বা ফিল্টার সামঞ্জস্য করার চেষ্টা করুন'
                : language === 'gu' ? 'તમારી શોધ અથવા ફિલ્ટરોને સમાયોજિત કરવાનો પ્રયત્ન કરો'
                : language === 'mr' ? 'तुमच्या शोध किंवा फिल्टरची समायोजने करण्याचा प्रयत्न करा'
                : language === 'pa' ? 'ਆਪਣੀ ਖੋਜ ਜਾਂ ਫਿਲਟਰਾਂ ਨੂੰ ਸਮਾਯੋਜਿਤ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {language === 'hi' ? 'कैलेंडर कैसे उपयोग करें' : 
             language === 'ta' ? 'நாட்காட்டியை எவ்வாறு பயன்படுத்துவது' : 
             language === 'te' ? 'క్యాలెండర్‌ను ఎలా ఉపయోగించాలి' : 
             language === 'bn' ? 'ক্যালেন্ডার কিভাবে ব্যবহার করবেন' : 
             language === 'gu' ? 'કૅલેન્ડર કેવી રીતે ઉપયોગ કરવો' : 
             language === 'mr' ? 'दिनदर्शिका कशी वापरावी' : 
             language === 'pa' ? 'ਕੈਲੰਡਰ ਕਿਵੇਂ ਵਰਤਣਾ ਹੈ' : 
             'How to Use the Calendar'}
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>
              {language === 'hi' ? 'अपनी स्थानीय मौसम स्थितियों के अनुसार बोने और काटने के समय को समायोजित करें' : 
               language === 'ta' ? 'உங்கள் உள்ளூர் வானிலை நிலைகளைப் பொறுத்து விதைப்பதற்கும் அறுவடை செய்வதற்கும் நேரத்தைச் சரிசெய்யவும்' : 
               language === 'te' ? 'మీ స్థానిక వాతావరణ పరిస్థితులను బట్టి నాటడం మరియు పంట కోసడానికి సమయాన్ని సర్దుబాటు చేయండి' : 
               language === 'bn' ? 'আপনার স্থানীয় আবহাওয়ার অবস্থার ভিত্তিতে রোপণ এবং ফসল কাটার সময় সামঞ্জস্য করুন' : 
               language === 'gu' ? 'તમારી સ્થાનિક હવામાનની સ્થિતિને આધારે રોપણ અને કાપવાનો સમય સમાયોજિત કરો' : 
               language === 'mr' ? 'तुमच्या स्थानिक हवामानाच्या परिस्थितींनुसार लावण्याची आणि कापण्याची वेळ समायोजित करा' : 
               language === 'pa' ? 'ਆਪਣੀ ਸਥਾਨਕ ਮੌਸਮ ਸਥਿਤੀਆਂ ਦੇ ਅਧਾਰ \'ਤੇ ਬੋਨੇ ਅਤੇ ਕੱਟਣ ਦੇ ਸਮੇਂ ਨੂੰ ਸਮਾਯੋਜਿਤ ਕਰੋ' : 
               'Adjust sowing and harvesting times based on your local weather conditions'}
            </li>
            <li>
              {language === 'hi' ? 'पानी, मिट्टी और उत्पादन की जानकारी का उपयोग अपनी फसल की योजना बनाने के लिए करें' : 
               language === 'ta' ? 'உங்கள் பயிர்களுக்கான திட்டமிடுவதற்கு நீர், மண் மற்றும் விளைச்சல் தகவல்களைப் பயன்படுத்தவும்' : 
               language === 'te' ? 'మీ పంటల ప్రణాళిక కోసం నీరు, నేల మరియు దిగుబడి సమాచారాన్ని ఉపయోగించండి' : 
               language === 'bn' ? 'আপনার ফসলের পরিকল্পনা করতে জল, মাটি এবং ফলনের তথ্য ব্যবহার করুন' : 
               language === 'gu' ? 'તમારા પાકની યોજના બનાવવા માટે પાણી, માટી અને ઉત્પાદન માહિતીનો ઉપયોગ કરો' : 
               language === 'mr' ? 'तुमच्या पिकांची योजना तयार करण्यासाठी पाणी, जमीन आणि उत्पादन माहितीचा वापर करा' : 
               language === 'pa' ? 'ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀ ਯੋਜਨਾ ਬਣਾਉਣ ਲਈ ਪਾਣੀ, ਮਿੱਟੀ ਅਤੇ ਪੈਦਾਵਾਰ ਦੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਰੋ' : 
               'Use water, soil, and yield information to plan your crops'}
            </li>
            <li>
              {language === 'hi' ? 'ऋतु, प्रकार और खोज फ़िल्टर का उपयोग करके अपने लिए सबसे उपयुक्त फसल ढूंढें' : 
               language === 'ta' ? 'உங்களுக்கு ஏற்ற பயிர்களைக் கண்டுபிடிக்க வருடம், வகை மற்றும் தேடல் வடிப்பான்களைப் பயன்படுத்தவும்' : 
               language === 'te' ? 'మీకు అనుకూలమైన పంటలను కనుగొనడానికి ఋతువు, రకం మరియు శోధన ఫిల్టర్లను ఉపయోగించండి' : 
               language === 'bn' ? 'আপনার জন্য উপযুক্ত ফসল খুঁজে পেতে মৌসুম, ধরণ এবং অনুসন্ধান ফিল্টার ব্যবহার করুন' : 
               language === 'gu' ? 'તમારા માટે યોગ્ય પાક શોધવા માટે ઋતુ, પ્રકાર અને શોધ ફિલ્ટરનો ઉપયોગ કરો' : 
               language === 'mr' ? 'तुमच्यासाठी योग्य पीक शोधण्यासाठी ऋतू, प्रकार आणि शोध फिल्टरचा वापर करा' : 
               language === 'pa' ? 'ਆਪਣੇ ਲਈ ਢੁਕਵੀਆਂ ਫਸਲਾਂ ਲੱਭਣ ਲਈ ਮੌਸਮ, ਕਿਸਮ ਅਤੇ ਖੋਜ ਫਿਲਟਰਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ' : 
               'Use season, type, and search filters to find the most suitable crops for you'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}