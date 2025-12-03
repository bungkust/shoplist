import React from 'react';
import { IonIcon, IonModal, IonContent } from '@ionic/react';
import { micOutline, closeOutline } from 'ionicons/icons';

interface VoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transcript: string;
    isListening: boolean;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, transcript, isListening }) => {
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className="voice-modal-centered"
        >
            <IonContent className="ion-padding">
                <div className="flex flex-col items-center justify-center h-full space-y-6">

                    {/* Pulse Animation */}
                    <div className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 ${isListening ? 'animate-pulse' : ''}`}>
                        <div className={`absolute w-full h-full rounded-full bg-blue-200 opacity-50 ${isListening ? 'animate-ping' : ''}`}></div>
                        <IonIcon icon={micOutline} className="text-5xl text-primary relative z-10" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-text-main">
                            {isListening ? 'Listening...' : 'Processing...'}
                        </h3>
                        <p className="text-text-muted text-lg min-h-[3rem] px-4">
                            "{transcript || 'Please speak...'}"
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-100 text-text-muted font-medium hover:bg-gray-200 transition-colors"
                    >
                        <IonIcon icon={closeOutline} />
                        <span>Cancel</span>
                    </button>

                </div>
            </IonContent>
        </IonModal>
    );
};

export default VoiceModal;
