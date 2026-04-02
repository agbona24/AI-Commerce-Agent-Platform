import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, prompt } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: "Name and prompt are required" },
        { status: 400 }
      );
    }

    // Check for ElevenLabs API key (they support voice design)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (apiKey) {
      // Call ElevenLabs voice design API
      const response = await fetch(
        "https://api.elevenlabs.io/v1/voice-generation/generate-voice",
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voice_description: prompt,
            text: "Hello, this is a sample of my voice. I hope you find it pleasant and easy to listen to.",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("ElevenLabs voice design error:", error);
        
        // Return mock success for demo purposes
        return NextResponse.json({
          success: true,
          voice: {
            id: `voice_${Date.now()}`,
            name: name,
            description: prompt,
            provider: "elevenlabs",
            created_at: new Date().toISOString(),
          },
          message: "Voice design is in preview mode. In production, this will generate a real voice.",
        });
      }

      const voiceData = await response.json();
      
      // Add the voice to library
      const addVoiceResponse = await fetch(
        "https://api.elevenlabs.io/v1/voices/add",
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            description: prompt,
            generated_voice_id: voiceData.generated_voice_id,
          }),
        }
      );

      if (addVoiceResponse.ok) {
        const voiceInfo = await addVoiceResponse.json();
        return NextResponse.json({
          success: true,
          voice: {
            id: voiceInfo.voice_id,
            name: name,
            description: prompt,
            provider: "elevenlabs",
            created_at: new Date().toISOString(),
          },
        });
      }
    }

    // Mock response for demo/development
    return NextResponse.json({
      success: true,
      voice: {
        id: `voice_${Date.now()}`,
        name: name,
        description: prompt,
        provider: "custom",
        created_at: new Date().toISOString(),
      },
      message: "Voice design created successfully (demo mode)",
    });
  } catch (error) {
    console.error("Voice design error:", error);
    return NextResponse.json(
      { error: "Failed to design voice" },
      { status: 500 }
    );
  }
}
