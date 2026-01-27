import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import { shieldCheckmarkOutline, micOutline, walletOutline, addCircleOutline, personOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


// Swiper types
import type { Swiper as SwiperType } from 'swiper';

import { translations } from '../utils/translations';
import type { Language } from '../utils/translations';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { STORAGE_KEYS } from '../services/localService';
import { parseVoiceInput, type ParsedItem } from '../utils/textParser';

// ... (existing imports)

const Onboarding: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [tutorialListName, setTutorialListName] = useState("");
    const [tutorialItemName, setTutorialItemName] = useState("");
    const [userName, setUserName] = useState("");
    const [language, setLanguage] = useState<Language>('id');
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    // Smart Voice Demo State
    const [smartVoiceText, setSmartVoiceText] = useState("");
    const [parsedResult, setParsedResult] = useState<ParsedItem | null>(null);

    const { isListening, transcript, startListening, stopListening, hasSupport } = useVoiceInput();

    useEffect(() => {
        const savedLang = localStorage.getItem('app_language') as Language;
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    // Sync transcript to input when listening stops or transcript updates
    useEffect(() => {
        if (transcript) {
            // If on Tutorial Slide (index 2)
            if (activeIndex === 2) {
                setTutorialItemName(transcript);
            }
            // If on Smart Voice Slide (index 3)
            if (activeIndex === 3) {
                setSmartVoiceText(transcript);
            }
        }
    }, [transcript, activeIndex]);

    // Auto-parse smart voice input
    useEffect(() => {
        const result = parseVoiceInput(smartVoiceText, language === 'id' ? 'id-ID' : 'en-US');
        setParsedResult(result);
    }, [smartVoiceText, language]);

    const t = translations[language];

    const slides = [
        {
            id: 'privacy',
            icon: shieldCheckmarkOutline,
            text: t.slide_privacy_text,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            id: 'name',
            icon: personOutline,
            text: language === 'en' ? "What's your name?" : "Siapa nama kamu?",
            color: "text-blue-600",
            bg: "bg-blue-100",
            isInput: true
        },
        {
            id: 'tutorial',
            icon: addCircleOutline,
            text: t.slide_tutorial_text,
            color: "text-blue-600",
            bg: "bg-blue-100",
            isInteractive: true
        },
        {
            id: 'voice',
            icon: micOutline,
            text: t.smart_voice_title,
            color: "text-blue-600",
            bg: "bg-blue-100",
            isSmartDemo: true
        },
        {
            id: 'savings',
            icon: walletOutline,
            text: t.slide_savings_text,
            color: "text-blue-600",
            bg: "bg-blue-100"
        }
    ];



    const handleNext = () => {
        if (swiperInstance) {
            swiperInstance.slideNext();
        }
    };

    const handleFinish = () => {
        // Save User Profile
        const userProfile = {
            id: `user_${Date.now()}`,
            name: userName || 'Guest',
            created_at: new Date().toISOString()
        };
        localStorage.setItem('user_profile', JSON.stringify(userProfile));

        // Initialize default data with user input
        const listId = `gen_id_${Date.now()}`;
        const defaultList = [
            {
                id: listId,
                name: tutorialListName || (language === 'en' ? "My First List" : "Belanja Pertamaku"),
                household_id: userProfile.id, // Use user ID as household ID for now
                created_by: userProfile.name,
                created_at: new Date().toISOString()
            }
        ];

        const defaultItems = tutorialItemName ? [
            {
                id: `item_${Date.now()}`,
                list_id: listId,
                item_name: tutorialItemName,
                quantity: 1,
                unit: 'pcs',
                is_purchased: false,
                household_id: userProfile.id,
                created_at: new Date().toISOString()
            }
        ] : [];

        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(defaultList));
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(defaultItems));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        localStorage.setItem('app_initialized', 'true');

        // Force reload to ensure App.tsx picks up the new state or just navigate
        // Using window.location.href to be safe and ensure clean state load
        window.location.href = '/home';
    };

    const handleSkip = () => {
        handleFinish();
    };

    const toggleListening = () => {
        if (!hasSupport) {
            alert(t.voice_not_supported);
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            // Pass language to voice input if needed, or rely on auto
            startListening(language === 'id' ? 'id-ID' : 'en-US');
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />

                    {/* Top Bar - Page Indicator (Dots) */}
                    <div className="w-full pt-safe-top z-10 flex justify-center py-4">
                        <div className="flex space-x-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                            {slides.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-500 ${idx === activeIndex
                                        ? 'w-6 bg-blue-600 shadow-md'
                                        : 'w-2 bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="flex-1 flex items-center justify-center z-10">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
                            onSwiper={(swiper) => setSwiperInstance(swiper)}
                            className="w-full h-full"
                        >
                            {slides.map((slide, index) => (
                                <SwiperSlide key={index}>
                                    <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 animate-fade-in-up">
                                        <div className={`w-40 h-40 rounded-3xl bg-white shadow-xl shadow-blue-100 flex items-center justify-center mb-4 transform transition-transform duration-500 hover:scale-105 hover:rotate-3`}>
                                            <IonIcon icon={slide.icon} className={`text-7xl ${slide.color}`} />
                                        </div>

                                        <div className="space-y-3 max-w-xs mx-auto">
                                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                                {slide.text}
                                            </h2>
                                            {!slide.isInteractive && !slide.isInput && (
                                                <p className="text-gray-500 text-lg">
                                                    {index === 0 ? "Privacy first. Always." :
                                                        index === 3 ? "Just speak naturally." :
                                                            "Smart insights for you."}
                                                </p>
                                            )}
                                        </div>

                                        {/* Name Input Slide */}
                                        {slide.isInput && (
                                            <div className="w-full max-w-xs space-y-4 animate-fade-in-up delay-100">
                                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/50 space-y-4">
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">
                                                            {language === 'en' ? 'Your Name' : 'Nama Panggilan'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={userName}
                                                            onChange={(e) => setUserName(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                                            placeholder={language === 'en' ? "e.g. Alex" : "Contoh: Budi"}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactive Tutorial Slide */}
                                        {slide.isInteractive && (
                                            <div className="w-full max-w-xs space-y-4 animate-fade-in-up delay-100">
                                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/50 space-y-4">
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.tutorial_list_label}</label>
                                                        <input
                                                            type="text"
                                                            value={tutorialListName}
                                                            onChange={(e) => setTutorialListName(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                                            placeholder={t.tutorial_list_placeholder}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.tutorial_item_label}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="text"
                                                                value={tutorialItemName}
                                                                onChange={(e) => setTutorialItemName(e.target.value)}
                                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12 font-medium text-gray-800 placeholder:text-gray-400"
                                                                placeholder={t.tutorial_item_placeholder}
                                                            />
                                                            <button
                                                                onClick={toggleListening}
                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${isListening
                                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600'
                                                                    }`}
                                                            >
                                                                <IonIcon icon={micOutline} className="text-xl" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Smart Voice Demo Slide */}
                                        {slide.isSmartDemo && (
                                            <div className="w-full max-w-xs space-y-4 animate-fade-in-up delay-100">
                                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/50 space-y-4">

                                                    {/* Parsed Result Display */}
                                                    {/* Parsed Result Display */}
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 min-h-[100px] flex flex-col justify-center transition-all duration-300">
                                                        {smartVoiceText ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                                                                    <span className="text-xs font-bold text-gray-500 uppercase">{t.smart_voice_result_item}</span>
                                                                    <span className="text-sm font-bold text-gray-800">{parsedResult?.name}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">{t.smart_voice_result_brand}</span>
                                                                        <span className="text-sm font-medium text-blue-600">{parsedResult?.brand || '-'}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">{t.smart_voice_result_qty}</span>
                                                                        <span className="text-sm font-medium text-blue-600">
                                                                            {parsedResult?.qty} {parsedResult?.unit}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-gray-400 text-sm py-2">
                                                                {t.smart_voice_desc}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3 text-left">
                                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider block text-center">
                                                            {t.smart_voice_instruction}
                                                        </label>

                                                        {/* Test Buttons */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => setSmartVoiceText(t.smart_voice_example_brand)}
                                                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-200"
                                                            >
                                                                {t.smart_voice_btn_brand}
                                                            </button>
                                                            <button
                                                                onClick={() => setSmartVoiceText(t.smart_voice_example_no_brand)}
                                                                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors border border-indigo-200"
                                                            >
                                                                {t.smart_voice_btn_no_brand}
                                                            </button>
                                                        </div>

                                                        <div className="relative group">
                                                            <input
                                                                type="text"
                                                                value={smartVoiceText}
                                                                onChange={(e) => setSmartVoiceText(e.target.value)}
                                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12 font-medium text-gray-800 placeholder:text-gray-400 text-sm"
                                                                placeholder={t.smart_voice_hint}
                                                            />
                                                            <button
                                                                onClick={toggleListening}
                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${isListening
                                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600'
                                                                    }`}
                                                            >
                                                                <IonIcon icon={micOutline} className="text-xl" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="p-8 pb-safe-bottom min-h-[120px] flex flex-col justify-center z-10 w-full max-w-lg mx-auto">
                        {activeIndex === slides.length - 1 ? (
                            <IonButton
                                expand="block"
                                className="h-14 font-bold text-lg shadow-xl shadow-blue-200 rounded-2xl overflow-hidden"
                                style={{ '--border-radius': '16px', '--background': 'linear-gradient(to right, #3b82f6, #4f46e5)' }}
                                onClick={handleFinish}
                            >
                                {t.start_shopping_button}
                                <IonIcon slot="end" icon={addCircleOutline} />
                            </IonButton>
                        ) : (
                            <div className="flex justify-between items-center w-full">
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-500 font-medium hover:text-gray-800 transition-colors px-4 py-2"
                                >
                                    {t.skip_button}
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95"
                                >
                                    {t.next_button}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Onboarding;
