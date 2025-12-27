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

// ... (existing imports)

const Onboarding: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [tutorialListName, setTutorialListName] = useState("");
    const [tutorialItemName, setTutorialItemName] = useState("");
    const [userName, setUserName] = useState("");
    const [language, setLanguage] = useState<Language>('id');

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
            setTutorialItemName(transcript);
        }
    }, [transcript]);

    const t = translations[language];

    const slides = [
        {
            id: 'privacy',
            icon: shieldCheckmarkOutline,
            text: t.slide_privacy_text,
            color: "text-blue-500",
            bg: "bg-blue-100"
        },
        {
            id: 'name',
            icon: personOutline,
            text: language === 'en' ? "What's your name?" : "Siapa nama kamu?",
            color: "text-indigo-500",
            bg: "bg-indigo-100",
            isInput: true
        },
        {
            id: 'tutorial',
            icon: addCircleOutline,
            text: t.slide_tutorial_text,
            color: "text-orange-500",
            bg: "bg-orange-100",
            isInteractive: true
        },
        {
            id: 'voice',
            icon: micOutline,
            text: t.slide_voice_text,
            color: "text-purple-500",
            bg: "bg-purple-100"
        },
        {
            id: 'savings',
            icon: walletOutline,
            text: t.slide_savings_text,
            color: "text-green-500",
            bg: "bg-green-100"
        }
    ];

    const progress = ((activeIndex + 1) / slides.length) * 100;

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

                    {/* Top Bar */}
                    <div className="w-full pt-safe-top z-10">
                        <div className="h-1 bg-gray-200/50 w-full backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-end p-4">
                            {activeIndex < slides.length - 1 && (
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-500 font-medium text-sm hover:text-blue-600 transition-colors px-3 py-1 rounded-full hover:bg-white/50"
                                >
                                    {t.skip_button}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="flex-1 flex items-center justify-center z-10">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
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
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="p-8 pb-safe-bottom min-h-[120px] flex flex-col justify-center z-10">
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
                            <div className="flex justify-center space-x-3">
                                {slides.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all duration-500 ${idx === activeIndex
                                            ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md'
                                            : 'w-2 bg-gray-300/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Onboarding;
