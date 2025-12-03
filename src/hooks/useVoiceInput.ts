import { useState, useRef, useEffect } from 'react';

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
    prototype: SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

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

    // Use useRef to keep track of the recognition instance
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setHasSupport(false);
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after one sentence
        recognitionRef.current.interimResults = true; // Show live results

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const transcriptValue = result[0].transcript;
            setTranscript(transcriptValue);
        };

    }, []);

    const startListening = (lang: 'id-ID' | 'en-US' = 'id-ID') => {
        if (isListening) return; // Prevent starting if already listening

        // Clear previous transcript
        setTranscript('');

        if (recognitionRef.current) {
            recognitionRef.current.lang = lang;
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
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
