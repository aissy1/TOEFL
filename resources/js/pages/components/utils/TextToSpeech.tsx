// hooks/useSpeech.ts
import { useEffect, useRef } from 'react';

export function useSpeech() {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = (text: string, onEnd?: () => void) => {
        if (!window.speechSynthesis) {
            onEnd?.();
            return;
        }

        window.speechSynthesis.cancel(); // stop jika ada yang sedang berjalan

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // sedikit lebih lambat
        utterance.pitch = 1;
        utterance.volume = 0.5;

        utterance.onend = () => onEnd?.();
        utterance.onerror = () => onEnd?.(); // fallback jika error

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
        window.speechSynthesis?.cancel();
    };

    // Cleanup saat unmount
    useEffect(() => {
        return () => cancel();
    }, []);

    return { speak, cancel };
}
