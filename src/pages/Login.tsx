import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonToast, IonIcon } from '@ionic/react';
import { logInOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // In a real local-first app, we might check password against a stored hash,
            // but for this "Guest/Local" mode, we just allow access.
            // Ensure user profile exists or create a default one
            if (!localStorage.getItem('user_profile')) {
                localStorage.setItem('user_profile', JSON.stringify({
                    id: 'guest_user',
                    name: 'Guest',
                    email: email || 'guest@local'
                }));
            }

            localStorage.setItem('app_initialized', 'true');
            setLoading(false);
            history.push('/home');
        }, 1000);
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding bg-app-bg flex items-center justify-center h-full">
                <div className="flex flex-col justify-center h-full max-w-sm mx-auto space-y-6">

                    <div className="text-center space-y-2">
                        <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200">
                            <IonIcon icon={logInOutline} className="text-3xl text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-text-main">Welcome Back</h1>
                        <p className="text-text-muted">Sign in to manage your shopping lists.</p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="bg-white rounded-xl border border-gray-200 px-4 py-1 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <IonInput
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onIonChange={e => setEmail(e.detail.value!)}
                                className="text-text-main"
                            />
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 px-4 py-1 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <IonInput
                                type="password"
                                placeholder="Password"
                                value={password}
                                onIonChange={e => setPassword(e.detail.value!)}
                                className="text-text-main"
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <IonButton
                            expand="block"
                            onClick={handleLogin}
                            disabled={loading}
                            className="rounded-xl h-12 font-bold shadow-md"
                            shape="round"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </IonButton>

                        <div className="text-center">
                            <IonButton fill="clear" onClick={() => history.push('/register')} size="small" className="text-text-muted lowercase">
                                <span className="text-gray-500">Don't have an account?</span> <span className="font-bold ml-1 text-blue-600">Register</span>
                            </IonButton>
                        </div>
                    </div>

                </div>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color="danger"
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
