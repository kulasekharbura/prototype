'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscription, disabled }: VoiceButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscription(transcript);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      recognitionRef.current = null;

      if (event.error === 'no-speech') {
        setError('No speech detected. Try again.');
      } else if (event.error === 'audio-capture') {
        setError('Microphone not found. Check your device.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Allow permissions.');
      } else {
        setError('Voice capture failed. Try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setError('Failed to start voice capture.');
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [onTranscription]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Hide entirely if not supported
  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={[
          'rounded-full h-11 w-11 transition-all duration-200',
          isListening
            ? 'bg-[var(--color-error-text)] text-white animate-pulse scale-110'
            : 'bg-[var(--color-shop-50)] text-[var(--color-shop-600)] border border-[var(--color-shop-200)] hover:bg-[var(--color-shop-100)]',
        ].join(' ')}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={isListening ? 'Tap to stop' : 'Speak your situation'}
      >
        <Mic className="h-5 w-5" />
      </Button>

      {isListening && (
        <span className="text-xs text-[var(--color-error-text)] font-medium animate-pulse">
          Listening…
        </span>
      )}

      {error && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="text-xs text-[var(--color-error-text)] text-center">{error}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={startListening}
            disabled={disabled}
            className="h-auto p-0 text-xs"
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
