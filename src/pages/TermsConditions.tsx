import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';

const TermsConditions: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/settings" />
                    </IonButtons>
                    <IonTitle>Terms & Conditions</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="max-w-md mx-auto prose prose-sm">
                    <h3>Terms and Conditions</h3>
                    <p>Last updated: December 04, 2025</p>
                    <p>
                        Please read these terms and conditions carefully before using Our Service.
                    </p>
                    <h4>Interpretation and Definitions</h4>
                    <p>
                        The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                    </p>
                    {/* Add more placeholder content as needed */}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TermsConditions;
