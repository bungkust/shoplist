import React, { useRef, useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, useIonAlert, useIonRouter } from '@ionic/react';
import { cloudDownloadOutline, cartOutline, globeOutline } from 'ionicons/icons';
import { translations } from '../utils/translations';
import type { Language } from '../utils/translations';

const Welcome: React.FC = () => {
    const router = useIonRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [presentAlert] = useIonAlert();
    const [language, setLanguage] = useState<Language | null>(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('app_language') as Language;
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const handleLanguageSelect = (lang: Language) => {
        localStorage.setItem('app_language', lang);
        setLanguage(lang);
    };

    const handleStartNew = () => {
        router.push('/onboarding', 'forward', 'push');
    };

    const handleRestoreBackup = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                // Basic Validation
                if (!json.list_master || !json.shopping_items) {
                    throw new Error('Invalid backup file format');
                }

                // Restore Data
                localStorage.setItem('list_master', JSON.stringify(json.list_master));
                localStorage.setItem('shopping_items', JSON.stringify(json.shopping_items));
                if (json.transaction_history) {
                    localStorage.setItem('transaction_history', JSON.stringify(json.transaction_history));
                }

                // Mark as initialized
                localStorage.setItem('app_initialized', 'true');

                presentAlert({
                    header: 'Sukses',
                    message: 'Data berhasil dipulihkan!',
                    buttons: [
                        {
                            text: 'OK',
                            handler: () => {
                                window.location.href = '/home'; // Force reload
                            },
                        },
                    ],
                });
            } catch (error) {
                presentAlert({
                    header: 'Error',
                    message: 'File backup tidak valid atau rusak.',
                    buttons: ['OK'],
                });
            }
        };
        reader.readAsText(file);
    };

    const t = language ? translations[language] : translations['id']; // Default for safety

    if (!language) {
        return (
            <IonPage>
                <IonContent fullscreen>
                    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />

                        <div className="flex-1 flex flex-col justify-center items-center px-6 z-10 animate-fade-in-up">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center text-blue-600 mb-8 rotate-3 hover:rotate-6 transition-transform duration-500">
                                <IonIcon icon={globeOutline} className="text-5xl" />
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
                            <p className="text-gray-500 mb-10 text-center max-w-xs">
                                Please select your preferred language to continue.
                                <br />
                                <span className="text-sm opacity-75">Silakan pilih bahasa Anda untuk melanjutkan.</span>
                            </p>

                            <div className="w-full max-w-sm space-y-4">
                                <button
                                    onClick={() => handleLanguageSelect('id')}
                                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl shadow-inner relative z-10">
                                        🇮🇩
                                    </div>
                                    <div className="text-left relative z-10">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">Bahasa Indonesia</h3>
                                        <p className="text-xs text-gray-500">Gunakan Bahasa Indonesia</p>
                                    </div>
                                    <div className="ml-auto relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleLanguageSelect('en')}
                                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl shadow-inner relative z-10">
                                        🇺🇸
                                    </div>
                                    <div className="text-left relative z-10">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">English</h3>
                                        <p className="text-xs text-gray-500">Use English Language</p>
                                    </div>
                                    <div className="ml-auto relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 text-center z-10">
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                Shoplist App v1.0
                            </p>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <div className="flex flex-col h-full justify-center items-center text-center space-y-8 animate-fade-in">

                    {/* Logo Area */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <IonIcon icon={cartOutline} className="text-6xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{t.welcome_title}</h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                {t.welcome_subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="w-full max-w-xs space-y-4 mt-auto pb-10">
                        <IonButton
                            expand="block"
                            className="h-12 font-semibold"
                            onClick={handleStartNew}
                        >
                            {t.start_button}
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="outline"
                            className="h-12 font-semibold"
                            onClick={handleRestoreBackup}
                        >
                            <IonIcon slot="start" icon={cloudDownloadOutline} />
                            {t.restore_button}
                        </IonButton>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept=".json"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Welcome;
