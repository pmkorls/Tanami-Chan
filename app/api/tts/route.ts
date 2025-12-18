import { NextResponse } from "next/server";

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

interface TTSRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
}

export async function POST(request: Request) {
  try {
    const body: TTSRequest = await request.json();
    const { text, languageCode = "en-US", voiceName = "en-US-Casual-K" } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!GOOGLE_TTS_API_KEY) {
      return NextResponse.json(
        { error: "TTS API key not configured" },
        { status: 500 }
      );
    }

    const payload = {
      input: {
        text: text,
      },
      voice: {
        languageCode: languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0,
      },
    };

    const response = await fetch(`${GOOGLE_TTS_URL}?key=${GOOGLE_TTS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS API error:", errorText);
      return NextResponse.json(
        { error: "Failed to synthesize speech" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      return NextResponse.json(
        { error: "No audio content received" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audioContent: audioContent,
      format: "mp3",
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
