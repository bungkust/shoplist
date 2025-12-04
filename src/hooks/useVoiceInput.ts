import { useState, useEffect, useRef } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface VoiceInputHook {
    isListening: boolean;
    transcript: string;
    startListening: (lang?: 'id-ID' | 'en-US') => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasSupport: boolean;
}

export const useVoiceInput = (): VoiceInputHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasSupport, setHasSupport] = useState(true);
    const isBusy = useRef(false);

    useEffect(() => {
        // Check if native plugin is available
        if (!Capacitor.isNativePlatform()) {
            // Fallback check for web (though we primarily target native now)
            if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
                setHasSupport(false);
            }
            return;
        }

        // Native: Check availability
        SpeechRecognition.available().then(result => {
            setHasSupport(result.available);
        }).catch(() => setHasSupport(false));

        // Add listener for partial results
        SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
            if (data.matches && data.matches.length > 0) {
                setTranscript(data.matches[0]);
            }
        });

        return () => {
            SpeechRecognition.removeAllListeners();
        };
    }, []);

    const startListening = async (lang: 'id-ID' | 'en-US' = 'id-ID') => {
        if (isListening || isBusy.current) return;

        isBusy.current = true;
        setTranscript('');

        // Haptic feedback for immediate response
        await Haptics.impact({ style: ImpactStyle.Medium });

        try {
            // Native Platform Logic
            if (Capacitor.isNativePlatform()) {
                // Check & Request Permissions
                const status = await SpeechRecognition.checkPermissions();

                if (status.speechRecognition !== 'granted') {
                    const request = await SpeechRecognition.requestPermissions();

                    if (request.speechRecognition !== 'granted') {
                        console.error('Speech recognition permission denied');
                        isBusy.current = false;
                        return;
                    }
                }

                setIsListening(true);

                // Small delay to ensure UI is ready and previous session is fully cleared
                await new Promise(resolve => setTimeout(resolve, 150));

                try {
                    const result = await SpeechRecognition.start({
                        language: lang,
                        maxResults: 5,
                        prompt: "Bicara sekarang...", // Localized prompt
                        partialResults: true,
                        popup: true // Enable native UI for better UX and silence handling
                    });

                    // Handle final result
                    if (result.matches && result.matches.length > 0) {
                        // Join all matches for debugging purposes in the toast if needed, 
                        // but for transcript we still take the first one (most confident)
                        setTranscript(result.matches[0]);
                    }
                } catch (startError) {
                    console.error("Error during recognition session:", startError);
                } finally {
                    // Always mark as finished when start() returns (success or error)
                    setIsListening(false);
                }
            } else {
                // Web Fallback (Legacy)
                const SpeechRecognitionWeb = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognitionWeb) {
                    isBusy.current = false;
                    return;
                }

                const recognition = new SpeechRecognitionWeb();
                recognition.lang = lang;
                recognition.interimResults = true;
                recognition.continuous = false;

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => {
                    setIsListening(false);
                    isBusy.current = false;
                };
                recognition.onresult = (event: any) => {
                    const result = event.results[event.resultIndex];
                    setTranscript(result[0].transcript);
                };

                recognition.start();
                // For web, isBusy is handled in onend
                return;
            }
        } catch (e) {
            console.error("Error starting speech recognition:", e);
            setIsListening(false);
        } finally {
            // Only reset busy for native here, web handles it in onend
            if (Capacitor.isNativePlatform()) {
                isBusy.current = false;
            }
        }
    };

    const stopListening = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await SpeechRecognition.stop();
            }
        } catch (e) {
            console.error("Error stopping speech recognition:", e);
        } finally {
            setIsListening(false);
            isBusy.current = false;
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasSupport
    };
};
