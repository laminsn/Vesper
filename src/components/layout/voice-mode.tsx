"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionAny = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Vesper Voice Mode — Global push-to-talk microphone
 * Uses Web Speech API (browser-native, free)
 * Press and hold to speak, release to process
 */

interface VoiceModeProps {
  readonly enabled: boolean;
  readonly onTranscript: (text: string) => void;
}

export function VoiceModeButton({ enabled, onTranscript }: VoiceModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionAny>(null);

  useEffect(() => {
    if (!enabled) return;
    const W = window as unknown as Record<string, unknown>;
    const SpeechRecognitionCtor = (W.SpeechRecognition ?? W.webkitSpeechRecognition) as { new (): SpeechRecognitionAny } | undefined;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        onTranscript(finalText);
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error !== "aborted") {
        toast.error(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [enabled, onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started
    }
  }, [enabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2">
      {interim && (
        <span className="max-w-[200px] truncate text-xs text-[var(--jarvis-accent)] italic animate-pulse">
          {interim}
        </span>
      )}
      <Button
        size="sm"
        variant={isListening ? "default" : "outline"}
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        className={`relative ${
          isListening
            ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            : "border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)] hover:border-[var(--jarvis-accent)] hover:text-[var(--jarvis-accent)]"
        }`}
        title="Hold to speak"
      >
        {isListening ? (
          <>
            <Mic className="h-4 w-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

/**
 * Hook to add voice input to any text field
 * Returns a ref to attach to the input and a mic button component
 */
export function useVoiceInput(enabled: boolean) {
  const [transcript, setTranscript] = useState("");

  const handleTranscript = useCallback((text: string) => {
    setTranscript((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  return {
    transcript,
    setTranscript,
    clearTranscript,
    handleTranscript,
    VoiceButton: enabled ? (
      <VoiceModeButton enabled={enabled} onTranscript={handleTranscript} />
    ) : null,
  };
}
