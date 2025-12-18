<p align="center">
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f436.png" width="80" alt="Tanami Icon"/>
</p>

<h1 align="center">✨ Tanami-chan ✨</h1>

<p align="center">
  <em>Your adorable AI Shiba companion that talks, thinks, and vibes with you<br>integrated with open souls frameworks</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI_Powered-LLM-FF6B9D?style=for-the-badge" alt="AI"/>
  <img src="https://img.shields.io/badge/Voice-TTS-A78BFA?style=for-the-badge" alt="TTS"/>
</p>

---

## 🌸 About

**Tanami-chan** is an interactive AI companion featuring a cute 3D Shiba Inu character. She's not just another chatbot — she's a friend who speaks, thinks, and has real conversations with you in a beautiful, immersive web experience.

Built with modern web technologies, Tanami brings personality to AI through:
- 🎭 A living 3D character with animated mouth movements
- 🗣️ Natural voice synthesis that syncs with text
- 💬 Personality-driven conversations with memory
- ✨ Smooth, glassmorphic UI with delightful animations

---

## 🎮 Features

### 🐕 Interactive 3D Shiba Character
- Real-time 3D rendered using **Three.js**
- Animated mouth movements synced with speech
- Floating idle animation for that living feel
- Dynamic lighting with ambient glow effects

### 🤖 Intelligent Conversations
- Powered by advanced **Large Language Model (LLM)**
- Maintains conversation context (remembers past messages)
- Unique personality: friendly, gen-z vibes, encouraging
- Short, punchy responses — no walls of text

### 🔊 Voice Synthesis
- Natural Text-to-Speech powered by external **TTS API**
- Real-time audio playback with progress tracking
- Typing animation synced with speech duration
- Seamless audio state management

### 💅 Beautiful UI/UX
- Glassmorphism design with blur effects
- Sakura pink gradient for user messages
- Dark glass aesthetic for AI responses
- Smooth bubble animations with spring physics
- Responsive design for all screen sizes

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.7 |
| **3D Engine** | Three.js + GLTFLoader |
| **Styling** | Tailwind CSS 4.0 |
| **Animation** | Framer Motion |
| **UI Components** | Radix UI Primitives |
| **AI Backend** | External LLM API |
| **Voice** | External TTS API |
| **Font** | Plus Jakarta Sans |

---

## 📁 Project Structure

```
tanami-chan/
├── app/
│   ├── api/
│   │   ├── chat/          # LLM chat endpoint
│   │   │   └── route.ts
│   │   └── tts/           # Text-to-speech endpoint
│   │       └── route.ts
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── ChatInterface.tsx  # Chat UI & message handling
│   └── Scene3D.tsx        # Three.js 3D scene
├── hooks/
│   └── useAudio.ts        # Audio playback hook
├── public/
│   └── models/
│       └── shiba.glb      # 3D Shiba model
└── ...config files
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for LLM and TTS services

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tanami-chan.git
cd tanami-chan

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# LLM Configuration
LLM_API_KEY=your_llm_api_key
LLM_API_URL=your_llm_api_endpoint
LLM_MODEL_ID=your_model_id

# TTS Configuration  
GOOGLE_TTS_API_KEY=your_tts_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to meet Tanami-chan! 🎉

---

## 🎨 Customization

### Changing Tanami's Personality

Edit the system prompt in `app/api/chat/route.ts`:

```typescript
const systemMessage: ChatMessage = {
  role: "system",
  content: `Your custom personality here...`
};
```

### Modifying the 3D Model

Replace `/public/models/shiba.glb` with your own GLTF/GLB model. The mouth animation system will automatically detect vertices in the mouth area.

### Styling

The glassmorphic design can be customized in `app/globals.css`. Key classes:
- `.tanami-bubble` — Message bubble styling
- `.input-overlay` — Input container glass effect
- `.send-button` — Send button gradient

---

## 🎯 API Endpoints

### POST `/api/chat`
Sends messages to the LLM and returns AI response.

```json
{
  "messages": [
    { "role": "user", "content": "Hello Tanami!" }
  ]
}
```

### POST `/api/tts`
Converts text to speech audio.

```json
{
  "text": "Hello! I'm Tanami-chan!",
  "languageCode": "en-US",
  "voiceName": "en-US-Casual-K"
}
```

---

## 🌈 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0c` | Main background |
| User Bubble | `#ff6b9d → #a78bfa` | Sakura pink gradient |
| AI Bubble | `hsl(240, 18%, 20%)` | Dark glass |
| Accent | `#818cf8` | Glow effects |
| Text | `#f0f0f5` | Primary text |
| Muted | `#71717a` | Secondary text |

---

## 📱 Responsive Design

Tanami-chan is fully responsive:
- **Desktop**: Full 3D experience with floating bubbles
- **Tablet**: Optimized spacing and touch targets
- **Mobile**: Compact layout with preserved animations

---

## 🔮 Future Ideas

- [ ] Voice input (speech-to-text)
- [ ] Multiple character skins
- [ ] Emotion detection & reactions
- [ ] Memory persistence across sessions
- [ ] Multi-language support
- [ ] Custom voice selection

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Made with 💕 and lots of ☕</strong>
</p>

<p align="center">
  <em>Say hi to Tanami-chan — she's waiting to be your friend!</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/2728.png" width="24"/>
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f436.png" width="24"/>
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/2728.png" width="24"/>
</p>
