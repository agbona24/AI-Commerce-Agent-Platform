import { NextRequest, NextResponse } from "next/server";

// Provider-specific voice validation
const providerVoices: Record<string, string[]> = {
  openai: ["alloy", "nova", "shimmer", "echo", "fable", "onyx"],
  elevenlabs: ["rachel", "drew", "clyde", "paul", "domi", "bella", "antoni", "elli", "josh", "arnold", "charlotte", "matilda"],
  amazon: ["Joanna", "Joanna-Neural", "Matthew", "Matthew-Neural", "Amy", "Brian", "Salli", "Joey", "Kendra", "Kimberly", "Ivy", "Justin"],
  google: ["en-US-Neural2-A", "en-US-Neural2-C", "en-US-Neural2-D", "en-US-Neural2-E", "en-US-Neural2-F", "en-GB-Neural2-A", "en-GB-Neural2-B", "en-AU-Neural2-A", "en-AU-Neural2-B"],
  azure: ["en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural", "en-US-DavisNeural", "en-US-SaraNeural", "en-GB-SoniaNeural", "en-GB-RyanNeural"],
};

async function generateOpenAITTS(voice: string, text: string, speed: number): Promise<ArrayBuffer | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const clampedSpeed = Math.max(0.25, Math.min(4.0, speed));

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voice,
      speed: clampedSpeed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}

async function generateElevenLabsTTS(voice: string, text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  // Voice ID mapping (ElevenLabs uses voice IDs)
  const voiceIdMap: Record<string, string> = {
    rachel: "21m00Tcm4TlvDq8ikWAM",
    drew: "29vD33N1CtxCmqQRPOHJ",
    clyde: "2EiwWnXFnvU5JabPnv8n",
    paul: "5Q0t7uMcjvnagumLfvZi",
    domi: "AZnzlk1XvdvUeBnXmlld",
    bella: "EXAVITQu4vr4xnSDxMaL",
    antoni: "ErXwobaYiN019PkySvjV",
    elli: "MF3mGyEYCl7XYWbV9V6O",
    josh: "TxGEqnHWrfWFTfGW9XjX",
    arnold: "VR6AewLTigWG4xSOukaG",
    charlotte: "XB0fDUnXU5powFXDhCwa",
    matilda: "XrExE9yKIg1WjnnlVkGX",
  };

  const voiceId = voiceIdMap[voice] || voice;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}

// For providers without actual API integration, return null to trigger browser fallback
async function generateMockAudio(provider: string, voice: string, text: string): Promise<null> {
  console.log(`Mock TTS for ${provider}/${voice}: ${text}`);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voice, text, speed = 1.0, provider = "openai" } = body;

    if (!voice || !text) {
      return NextResponse.json(
        { error: "Voice and text are required" },
        { status: 400 }
      );
    }

    // Validate provider
    if (!providerVoices[provider]) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Validate voice for provider
    if (!providerVoices[provider].includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice for provider ${provider}` },
        { status: 400 }
      );
    }

    let audioBuffer: ArrayBuffer | null = null;

    try {
      switch (provider) {
        case "openai":
          audioBuffer = await generateOpenAITTS(voice, text, speed);
          break;
        case "elevenlabs":
          audioBuffer = await generateElevenLabsTTS(voice, text);
          break;
        case "amazon":
        case "google":
        case "azure":
          // These require server-side SDK integration
          // Return 204 to signal frontend to use browser fallback
          audioBuffer = await generateMockAudio(provider, voice, text);
          break;
        default:
          audioBuffer = await generateOpenAITTS(voice, text, speed);
      }
    } catch (error) {
      console.error(`TTS generation error for ${provider}:`, error);
      // Return 204 to signal frontend to use browser fallback
      return new NextResponse(null, { status: 204 });
    }

    if (!audioBuffer) {
      // Return 204 to signal frontend to use browser fallback
      return new NextResponse(null, { status: 204 });
    }

    // Return the audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
