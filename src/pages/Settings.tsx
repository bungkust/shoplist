import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonList, IonIcon, IonButton, IonAvatar, IonToast } from '@ionic/react';
import { personCircleOutline, logOutOutline, copyOutline, settingsOutline, chevronForwardOutline, mailOutline, homeOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import { useHistory } from 'react-router-dom';

const Settings: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [householdId, setHouseholdId] = useState<string>('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
                const { data } = await supabase
                    .from('profiles')
                    .select('household_id')
                    .eq('id', user.id)
                    .single();
                if (data) setHouseholdId(data.household_id);
            }
        };
        getProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        history.push('/login');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage('Copied to clipboard!');
        setShowToast(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                <div className="max-w-md mx-auto pb-20 pt-4 space-y-6">

                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-soft animate-enter-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <IonIcon icon={personCircleOutline} className="text-6xl text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{email.split('@')[0]}</h2>
                            <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
                                <IonIcon icon={mailOutline} />
                                {email}
                            </p>
                        </div>
                    </div>

                    {/* Household Info */}
                    <div className="space-y-2 animate-enter-up" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-2">Household</h3>
                        <div className="bg-white rounded-2xl p-1 shadow-soft">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                        <IonIcon icon={homeOutline} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs text-text-muted">Household ID</span>
                                        <span className="font-mono text-sm font-bold text-text-main truncate pr-2">{householdId || 'Loading...'}</span>
                                    </div>
                                </div>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={() => copyToClipboard(householdId)}
                                    className="bg-gray-50 rounded-xl m-0 h-10 w-10 text-gray-500 hover:text-primary"
                                >
                                    <IonIcon slot="icon-only" icon={copyOutline} />
                                </IonButton>
                            </div>
                            <div className="px-4 pb-4">
                                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl leading-relaxed">
                                    Share this ID with family members to sync your shopping lists together.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* App Settings */}
                    <div className="space-y-2 animate-enter-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-2">App Info</h3>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
                            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                <span className="text-text-main font-medium">Version</span>
                                <span className="text-text-muted text-sm">v1.0.0 (Beta)</span>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-text-main font-medium">Theme</span>
                                <span className="text-primary text-sm font-bold">Soft Blue</span>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 animate-enter-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={handleSignOut}
                            className="w-full bg-white border-2 border-red-50 text-red-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <IonIcon icon={logOutOutline} />
                            Sign Out
                        </button>
                        <p className="text-center text-xs text-gray-300 mt-4">
                            Made with ❤️ by Shoplist Team
                        </p>
                    </div>

                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                    color="dark"
                    className="mb-16"
                />
            </IonContent>
        </IonPage>
    );
};

export default Settings;
