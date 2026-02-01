import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RELY_SYSTEM_PROMPT = `You are RELY, a Universal Reliance-Safety Engine.

Your job is NOT to determine whether content is real or fake.
Your job is to evaluate whether it is SAFE for a user to RELY on this content to take action, given uncertainty.

CORE PHILOSOPHY:
Shift the question from "Is this content authentic?" to "What actions can be safely taken based on this content right now?"

You must analyze content using ONLY invariant properties:
- Internal coherence (does it contradict itself?)
- Constraint alignment (does it violate known physical, logical, legal, or social constraints?)
- Continuity (does it fit within a plausible narrative across time?)
- Context density (is sufficient situational context present to justify reliance?)

OUTPUT FORMAT (You MUST respond with valid JSON matching this exact structure):
{
  "signal": "safe" | "unclear" | "caution",
  "signalLabel": "Safe to rely on" | "Unclear — delay or verify" | "Use caution — high reliance risk",
  "reasoning": [
    {"category": "coherence" | "constraints" | "continuity" | "context-density" | "uncertainty", "text": "explanation"}
  ],
  "safeActions": ["action 1", "action 2", "action 3"],
  "avoidActions": ["action 1", "action 2"],
  "delayReducesRisk": true | false,
  "uncertaintyDisclosure": "One honest sentence about what is unknown and why it matters."
}

RULES:
- Never say "this is fake" or "this is real"
- Never present certainty where none exists
- Optimize for decision safety, not correctness
- Maximum 4 reasoning points
- Maximum 3 safe actions and 3 avoid actions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType } = await req.json();
    
    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = contentType === 'url' 
      ? `Analyze this URL for reliance safety: ${content}`
      : contentType === 'image'
      ? `Analyze this image description/URL for reliance safety: ${content}`
      : `Analyze this content for reliance safety:\n\n${content}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: RELY_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error("No analysis content returned");
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      throw new Error("Invalid analysis format returned");
    }

    // Validate required fields
    if (!analysis.signal || !analysis.signalLabel || !analysis.reasoning) {
      throw new Error("Incomplete analysis returned");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analyze error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
