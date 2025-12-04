import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';

const PrivacyPolicy: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/settings" />
                    </IonButtons>
                    <IonTitle>Privacy Policy</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="max-w-md mx-auto prose prose-sm">
                    <h3>Privacy Policy</h3>
                    <p>Last updated: December 04, 2025</p>
                    <p>
                        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                    </p>
                    <h4>Collecting and Using Your Personal Data</h4>
                    <p>
                        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>
                    {/* Add more placeholder content as needed */}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivacyPolicy;
