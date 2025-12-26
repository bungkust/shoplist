import React, { useRef } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, useIonAlert, useIonRouter } from '@ionic/react';
import { cloudDownloadOutline, cartOutline } from 'ionicons/icons';

const Welcome: React.FC = () => {
    const router = useIonRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [presentAlert] = useIonAlert();

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
                                window.location.href = '/home'; // Force reload to pick up new data
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

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <div className="flex flex-col h-full justify-center items-center text-center space-y-8">

                    {/* Logo Area */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <IonIcon icon={cartOutline} className="text-6xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Shoplist</h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                Asisten belanja cerdas, offline, dan privat.
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
                            Mulai Sekarang
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="outline"
                            className="h-12 font-semibold"
                            onClick={handleRestoreBackup}
                        >
                            <IonIcon slot="start" icon={cloudDownloadOutline} />
                            Pulihkan dari File Backup
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
