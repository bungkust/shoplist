import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonToast, IonAlert } from '@ionic/react';
import { App } from '@capacitor/app';
import { personCircleOutline, logOutOutline, copyOutline, mailOutline, homeOutline, chevronDownOutline, createOutline, cloudDownloadOutline, cloudUploadOutline, trashOutline } from 'ionicons/icons';
import { STORAGE_KEYS } from '../services/localService';
import { supabase } from '../services/supabaseClient';
import { useHistory } from 'react-router-dom';
import { ENABLE_CLOUD_SYNC } from '../config';

const Settings: React.FC = () => {
    interface Member {
        email: string;
    }

    const [email, setEmail] = useState<string>('');
    const [householdId, setHouseholdId] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [language, setLanguage] = useState<'en-US' | 'id-ID'>(
        (localStorage.getItem('voice_lang') as 'en-US' | 'id-ID') || 'en-US'
    );
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditHouseholdAlert, setShowEditHouseholdAlert] = useState(false);
    const [showDeleteDataAlert, setShowDeleteDataAlert] = useState(false);
    const [appVersion, setAppVersion] = useState<string>('Loading...');
    const history = useHistory();

    useEffect(() => {
        if (!ENABLE_CLOUD_SYNC) return;

        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
                const { data } = await supabase
                    .from('profiles')
                    .select('*') // Select all to see available columns
                    .eq('id', user.id)
                    .single();

                console.log('Current User Profile:', data); // DEBUG

                if (data && data.household_id) {
                    setHouseholdId(data.household_id);
                    fetchMembers(data.household_id);
                }
            }
        };

        const fetchMembers = async (hId: string) => {
            // Temporary: just fetch IDs to see if it works
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('household_id', hId);

            console.log('Household Members:', data); // DEBUG

            if (data) {
                // Map to Member interface, handling missing fields gracefully
                const mappedMembers = data.map((p: any) => ({
                    email: p.email || p.username || p.full_name || `User ${p.id.substring(0, 4)}`
                }));
                setMembers(mappedMembers);
            }
        };

        getProfile();
        getProfile();
    }, []);

    useEffect(() => {
        const getAppInfo = async () => {
            try {
                const info = await App.getInfo();
                setAppVersion(`v${info.version} (${info.build})`);
            } catch (error) {
                console.error('Error getting app info:', error);
                setAppVersion('v1.0.0 (Web)');
            }
        };
        getAppInfo();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        history.push('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            const { error } = await supabase.rpc('delete_user');
            if (error) throw error;

            await supabase.auth.signOut();
            history.push('/login');
            window.location.reload(); // Force reload to clear states
        } catch (error) {
            console.error('Error deleting account:', error);
            setToastMessage('Failed to delete account. Please try again.');
            setShowToast(true);
        }
    };

    const handleUpdateHousehold = async (newId: string) => {
        if (!newId || newId.trim() === '') {
            setToastMessage('Please enter a valid Household ID.');
            setShowToast(true);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('profiles')
                .update({ household_id: newId.trim() })
                .eq('id', user.id);

            if (error) throw error;

            setHouseholdId(newId.trim());
            setToastMessage('Successfully joined new household!');
            setShowToast(true);

            // Reload to sync data
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error: any) {
            console.error('Error updating household:', error);
            setToastMessage(error.message || 'Failed to update household.');
            setShowToast(true);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage('Copied to clipboard!');
        setShowToast(true);
    };

    const handleBackup = () => {
        const data = {
            lists: JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTS) || '[]'),
            items: JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || '[]'),
            history: JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]'),
            version: 1,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shoplist-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setToastMessage('Backup downloaded successfully!');
        setShowToast(true);
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (!data.lists || !data.items) {
                    throw new Error('Invalid backup file format');
                }

                localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(data.lists));
                localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
                if (data.history) {
                    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
                }

                setToastMessage('Data restored successfully! Reloading...');
                setShowToast(true);
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error('Restore error:', error);
                setToastMessage('Failed to restore data. Invalid file.');
                setShowToast(true);
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteData = () => {
        localStorage.removeItem(STORAGE_KEYS.LISTS);
        localStorage.removeItem(STORAGE_KEYS.ITEMS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);

        setToastMessage('All data deleted. Reloading...');
        setShowToast(true);
        setTimeout(() => window.location.reload(), 1500);
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
                            <h2 className="text-xl font-bold text-text-main">
                                {ENABLE_CLOUD_SYNC ? email.split('@')[0] : 'Guest User'}
                            </h2>
                            <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
                                <IonIcon icon={mailOutline} />
                                {ENABLE_CLOUD_SYNC ? email : 'Offline Mode'}
                            </p>
                            {!ENABLE_CLOUD_SYNC && (
                                <span className="mt-2 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                                    Local Storage Only
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Household Info (Only in Cloud Mode) */}
                    {ENABLE_CLOUD_SYNC && (
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
                                </div>
                                <div className="flex gap-1">
                                    <IonButton
                                        fill="clear"
                                        size="small"
                                        onClick={() => setShowEditHouseholdAlert(true)}
                                        className="bg-gray-50 rounded-xl m-0 h-10 w-10 text-gray-500 hover:text-primary"
                                    >
                                        <IonIcon slot="icon-only" icon={createOutline} />
                                    </IonButton>
                                    <IonButton
                                        fill="clear"
                                        size="small"
                                        onClick={() => copyToClipboard(householdId)}
                                        className="bg-gray-50 rounded-xl m-0 h-10 w-10 text-gray-500 hover:text-primary"
                                    >
                                        <IonIcon slot="icon-only" icon={copyOutline} />
                                    </IonButton>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl leading-relaxed">
                                    Share this ID with family members to sync your shopping lists together. Or enter their ID to join them.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Household Members List (Only in Cloud Mode) */}
                    {ENABLE_CLOUD_SYNC && members.length > 0 && (
                        <div className="px-4 pb-2">
                            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Members</h4>
                            <div className="flex flex-wrap gap-2">
                                {members.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-primary">
                                            {member.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-text-main font-medium">{member.email.split('@')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    <IonAlert
                        isOpen={showEditHouseholdAlert}
                        onDidDismiss={() => setShowEditHouseholdAlert(false)}
                        header="Join Household"
                        subHeader="Enter a Family Member's ID"
                        message="Warning: Joining a new household will replace your current lists with the new household's lists."
                        inputs={[
                            {
                                name: 'newHouseholdId',
                                type: 'text',
                                placeholder: 'Paste Household ID here'
                            }
                        ]}
                        buttons={[
                            {
                                text: 'Cancel',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Join',
                                handler: (data) => handleUpdateHousehold(data.newHouseholdId)
                            }
                        ]}
                    />

                    {/* App Settings */}
                    <div className="space-y-2 animate-enter-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-2">App Info</h3>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
                            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                <span className="text-text-main font-medium">Version</span>
                                <span className="text-text-muted text-sm">{appVersion}</span>
                            </div>
                            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                <span className="text-text-main font-medium">Theme</span>
                                <span className="text-primary text-sm font-bold">Soft Blue</span>
                            </div>

                            {/* Language Selector */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-text-main font-medium">Voice Language</span>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('voice_lang', 'en-US');
                                            setLanguage('en-US');
                                            setToastMessage('Language set to English');
                                            setShowToast(true);
                                        }}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en-US' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('voice_lang', 'id-ID');
                                            setLanguage('id-ID');
                                            setToastMessage('Bahasa diatur ke Indonesia');
                                            setShowToast(true);
                                        }}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'id-ID' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                                    >
                                        ID
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legal Section */}
                    <div className="space-y-2 animate-enter-up" style={{ animationDelay: '0.25s' }}>
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-2">Legal</h3>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
                            <button
                                onClick={() => history.push('/privacy')}
                                className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="text-text-main font-medium">Privacy Policy</span>
                                <IonIcon icon={chevronDownOutline} className="text-gray-300 -rotate-90" />
                            </button>
                            <button
                                onClick={() => history.push('/terms')}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="text-text-main font-medium">Terms & Conditions</span>
                                <IonIcon icon={chevronDownOutline} className="text-gray-300 -rotate-90" />
                            </button>
                        </div>
                    </div>

                    {/* Logout Button (Only in Cloud Mode) */}
                    {ENABLE_CLOUD_SYNC && (
                        <div className="pt-4 animate-enter-up" style={{ animationDelay: '0.3s' }}>
                            <button
                                onClick={handleSignOut}
                                className="w-full bg-white border-2 border-red-50 text-red-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <IonIcon icon={logOutOutline} />
                                Sign Out
                            </button>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setShowDeleteAlert(true)}
                                    className="text-xs text-red-300 hover:text-red-500 underline transition-colors"
                                >
                                    Delete Account Permanently
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-300 mt-4">
                                Made with ❤️ by Shoplist Team
                            </p>
                        </div>
                    )}
                    {!ENABLE_CLOUD_SYNC && (
                        <div className="pt-4 text-center">
                            <p className="text-xs text-gray-300 mt-4">
                                Made with ❤️ by Shoplist Team
                            </p>
                        </div>
                    )}
                </div>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Delete Account"
                    subHeader="Warning: This action is irreversible."
                    message="Are you sure you want to delete your account? All your data including shopping lists and history will be permanently removed."
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                        },
                        {
                            text: 'Delete',
                            role: 'destructive',
                            cssClass: 'alert-button-delete', // Custom class if needed
                            handler: handleDeleteAccount
                        }
                    ]}
                />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                    color="dark"
                    className="mb-16"
                />
            </IonContent >
        </IonPage >
    );
};

export default Settings;
