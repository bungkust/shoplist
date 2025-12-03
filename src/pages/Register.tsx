import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonLoading, IonToast, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { personAddOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
    const history = useHistory();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setToastMessage('Mohon isi semua kolom.');
            setShowToast(true);
            return;
        }

        if (password.length < 6) {
            setToastMessage('Password minimal 6 karakter.');
            setShowToast(true);
            return;
        }

        if (password !== confirmPassword) {
            setToastMessage('Password dan Konfirmasi Password tidak sama.');
            setShowToast(true);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });
        setLoading(false);

        if (error) {
            setToastMessage(error.message);
        } else {
            setToastMessage('Registrasi berhasil! Cek email untuk verifikasi.');
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        }
        setShowToast(true);
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/login" />
                    </IonButtons>
                    <IonTitle>Buat Akun</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding bg-app-bg">
                <div className="flex flex-col items-center justify-center min-h-[80%] max-w-sm mx-auto space-y-6">

                    <div className="text-center space-y-2 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-2">
                            <IonIcon icon={personAddOutline} className="text-3xl text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-main">Selamat Datang</h2>
                        <p className="text-text-muted">Daftar untuk mulai mencatat belanjaan.</p>
                    </div>

                    <form onSubmit={handleRegister} className="w-full space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-muted ml-1">Nama Lengkap</label>
                                <IonInput
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    value={name}
                                    onIonChange={e => setName(e.detail.value!)}
                                    className="custom-input px-4 py-3 bg-gray-50 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-muted ml-1">Email</label>
                                <IonInput
                                    type="email"
                                    placeholder="name@email.com"
                                    value={email}
                                    onIonChange={e => setEmail(e.detail.value!)}
                                    className="custom-input px-4 py-3 bg-gray-50 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-muted ml-1">Password</label>
                                <div className="relative">
                                    <IonInput
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onIonChange={e => setPassword(e.detail.value!)}
                                        className="custom-input px-4 py-3 bg-gray-50 rounded-lg"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-2"
                                    >
                                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-muted ml-1">Confirm Password</label>
                                <IonInput
                                    type="password"
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onIonChange={e => setConfirmPassword(e.detail.value!)}
                                    className="custom-input px-4 py-3 bg-gray-50 rounded-lg"
                                    required
                                />
                            </div>

                        </div>

                        <IonButton expand="block" type="submit" className="h-12 font-bold rounded-xl shadow-md mt-6" shape="round">
                            Register Now
                        </IonButton>

                    </form>

                </div>

                <IonLoading isOpen={loading} message="Processing registration..." />
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    position="top"
                    color={toastMessage.includes('successful') ? 'success' : 'danger'}
                />
            </IonContent>
        </IonPage>
    );
};

export default Register;
