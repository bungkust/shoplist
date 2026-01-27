import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import { WHATS_NEW_DATA } from '../data/whatsNew';

const WhatsNew: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/settings" />
                    </IonButtons>
                    <IonTitle>What's New</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                <div className="max-w-md mx-auto pb-10 space-y-6">
                    {WHATS_NEW_DATA.map((release, index) => (
                        <div key={index} className="bg-white rounded-3xl p-6 shadow-soft animate-enter-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-text-main">Version {release.version}</h3>
                                <span className="text-xs font-medium text-text-muted bg-gray-50 px-2 py-1 rounded-lg">
                                    {new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {release.items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'new' ? 'bg-green-500 shadow-sm shadow-green-200' :
                                            item.type === 'fix' ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-blue-500 shadow-sm shadow-blue-200'
                                            }`} />
                                        <div>
                                            <p className="text-sm text-text-main font-medium leading-relaxed">{item.message}</p>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.type === 'new' ? 'text-green-600' :
                                                item.type === 'fix' ? 'text-red-600' : 'text-blue-600'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="pt-8 text-center">
                        <p className="text-xs text-text-muted">
                            Thanks for using Shoplist!
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default WhatsNew;
