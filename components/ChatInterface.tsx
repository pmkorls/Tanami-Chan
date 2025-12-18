"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAudio } from "@/hooks/useAudio";

interface Message {
  id: string;
  role: "user" | "tanami";
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

function FloatingBubbles({
  messages,
  typingMessageId,
  typingProgress,
  avoidBottomPx,
}: {
  messages: Message[];
  typingMessageId: string | null;
  typingProgress: number;
  avoidBottomPx: number;
}) {
  const getDisplayText = (msg: Message) => {
    if (msg.id === typingMessageId && typingProgress < 1) {
      const len = Math.max(1, Math.floor(msg.content.length * typingProgress));
      return msg.content.slice(0, len) + "▌";
    }
    return msg.content;
  };

  return (
    <div
      className="tanami-bubble-layer"
      aria-hidden="true"
      style={
        {
          "--tanami-bubble-avoid-bottom": `${Math.max(0, avoidBottomPx)}px`,
        } as React.CSSProperties
      }
    >
      <div className="tanami-bubble-stack">
        {messages.slice(-3).map((msg) => (
          <div
            key={msg.id}
            className={`tanami-bubble-item ${
              msg.role === "user"
                ? "tanami-bubble-item--user"
                : "tanami-bubble-item--tanami"
            }`}
            style={{ opacity: 1 }}
          >
            <div className="tanami-bubble">{getDisplayText(msg)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatInput({
  disabled,
  isLoading,
  onSend,
}: {
  disabled: boolean;
  isLoading: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isLoading) return;
    onSend(trimmed);
    setText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onSend, text, disabled, isLoading]);

  return (
    <div className="input-row">
      <input
        ref={inputRef}
        type="text"
        className="input-field"
        value={text}
        placeholder="type a message…"
        disabled={disabled || isLoading}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (e.shiftKey) return;
          e.preventDefault();
          send();
        }}
      />
      <button
        className="send-button"
        disabled={disabled || isLoading || text.trim().length === 0}
        onClick={send}
      >
        {isLoading ? "..." : "Send"}
      </button>
    </div>
  );
}

export function ChatInterface({ onSpeakingChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "tanami",
      content: "Hello! I'm Tanami-chan ✨",
      timestamp: Date.now(),
    },
  ]);
  const [isConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingProgress, setTypingProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState(140);
  const currentMessageIdRef = useRef<string | null>(null);

  const { isPlaying, isLoading: isAudioLoading, speakText } = useAudio({
    onStart: () => {
      onSpeakingChange?.(true);
    },
    onTimeUpdate: (currentTime, duration) => {
      if (duration > 0) {
        setTypingProgress(currentTime / duration);
      }
    },
    onEnd: () => {
      onSpeakingChange?.(false);
      setTypingProgress(1);
      setTypingMessageId(null);
    },
    onError: (error) => {
      console.error("Audio error:", error);
      onSpeakingChange?.(false);
      setTypingProgress(1);
      setTypingMessageId(null);
    },
  });

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setOverlayHeight(Math.max(120, Math.round(rect.height + 10)));
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build message history for context
        const chatHistory = messages
          .slice(-10)
          .map((msg) => ({
            role: msg.role === "tanami" ? "assistant" : "user",
            content: msg.content,
          }));

        chatHistory.push({
          role: "user",
          content: text,
        });

        // Call chat API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: chatHistory }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        const aiContent = data.content || "Sorry, I couldn't respond right now.";

        // Create message ID for typing sync
        const messageId = `tanami-${Date.now()}`;
        currentMessageIdRef.current = messageId;

        // Set typing state BEFORE adding message to prevent flash
        setTypingMessageId(messageId);
        setTypingProgress(0);

        // Add AI message (will be revealed progressively)
        const aiMessage: Message = {
          id: messageId,
          role: "tanami",
          content: aiContent,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Speak the response (typing will sync with audio)
        await speakText(aiContent);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: `tanami-${Date.now()}`,
          role: "tanami",
          content: "Sorry, something went wrong. Please try again! 🙏",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        currentMessageIdRef.current = null;
      }
    },
    [messages, speakText]
  );

  const isBusy = isLoading || isPlaying || isAudioLoading;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <FloatingBubbles
        messages={messages}
        typingMessageId={typingMessageId}
        typingProgress={typingProgress}
        avoidBottomPx={overlayHeight}
      />

      <div
        ref={overlayRef}
        className="input-overlay"
        style={{ pointerEvents: "auto" }}
      >
        <div className="input-header">
          <div className="input-status">
            <span>{isConnected ? "🟢" : "🔴"}</span>
            {isLoading && (
              <span style={{ marginLeft: 8, fontSize: 12 }}>Thinking...</span>
            )}
            {isPlaying && (
              <span style={{ marginLeft: 8, fontSize: 12 }}>Speaking...</span>
            )}
          </div>
          <span className="input-brand">tanami</span>
        </div>

        <ChatInput disabled={isBusy} isLoading={isLoading} onSend={handleSend} />
      </div>
    </div>
  );
}
