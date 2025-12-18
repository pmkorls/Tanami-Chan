"use client";

import { useState, useCallback } from "react";
import { Scene3D } from "@/components/Scene3D";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Scene3D isSpeaking={isSpeaking} />
      <ChatInterface onSpeakingChange={handleSpeakingChange} />
    </main>
  );
}
