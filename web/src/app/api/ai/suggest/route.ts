import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      businessName, 
      businessDescription, 
      agentName, 
      businessType, 
      voicePersonality,
      promptType = "greeting" // greeting, faq, response
    } = body;

    // Get OpenAI API key from environment or user settings
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt based on what we're generating
    let systemPrompt = "";
    let userPrompt = "";

    if (promptType === "name") {
      // AI suggestions for agent names
      const agentType = body.agentType || "voice";
      
      systemPrompt = `You are an expert at naming AI agents and virtual assistants.
        Generate creative, memorable, and professional names for AI agents.
        Names should be easy to pronounce and remember.
        Return exactly 5 name suggestions, one per line, without numbering or explanation.`;

      userPrompt = `Generate 5 unique name suggestions for a ${agentType} AI agent that handles customer service.
        Mix human-like names (e.g., "Sophie", "Alex") with descriptive names (e.g., "ServiceBot", "HelpMate").
        Keep names concise and professional.`;
    } else if (promptType === "description") {
      // AI completion for description field
      const partialText = body.partialText || "";
      const agentType = body.agentType || "voice";
      
      systemPrompt = `You are an expert at writing concise, professional descriptions for AI agents.
        Complete the user's partial description naturally and professionally.
        The description should explain what the agent does and its purpose.
        Keep it to 1-2 sentences, clear and actionable.
        Only return the completed description, nothing else.`;

      userPrompt = partialText 
        ? `Complete this agent description naturally: "${partialText}"
Agent type: ${agentType}
Agent name: ${agentName || "AI Agent"}`
        : `Write a brief description for a ${agentType} AI agent named "${agentName || "AI Agent"}" that helps with customer service.`;
    } else if (promptType === "greeting") {
      systemPrompt = `You are an expert at crafting perfect phone greeting scripts for AI voice assistants. 
        Generate natural, warm greetings that match the specified personality and business type.
        Keep greetings concise but welcoming. Include the business name and agent name naturally.
        Return exactly 3 different greeting options, each on a new line, numbered 1-3.`;

      userPrompt = `Generate 3 phone greeting options for:
        - Business Name: ${businessName || "our business"}
        - Business Type: ${businessType || "general business"}
        - AI Agent Name: ${agentName || "AI assistant"}
        - Voice Personality: ${voicePersonality || "friendly"}
        - Business Description: ${businessDescription || "a customer-focused business"}
        
        Make each greeting unique and match the ${voicePersonality} personality style.`;
    } else if (promptType === "faq") {
      systemPrompt = `You are an expert at anticipating customer questions for businesses.
        Generate relevant FAQs with clear, helpful answers based on the business type and description.
        Return 5 Q&A pairs in JSON format: [{"question": "...", "answer": "..."}]`;

      userPrompt = `Generate 5 relevant FAQ questions and answers for:
        - Business Name: ${businessName}
        - Business Type: ${businessType}
        - Description: ${businessDescription}`;
    } else if (promptType === "response") {
      systemPrompt = `You are an AI voice assistant for a business. 
        Generate helpful, natural responses that an AI phone assistant would give.
        Match the ${voicePersonality} personality style.`;

      userPrompt = body.customerQuery || "How can I help you today?";
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    // Parse the response based on prompt type
    let suggestions: string[] = [];

    if (promptType === "name") {
      // Parse name suggestions
      suggestions = content
        .split(/\n/)
        .map((line: string) => line.replace(/^[\d\-\.\)\*]+\s*/, "").trim())
        .filter((line: string) => line.length > 0 && line.length < 50)
        .slice(0, 5);
    } else if (promptType === "description") {
      // Return completed description directly
      suggestions = [content.trim().replace(/^"|"$/g, "")];
    } else if (promptType === "greeting") {
      // Parse numbered list
      suggestions = content
        .split(/\n/)
        .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 3);
    } else if (promptType === "faq") {
      try {
        suggestions = JSON.parse(content);
      } catch {
        suggestions = [content];
      }
    } else {
      suggestions = [content];
    }

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
