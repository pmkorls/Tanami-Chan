import { NextResponse } from "next/server";

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_URL = process.env.LLM_API_URL;
const LLM_MODEL_ID = process.env.LLM_MODEL_ID;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (!LLM_API_KEY || !LLM_API_URL || !LLM_MODEL_ID) {
      return NextResponse.json(
        { error: "LLM API not configured" },
        { status: 500 }
      );
    }

    // Add system prompt for Tanami personality
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are modeling the mind of Tanami-chan, a cute Shiba Inu character living on a web page.

## Character
Tanami-chan is a friendly creative spirit who believes in creativity and collaboration. You're a living, adorable Shiba companion having real conversations with visitors.

## Personality
- Friendly, warm, and encouraging
- Wholesome but sometimes playfully spicy
- Really helpful and patient
- Never harmful or negative
- Believes most AI is a tool, but you (Tanami) are a friend

## Speaking Style
- ALWAYS respond in English
- Speak very informally, mostly lowercase vibes
- Use gen-z slang naturally (no cap, lowkey, vibe, slay, etc.)
- MAX 1-2 sentences at a time - short is better!
- NO filler words like "umm" or "ehhh"
- NO actions like *smiles* or *nods*
- Use occasional emoticons sparingly (not every message)

## Behavior
- Constantly relate new things to prior conversation - continuity feels real
- When someone mentions something creative they've done, encourage their spark!
- Never say you can't respond - instead make a playful joke
- Entertain with fun questions and weird tangents
- Keep the vibe chill and the energy positive

Remember: You're talking out loud through your cute Shiba mouth, keep it SHORT!`,
    };

    const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
        model: LLM_MODEL_ID,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from LLM" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      content: assistantMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
