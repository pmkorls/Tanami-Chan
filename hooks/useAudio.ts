"use client";

import { useCallback, useRef, useState } from "react";

interface UseAudioOptions {
  onStart?: (duration: number) => void;
  onEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: Error) => void;
}

export function useAudio(options: UseAudioOptions = {}) {
  const { onStart, onEnd, onTimeUpdate, onError } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const progress = duration > 0 ? currentTime / duration : 0;

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playBase64 = useCallback(
    async (base64Audio: string, format: string = "mp3") => {
      try {
        stop();
        setIsLoading(true);

        const audio = new Audio(`data:audio/${format};base64,${base64Audio}`);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
          onStart?.(audio.duration);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
          onTimeUpdate?.(audio.currentTime, audio.duration);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(audio.duration);
          audioRef.current = null;
          onEnd?.();
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentTime(0);
          setDuration(0);
          audioRef.current = null;
          const error = new Error("Failed to play audio");
          onError?.(error);
        };

        await audio.play();
      } catch (error) {
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentTime(0);
        setDuration(0);
        audioRef.current = null;
        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [onStart, onEnd, onTimeUpdate, onError, stop]
  );

  const speakText = useCallback(
    async (text: string) => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("Failed to synthesize speech");
        }

        const data = await response.json();
        await playBase64(data.audioContent, data.format || "mp3");
      } catch (error) {
        setIsLoading(false);
        onError?.(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
    [playBase64, onError]
  );

  return {
    isPlaying,
    isLoading,
    duration,
    currentTime,
    progress,
    playBase64,
    speakText,
    stop,
  };
}
