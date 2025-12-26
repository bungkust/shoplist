import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import { shieldCheckmarkOutline, micOutline, walletOutline, addCircleOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { STORAGE_KEYS } from '../services/localService';

// Swiper types
import type { Swiper as SwiperType } from 'swiper';

const Onboarding: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [tutorialListName, setTutorialListName] = useState("Belanja Mingguan");
    const [tutorialItemName, setTutorialItemName] = useState("");

    const { isListening, transcript, startListening, stopListening, hasSupport } = useVoiceInput();

    // Sync transcript to input when listening stops or transcript updates
    useEffect(() => {
        if (transcript) {
            setTutorialItemName(transcript);
        }
    }, [transcript]);

    const slides = [
        {
            id: 'privacy',
            icon: shieldCheckmarkOutline,
            text: "100% Offline. Data aman di HP Anda.",
            color: "text-blue-500",
            bg: "bg-blue-100"
        },
        {
            id: 'tutorial',
            icon: addCircleOutline,
            text: "Coba buat daftar belanja pertamamu!",
            color: "text-orange-500",
            bg: "bg-orange-100",
            isInteractive: true
        },
        {
            id: 'voice',
            icon: micOutline,
            text: "Catat belanjaan cuma dengan ngomong.",
            color: "text-purple-500",
            bg: "bg-purple-100"
        },
        {
            id: 'savings',
            icon: walletOutline,
            text: "Pantau riwayat harga agar lebih hemat.",
            color: "text-green-500",
            bg: "bg-green-100"
        }
    ];

    const progress = ((activeIndex + 1) / slides.length) * 100;



    // ... (imports)

    const handleFinish = () => {
        // Initialize default data with user input
        const listId = `gen_id_${Date.now()}`;
        const defaultList = [
            {
                id: listId,
                name: tutorialListName || "Belanja Pertamaku",
                household_id: 'guest_household',
                created_by: 'guest',
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
                household_id: 'guest_household',
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
            alert("Fitur suara tidak tersedia di perangkat ini.");
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening('id-ID');
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="flex flex-col h-full bg-white">

                    {/* Top Bar */}
                    <div className="w-full pt-safe-top">
                        <div className="h-1 bg-gray-200 w-full">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-end p-4">
                            {activeIndex < slides.length - 1 && (
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-500 font-medium text-sm"
                                >
                                    Lewati
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="flex-1 flex items-center justify-center">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
                            className="w-full h-full"
                        >
                            {slides.map((slide, index) => (
                                <SwiperSlide key={index}>
                                    <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8">
                                        <div className={`w-40 h-40 rounded-full ${slide.bg} flex items-center justify-center mb-4`}>
                                            <IonIcon icon={slide.icon} className={`text-7xl ${slide.color}`} />
                                        </div>

                                        <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                                            {slide.text}
                                        </h2>

                                        {/* Interactive Tutorial Slide */}
                                        {slide.isInteractive && (
                                            <div className="w-full max-w-xs space-y-4 animate-fade-in-up">
                                                <div className="space-y-2 text-left">
                                                    <label className="text-sm font-semibold text-gray-600 ml-1">Nama Daftar</label>
                                                    <input
                                                        type="text"
                                                        value={tutorialListName}
                                                        onChange={(e) => setTutorialListName(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                        placeholder="Contoh: Belanja Bulanan"
                                                    />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <label className="text-sm font-semibold text-gray-600 ml-1">Barang Pertama</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={tutorialItemName}
                                                            onChange={(e) => setTutorialItemName(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                                                            placeholder="Contoh: Telur Ayam"
                                                        />
                                                        <button
                                                            onClick={toggleListening}
                                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening
                                                                ? 'bg-red-100 text-red-500 animate-pulse'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            <IonIcon icon={micOutline} className="text-xl" />
                                                        </button>
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
                    <div className="p-8 pb-safe-bottom min-h-[120px] flex flex-col justify-center">
                        {activeIndex === slides.length - 1 ? (
                            <IonButton
                                expand="block"
                                className="h-12 font-bold"
                                onClick={handleFinish}
                            >
                                Mulai Belanja
                            </IonButton>
                        ) : (
                            <div className="flex justify-center space-x-2">
                                {slides.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
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
