import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

// Indian languages with voice support
const languages = [
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' }
]

// Translations for key phrases
const translations = {
  en: {
    voiceOrder: 'Voice Order',
    tapToSpeak: 'Tap to Speak',
    releaseToSend: 'Release to Send',
    listening: 'Listening...',
    vendor: 'Vendor',
    supplier: 'Supplier',
    startSelling: 'Start Selling',
    startSupplying: 'Start Supplying',
    changeLanguage: 'Language',
    processing: 'Processing...',
    speakYourOrder: 'Speak your order',
    holdAndSpeak: 'Hold and speak your order in any language',
    // Vendor Dashboard
    welcomeVendor: 'Welcome, Vendor!',
    enterPhoneNumber: 'Enter your phone number to get started with voice ordering',
    continueToDashboard: 'Continue to Dashboard',
    vendorDashboard: 'Vendor Dashboard',
    newOrder: '+ New Order',
    totalOrders: 'Total Orders',
    pending: 'Pending',
    pooled: 'Pooled',
    delivered: 'Delivered',
    recentOrders: 'Your Recent Orders',
    noOrdersYet: 'No orders yet',
    startFirstOrder: 'Start by placing your first voice order',
    placeFirstOrder: 'Place Your First Order',
    // Supplier Dashboard
    welcomeSupplier: 'Welcome, Supplier!',
    supplierDashboard: 'Supplier Dashboard',
    availablePools: 'Available Order Pools',
    mySupplies: 'My Supplies',
    // Order Pool
    orderPools: 'Order Pools',
    joinPool: 'Join Pool',
    // Common
    status: 'Status',
    amount: 'Amount',
    location: 'Location',
    date: 'Date',
    // Navigation
    home: 'Home',
    // Instructions  
    press: 'Press',
    speak: 'Speak',
    release: 'Release',
    yourOrder: 'Your Order'
  },
  hi: {
    voiceOrder: 'आवाज ऑर्डर',
    tapToSpeak: 'बोलने के लिए दबाएं',
    releaseToSend: 'भेजने के लिए छोड़ें',
    listening: 'सुन रहे हैं...',
    vendor: 'विक्रेता',
    supplier: 'आपूर्तिकर्ता',
    startSelling: 'बेचना शुरू करें',
    startSupplying: 'आपूर्ति शुरू करें',
    changeLanguage: 'भाषा',
    processing: 'प्रसंस्करण...',
    speakYourOrder: 'अपना ऑर्डर बोलें',
    holdAndSpeak: 'किसी भी भाषा में अपना ऑर्डर बोलें',
    // Vendor Dashboard
    welcomeVendor: 'स्वागत है, विक्रेता!',
    enterPhoneNumber: 'आवाज ऑर्डरिंग शुरू करने के लिए अपना फोन नंबर दर्ज करें',
    continueToDashboard: 'डैशबोर्ड पर जारी रखें',
    vendorDashboard: 'विक्रेता डैशबोर्ड',
    newOrder: '+ नया ऑर्डर',
    totalOrders: 'कुल ऑर्डर',
    pending: 'लंबित',
    pooled: 'पूल किया गया',
    delivered: 'वितरित',
    recentOrders: 'आपके हालिया ऑर्डर',
    noOrdersYet: 'अभी तक कोई ऑर्डर नहीं',
    startFirstOrder: 'अपना पहला आवाज ऑर्डर देकर शुरू करें',
    placeFirstOrder: 'अपना पहला ऑर्डर दें',
    // Supplier Dashboard
    welcomeSupplier: 'स्वागत है, आपूर्तिकर्ता!',
    supplierDashboard: 'आपूर्तिकर्ता डैशबोर्ड',
    availablePools: 'उपलब्ध ऑर्डर पूल',
    mySupplies: 'मेरी आपूर्ति',
    // Order Pool
    orderPools: 'ऑर्डर पूल',
    joinPool: 'पूल में शामिल हों',
    // Common
    status: 'स्थिति',
    amount: 'राशि',
    location: 'स्थान',
    date: 'दिनांक',
    // Navigation
    home: 'घर'
  },
  ta: {
    voiceOrder: 'குரல் ஆர்டர்',
    tapToSpeak: 'பேச அழுத்தவும்',
    releaseToSend: 'அனுப்ப விடுங்கள்',
    listening: 'கேட்டுக்கொண்டிருக்கிறோம்...',
    vendor: 'விற்பனையாளர்',
    supplier: 'சப்ளையர்',
    startSelling: 'விற்க ஆரம்பிக்கவும்',
    startSupplying: 'சப்ளை செய்ய ஆரம்பிக்கவும்',
    changeLanguage: 'மொழி',
    processing: 'செயலாக்கப்படுகிறது...',
    speakYourOrder: 'உங்கள் ஆர்டரைப் பேசுங்கள்',
    holdAndSpeak: 'எந்த மொழியிலும் உங்கள் ஆர்டரைப் பேசுங்கள்',
    // Vendor Dashboard
    welcomeVendor: 'வரவேற்கிறோம், விற்பனையாளர்!',
    enterPhoneNumber: 'குரல் ஆர்டரிங் தொடங்க உங்கள் போன் எண்ணை உள்ளிடவும்',
    continueToDashboard: 'டாஷ்போர்டுக்கு தொடரவும்',
    vendorDashboard: 'விற்பனையாளர் டாஷ்போர்ட்',
    newOrder: '+ புதிய ஆர்டர்',
    totalOrders: 'மொத்த ஆர்டர்கள்',
    pending: 'நிலுவையில்',
    pooled: 'பூல் செய்யப்பட்ட',
    delivered: 'வழங்கப்பட்ட',
    recentOrders: 'உங்கள் சமீபத்திய ஆர்டர்கள்',
    noOrdersYet: 'இன்னும் ஆர்டர்கள் இல்லை',
    startFirstOrder: 'உங்கள் முதல் குரல் ஆர்டரை வைத்து தொடங்குங்கள்',
    placeFirstOrder: 'உங்கள் முதல் ஆர்டரை வைக்கவும்',
    // Supplier Dashboard
    welcomeSupplier: 'வரவேற்கிறோம், சப்ளையர்!',
    supplierDashboard: 'சப்ளையர் டாஷ்போர்ட்',
    availablePools: 'கிடைக்கக்கூடிய ஆர்டர் பூல்கள்',
    mySupplies: 'என் சப்ளைகள்',
    // Order Pool
    orderPools: 'ஆர்டர் பூல்கள்',
    joinPool: 'பூலில் சேரவும்',
    // Common
    status: 'நிலை',
    amount: 'தொகை',
    location: 'இடம்',
    date: 'தேதி',
    // Navigation
    home: 'முகப்பு'
  },
  te: {
    voiceOrder: 'వాయిస్ ఆర్డర్',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    releaseToSend: 'పంపడానికి వదిలేయండి',
    listening: 'వింటున్నాము...',
    vendor: 'విక్రేత',
    supplier: 'సరఫరాదారు',
    startSelling: 'అమ్మకం మొదలుపెట్టండి',
    startSupplying: 'సరఫరా మొదలుపెట్టండి',
    changeLanguage: 'భాష',
    processing: 'ప్రాసెసింగ్...',
    speakYourOrder: 'మీ ఆర్డర్ చెప్పండి',
    holdAndSpeak: 'ఏ భాషలోనైనా మీ ఆర్డర్ చెప్పండి',
    // Vendor Dashboard
    welcomeVendor: 'స్వాగతం, విక్రేత!',
    enterPhoneNumber: 'వాయిస్ ఆర్డరింగ్ ప్రారంభించడానికి మీ ఫోన్ నంబర్ ఎంటర్ చేయండి',
    continueToDashboard: 'డాష్‌బోర్డ్‌కు కొనసాగండి',
    vendorDashboard: 'విక్రేత డాష్‌బోర్డ్',
    newOrder: '+ కొత్త ఆర్డర్',
    totalOrders: 'మొత్తం ఆర్డర్లు',
    pending: 'పెండింగ్',
    pooled: 'పూల్ చేయబడింది',
    delivered: 'డెలివరీ చేయబడింది',
    recentOrders: 'మీ ఇటీవలి ఆర్డర్లు',
    noOrdersYet: 'ఇంకా ఆర్డర్లు లేవు',
    startFirstOrder: 'మీ మొదటి వాయిస్ ఆర్డర్ ఇవ్వడం ద్వారా ప్రారంభించండి',
    placeFirstOrder: 'మీ మొదటి ఆర్డర్ ఇవ్వండి',
    // Supplier Dashboard
    welcomeSupplier: 'స్వాగతం, సరఫరాదారు!',
    supplierDashboard: 'సరఫరాదారు డాష్‌బోర్డ్',
    availablePools: 'అందుబాటులో ఉన్న ఆర్డర్ పూల్స్',
    mySupplies: 'నా సరఫరాలు',
    // Order Pool
    orderPools: 'ఆర్డర్ పూల్స్',
    joinPool: 'పూల్‌లో చేరండి',
    // Common
    status: 'స్థితి',
    amount: 'మొత్తం',
    location: 'స్థలం',
    date: 'తేదీ',
    // Navigation
    home: 'హోం'
  },
  bn: {
    voiceOrder: 'ভয়েস অর্ডার',
    tapToSpeak: 'কথা বলতে চাপুন',
    releaseToSend: 'পাঠাতে ছেড়ে দিন',
    listening: 'শুনছি...',
    vendor: 'বিক্রেতা',
    supplier: 'সরবরাহকারী',
    startSelling: 'বিক্রি শুরু করুন',
    startSupplying: 'সরবরাহ শুরু করুন',
    changeLanguage: 'ভাষা',
    processing: 'প্রক্রিয়াকরণ...',
    speakYourOrder: 'আপনার অর্ডার বলুন',
    holdAndSpeak: 'যেকোনো ভাষায় আপনার অর্ডার বলুন',
    // Vendor Dashboard
    welcomeVendor: 'স্বাগতম, বিক্রেতা!',
    enterPhoneNumber: 'ভয়েস অর্ডারিং শুরু করতে আপনার ফোন নম্বর দিন',
    continueToDashboard: 'ড্যাশবোর্ডে চালিয়ে যান',
    vendorDashboard: 'বিক্রেতা ড্যাশবোর্ড',
    newOrder: '+ নতুন অর্ডার',
    totalOrders: 'মোট অর্ডার',
    pending: 'অপেক্ষমান',
    pooled: 'পুল করা',
    delivered: 'বিতরণ করা',
    recentOrders: 'আপনার সাম্প্রতিক অর্ডার',
    noOrdersYet: 'এখনো কোনো অর্ডার নেই',
    startFirstOrder: 'আপনার প্রথম ভয়েস অর্ডার দিয়ে শুরু করুন',
    placeFirstOrder: 'আপনার প্রথম অর্ডার দিন',
    // Supplier Dashboard
    welcomeSupplier: 'স্বাগতম, সরবরাহকারী!',
    supplierDashboard: 'সরবরাহকারী ড্যাশবোর্ড',
    availablePools: 'উপলব্ধ অর্ডার পুল',
    mySupplies: 'আমার সরবরাহ',
    // Order Pool
    orderPools: 'অর্ডার পুল',
    joinPool: 'পুলে যোগ দিন',
    // Common
    status: 'অবস্থা',
    amount: 'পরিমাণ',
    location: 'অবস্থান',
    date: 'তারিখ',
    // Navigation
    home: 'হোম'
  },
  mr: {
    voiceOrder: 'आवाज ऑर्डर',
    tapToSpeak: 'बोलण्यासाठी दाबा',
    releaseToSend: 'पाठवण्यासाठी सोडा',
    listening: 'ऐकत आहे...',
    vendor: 'विक्रेता',
    supplier: 'पुरवठादार',
    startSelling: 'विक्री सुरू करा',
    startSupplying: 'पुरवठा सुरू करा',
    changeLanguage: 'भाषा',
    processing: 'प्रक्रिया करत आहे...',
    speakYourOrder: 'तुमचा ऑर्डर बोला',
    holdAndSpeak: 'कोणत्याही भाषेत तुमचा ऑर्डर बोला',
    // Vendor Dashboard
    welcomeVendor: 'स्वागत आहे, विक्रेता!',
    enterPhoneNumber: 'व्हॉइस ऑर्डरिंग सुरू करण्यासाठी तुमचा फोन नंबर टाका',
    continueToDashboard: 'डॅशबोर्डवर चालू ठेवा',
    vendorDashboard: 'विक्रेता डॅशबोर्ड',
    newOrder: '+ नवीन ऑर्डर',
    totalOrders: 'एकूण ऑर्डर',
    pending: 'प्रलंबित',
    pooled: 'पूल केलेला',
    delivered: 'वितरित',
    recentOrders: 'तुमचे अलीकडील ऑर्डर',
    noOrdersYet: 'अजून कोणतेही ऑर्डर नाहीत',
    startFirstOrder: 'तुमचा पहिला व्हॉइस ऑर्डर देऊन सुरुवात करा',
    placeFirstOrder: 'तुमचा पहिला ऑर्डर द्या',
    // Supplier Dashboard
    welcomeSupplier: 'स्वागत आहे, पुरवठादार!',
    supplierDashboard: 'पुरवठादार डॅशबोर्ड',
    availablePools: 'उपलब्ध ऑर्डर पूल',
    mySupplies: 'माझे पुरवठे',
    // Order Pool
    orderPools: 'ऑर्डर पूल',
    joinPool: 'पूलमध्ये सामील व्हा',
    // Common
    status: 'स्थिती',
    amount: 'रक्कम',
    location: 'स्थान',
    date: 'दिनांक',
    // Navigation
    home: 'घर'
  },
  gu: {
    voiceOrder: 'વૉઇસ ઓર્ડર',
    tapToSpeak: 'બોલવા માટે દબાવો',
    releaseToSend: 'મોકલવા માટે છોડો',
    listening: 'સાંભળી રહ્યા છીએ...',
    vendor: 'વેંડર',
    supplier: 'સપ્લાયર',
    startSelling: 'વેચાણ શરૂ કરો',
    startSupplying: 'સપ્લાય શરૂ કરો',
    changeLanguage: 'ભાષા',
    processing: 'પ્રોસેસિંગ...',
    speakYourOrder: 'તમારો ઓર્ડર બોલો',
    holdAndSpeak: 'કોઈપણ ભાષામાં તમારો ઓર્ડર બોલો',
    // Vendor Dashboard
    welcomeVendor: 'સ્વાગત છે, વેંડર!',
    enterPhoneNumber: 'વૉઇસ ઓર્ડરિંગ શરૂ કરવા માટે તમારો ફોન નંબર દાખલ કરો',
    continueToDashboard: 'ડેશબોર્ડ પર ચાલુ રાખો',
    vendorDashboard: 'વેંડર ડેશબોર્ડ',
    newOrder: '+ નવો ઓર્ડર',
    totalOrders: 'કુલ ઓર્ડર',
    pending: 'બાકી',
    pooled: 'પૂલ કરેલ',
    delivered: 'વિતરિત',
    recentOrders: 'તમારા તાજેતરના ઓર્ડર',
    noOrdersYet: 'હજી સુધી કોઈ ઓર્ડર નથી',
    startFirstOrder: 'તમારો પહેલો વૉઇસ ઓર્ડર આપીને શરૂ કરો',
    placeFirstOrder: 'તમારો પહેલો ઓર્ડર આપો',
    // Supplier Dashboard
    welcomeSupplier: 'સ્વાગત છે, સપ્લાયર!',
    supplierDashboard: 'સપ્લાયર ડેશબોર્ડ',
    availablePools: 'ઉપલબ્ધ ઓર્ડર પૂલ',
    mySupplies: 'મારી સપ્લાય',
    // Order Pool
    orderPools: 'ઓર્ડર પૂલ',
    joinPool: 'પૂલમાં જોડાઓ',
    // Common
    status: 'સ્થિતિ',
    amount: 'રકમ',
    location: 'સ્થાન',
    date: 'તારીખ',
    // Navigation
    home: 'હોમ'
  },
  kn: {
    voiceOrder: 'ಧ್ವನಿ ಆರ್ಡರ್',
    tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ',
    releaseToSend: 'ಕಳುಹಿಸಲು ಬಿಡಿ',
    listening: 'ಕೇಳುತ್ತಿದ್ದೇವೆ...',
    vendor: 'ವಿಕ್ರೇತ',
    supplier: 'ಪೂರೈಕೆದಾರ',
    startSelling: 'ಮಾರಾಟ ಪ್ರಾರಂಭಿಸಿ',
    startSupplying: 'ಪೂರೈಕೆ ಪ್ರಾರಂಭಿಸಿ',
    changeLanguage: 'ಭಾಷೆ',
    processing: 'ಪ್ರಕ್ರಿಯೆ...',
    speakYourOrder: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಹೇಳಿ',
    holdAndSpeak: 'ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಆರ್ಡರ್ ಹೇಳಿ',
    // Vendor Dashboard
    welcomeVendor: 'ಸ್ವಾಗತ, ವಿಕ್ರೇತ!',
    enterPhoneNumber: 'ಧ್ವನಿ ಆರ್ಡರಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    continueToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಸಿ',
    vendorDashboard: 'ವಿಕ್ರೇತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    newOrder: '+ ಹೊಸ ಆರ್ಡರ್',
    totalOrders: 'ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು',
    pending: 'ಬಾಕಿ',
    pooled: 'ಪೂಲ್ ಮಾಡಲಾಗಿದೆ',
    delivered: 'ವಿತರಿಸಲಾಗಿದೆ',
    recentOrders: 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು',
    noOrdersYet: 'ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ',
    startFirstOrder: 'ನಿಮ್ಮ ಮೊದಲ ಧ್ವನಿ ಆರ್ಡರ್ ನೀಡುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ',
    placeFirstOrder: 'ನಿಮ್ಮ ಮೊದಲ ಆರ್ಡರ್ ನೀಡಿ',
    // Supplier Dashboard
    welcomeSupplier: 'ಸ್ವಾಗತ, ಪೂರೈಕೆದಾರ!',
    supplierDashboard: 'ಪೂರೈಕೆದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    availablePools: 'ಲಭ್ಯವಿರುವ ಆರ್ಡರ್ ಪೂಲ್‌ಗಳು',
    mySupplies: 'ನನ್ನ ಪೂರೈಕೆಗಳು',
    // Order Pool
    orderPools: 'ಆರ್ಡರ್ ಪೂಲ್‌ಗಳು',
    joinPool: 'ಪೂಲ್‌ನಲ್ಲಿ ಸೇರಿ',
    // Common
    status: 'ಸ್ಥಿತಿ',
    amount: 'ಮೊತ್ತ',
    location: 'ಸ್ಥಳ',
    date: 'ದಿನಾಂಕ',
    // Navigation
    home: 'ಮುಖ್ಯಪುಟ'
  },
  ml: {
    voiceOrder: 'വോയ്സ് ഓർഡർ',
    tapToSpeak: 'സംസാരിക്കാൻ അമർത്തുക',
    releaseToSend: 'അയയ്ക്കാൻ വിടുക',
    listening: 'കേൾക്കുന്നു...',
    vendor: 'വെണ്ടർ',
    supplier: 'വിതരണക്കാരൻ',
    startSelling: 'വിൽപ്പന ആരംഭിക്കുക',
    startSupplying: 'വിതരണം ആരംഭിക്കുക',
    changeLanguage: 'ഭാഷ',
    processing: 'പ്രോസസ്സിംഗ്...',
    speakYourOrder: 'നിങ്ങളുടെ ഓർഡർ പറയുക',
    holdAndSpeak: 'ഏത് ഭാഷയിലും നിങ്ങളുടെ ഓർഡർ പറയുക',
    // Vendor Dashboard
    welcomeVendor: 'സ്വാഗതം, വെണ്ടർ!',
    enterPhoneNumber: 'വോയ്സ് ഓർഡറിംഗ് ആരംഭിക്കാൻ നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക',
    continueToDashboard: 'ഡാഷ്ബോർഡിലേക്ക് തുടരുക',
    vendorDashboard: 'വെണ്ടർ ഡാഷ്ബോർഡ്',
    newOrder: '+ പുതിയ ഓർഡർ',
    totalOrders: 'മൊത്തം ഓർഡറുകൾ',
    pending: 'തീർപ്പുകൽപ്പിക്കാത്ത',
    pooled: 'പൂൾ ചെയ്തത്',
    delivered: 'വിതരണം ചെയ്തത്',
    recentOrders: 'നിങ്ങളുടെ സമീപകാല ഓർഡറുകൾ',
    noOrdersYet: 'ഇതുവരെ ഓർഡറുകളൊന്നുമില്ല',
    startFirstOrder: 'നിങ്ങളുടെ ആദ്യ വോയ്സ് ഓർഡർ നൽകി ആരംഭിക്കുക',
    placeFirstOrder: 'നിങ്ങളുടെ ആദ്യ ഓർഡർ നൽകുക',
    // Supplier Dashboard
    welcomeSupplier: 'സ്വാഗതം, വിതരണക്കാരാ!',
    supplierDashboard: 'വിതരണക്കാരന്റെ ഡാഷ്ബോർഡ്',
    availablePools: 'ലഭ്യമായ ഓർഡർ പൂളുകൾ',
    mySupplies: 'എന്റെ വിതരണങ്ങൾ',
    // Order Pool
    orderPools: 'ഓർഡർ പൂളുകൾ',
    joinPool: 'പൂളിൽ ചേരുക',
    // Common
    status: 'അവസ്ഥ',
    amount: 'തുക',
    location: 'സ്ഥലം',
    date: 'തീയതി',
    // Navigation
    home: 'ഹോം'
  },
  pa: {
    voiceOrder: 'ਵਾਇਸ ਆਰਡਰ',
    tapToSpeak: 'ਬੋਲਣ ਲਈ ਦਬਾਓ',
    releaseToSend: 'ਭੇਜਣ ਲਈ ਛੱਡੋ',
    listening: 'ਸੁਣ ਰਹੇ ਹਾਂ...',
    vendor: 'ਵਿਕਰੇਤਾ',
    supplier: 'ਸਪਲਾਇਰ',
    startSelling: 'ਵੇਚਣਾ ਸ਼ੁਰੂ ਕਰੋ',
    startSupplying: 'ਸਪਲਾਈ ਸ਼ੁਰੂ ਕਰੋ',
    changeLanguage: 'ਭਾਸ਼ਾ',
    processing: 'ਪ੍ਰਕਿਰਿਆ...',
    speakYourOrder: 'ਆਪਣਾ ਆਰਡਰ ਬੋਲੋ',
    holdAndSpeak: 'ਕਿਸੇ ਵੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਪਣਾ ਆਰਡਰ ਬੋਲੋ',
    // Vendor Dashboard
    welcomeVendor: 'ਸਵਾਗਤ ਹੈ, ਵਿਕਰੇਤਾ!',
    enterPhoneNumber: 'ਵਾਇਸ ਆਰਡਰਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    continueToDashboard: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਜਾਰੀ ਰੱਖੋ',
    vendorDashboard: 'ਵਿਕਰੇਤਾ ਡੈਸ਼ਬੋਰਡ',
    newOrder: '+ ਨਵਾਂ ਆਰਡਰ',
    totalOrders: 'ਕੁੱਲ ਆਰਡਰ',
    pending: 'ਲੰਬਿਤ',
    pooled: 'ਪੂਲ ਕੀਤਾ ਗਿਆ',
    delivered: 'ਡਿਲੀਵਰ ਕੀਤਾ ਗਿਆ',
    recentOrders: 'ਤੁਹਾਡੇ ਹਾਲੀਆ ਆਰਡਰ',
    noOrdersYet: 'ਅਜੇ ਤੱਕ ਕੋਈ ਆਰਡਰ ਨਹੀਂ',
    startFirstOrder: 'ਆਪਣਾ ਪਹਿਲਾ ਵਾਇਸ ਆਰਡਰ ਦੇ ਕੇ ਸ਼ੁਰੂ ਕਰੋ',
    placeFirstOrder: 'ਆਪਣਾ ਪਹਿਲਾ ਆਰਡਰ ਦਿਓ',
    // Supplier Dashboard
    welcomeSupplier: 'ਸਵਾਗਤ ਹੈ, ਸਪਲਾਇਰ!',
    supplierDashboard: 'ਸਪਲਾਇਰ ਡੈਸ਼ਬੋਰਡ',
    availablePools: 'ਉਪਲਬਧ ਆਰਡਰ ਪੂਲ',
    mySupplies: 'ਮੇਰੀ ਸਪਲਾਈ',
    // Order Pool
    orderPools: 'ਆਰਡਰ ਪੂਲ',
    joinPool: 'ਪੂਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
    // Common
    status: 'ਸਥਿਤੀ',
    amount: 'ਰਕਮ',
    location: 'ਸਥਾਨ',
    date: 'ਤਾਰੀਖ',
    // Navigation
    home: 'ਘਰ'
  },
  or: {
    voiceOrder: 'ଭଏସ ଅର୍ଡର',
    tapToSpeak: 'କହିବା ପାଇଁ ଦବାନ୍ତୁ',
    releaseToSend: 'ପଠାଇବା ପାଇଁ ଛାଡ଼ନ୍ତୁ',
    listening: 'ଶୁଣୁଛୁ...',
    vendor: 'ବିକ୍ରେତା',
    supplier: 'ଯୋଗାଣକାରୀ',
    startSelling: 'ବିକ୍ରୟ ଆରମ୍ଭ କରନ୍ତୁ',
    startSupplying: 'ଯୋଗାଣ ଆରମ୍ଭ କରନ୍ତୁ',
    changeLanguage: 'ଭାଷା',
    processing: 'ପ୍ରକ୍ରିୟାକରଣ...',
    speakYourOrder: 'ଆପଣଙ୍କର ଅର୍ଡର କୁହନ୍ତୁ',
    holdAndSpeak: 'ଯେକୌଣସି ଭାଷାରେ ଆପଣଙ୍କର ଅର୍ଡର କୁହନ୍ତୁ',
    // Vendor Dashboard
    welcomeVendor: 'ସ୍ୱାଗତ, ବିକ୍ରେତା!',
    enterPhoneNumber: 'ଭଏସ ଅର୍ଡରିଂ ଆରମ୍ଭ କରିବା ପାଇଁ ଆପଣଙ୍କର ଫୋନ ନମ୍ବର ଦିଅନ୍ତୁ',
    continueToDashboard: 'ଡ୍ୟାସବୋର୍ଡକୁ ଜାରି ରଖନ୍ତୁ',
    vendorDashboard: 'ବିକ୍ରେତା ଡ୍ୟାସବୋର୍ଡ',
    newOrder: '+ ନୂତନ ଅର୍ଡର',
    totalOrders: 'ମୋଟ ଅର୍ଡର',
    pending: 'ଅପେକ୍ଷମାଣ',
    pooled: 'ପୁଲ କରାଯାଇଛି',
    delivered: 'ପ୍ରଦାନ କରାଯାଇଛି',
    recentOrders: 'ଆପଣଙ୍କର ସାମ୍ପ୍ରତିକ ଅର୍ଡର',
    noOrdersYet: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅର୍ଡର ନାହିଁ',
    startFirstOrder: 'ଆପଣଙ୍କର ପ୍ରଥମ ଭଏସ ଅର୍ଡର ଦେଇ ଆରମ୍ଭ କରନ୍ତୁ',
    placeFirstOrder: 'ଆପଣଙ୍କର ପ୍ରଥମ ଅର୍ଡର ଦିଅନ୍ତୁ',
    // Supplier Dashboard
    welcomeSupplier: 'ସ୍ୱାଗତ, ଯୋଗାଣକାରୀ!',
    supplierDashboard: 'ଯୋଗାଣକାରୀ ଡ୍ୟାସବୋର୍ଡ',
    availablePools: 'ଉପଲବ୍ଧ ଅର୍ଡର ପୁଲ',
    mySupplies: 'ମୋର ଯୋଗାଣ',
    // Order Pool
    orderPools: 'ଅର୍ଡର ପୁଲ',
    joinPool: 'ପୁଲରେ ଯୋଗ ଦିଅନ୍ତୁ',
    // Common
    status: 'ସ୍ଥିତି',
    amount: 'ପରିମାଣ',
    location: 'ସ୍ଥାନ',
    date: 'ତାରିଖ',
    // Navigation
    home: 'ହୋମ'
  },
  as: {
    voiceOrder: 'ভয়েচ অৰ্ডাৰ',
    tapToSpeak: 'কথা কবলৈ টিপক',
    releaseToSend: 'পঠিয়াবলৈ এৰি দিয়ক',
    listening: 'শুনি আছো...',
    vendor: 'বিক্ৰেতা',
    supplier: 'যোগানকাৰী',
    startSelling: 'বিক্ৰী আৰম্ভ কৰক',
    startSupplying: 'যোগান আৰম্ভ কৰক',
    changeLanguage: 'ভাষা',
    processing: 'প্ৰক্ৰিয়াকৰণ...',
    speakYourOrder: 'আপোনাৰ অৰ্ডাৰ কওক',
    holdAndSpeak: 'যিকোনো ভাষাত আপোনাৰ অৰ্ডাৰ কওক',
    // Vendor Dashboard
    welcomeVendor: 'স্বাগতম, বিক্ৰেতা!',
    enterPhoneNumber: 'ভয়েচ অৰ্ডাৰিং আৰম্ভ কৰিবলৈ আপোনাৰ ফোন নম্বৰ দিয়ক',
    continueToDashboard: 'ড্যাশবোর্ডলৈ অব্যাহত ৰাখক',
    vendorDashboard: 'বিক্ৰেতা ড্যাশবোর্ড',
    newOrder: '+ নতুন অৰ্ডাৰ',
    totalOrders: 'মুঠ অৰ্ডাৰ',
    pending: 'বাকী',
    pooled: 'পুল কৰা',
    delivered: 'বিতৰণ কৰা',
    recentOrders: 'আপোনাৰ শেহতীয়া অৰ্ডাৰ',
    noOrdersYet: 'এতিয়াও কোনো অৰ্ডাৰ নাই',
    startFirstOrder: 'আপোনাৰ প্ৰথম ভয়েচ অৰ্ডাৰ দি আৰম্ভ কৰক',
    placeFirstOrder: 'আপোনাৰ প্ৰথম অৰ্ডাৰ দিয়ক',
    // Supplier Dashboard
    welcomeSupplier: 'স্বাগতম, যোগানকাৰী!',
    supplierDashboard: 'যোগানকাৰী ড্যাশবোর্ড',
    availablePools: 'উপলব্ধ অৰ্ডাৰ পুল',
    mySupplies: 'মোৰ যোগান',
    // Order Pool
    orderPools: 'অৰ্ডাৰ পুল',
    joinPool: 'পুলত যোগ দিয়ক',
    // Common
    status: 'অৱস্থা',
    amount: 'পৰিমাণ',
    location: 'স্থান',
    date: 'তাৰিখ',
    // Navigation
    home: 'হোম'
  }
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('hi') // Default to Hindi

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
    localStorage.setItem('voicecart-language', langCode)
  }

  useEffect(() => {
    const savedLang = localStorage.getItem('voicecart-language')
    if (savedLang && languages.some(lang => lang.code === savedLang)) {
      setCurrentLanguage(savedLang)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      languages,
      t,
      changeLanguage,
      currentLanguageData: languages.find(lang => lang.code === currentLanguage)
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
