import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TripDetails {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelStyle: string;
  pace: string;
}

function getSeason(dateStr: string): string {
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return "Spring (March-May)";
  if (month >= 6 && month <= 9) return "Monsoon (June-September)";
  if (month >= 10 && month <= 11) return "Autumn (October-November)";
  return "Winter (December-February)";
}

function getDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { tripDetails } = await req.json() as { tripDetails: TripDetails };
    
    const dayCount = getDayCount(tripDetails.startDate, tripDetails.endDate);
    const season = getSeason(tripDetails.startDate);
    const dailyBudget = Math.round(tripDetails.budget / dayCount);

    const travelStyleDescriptions: Record<string, string> = {
      solo: "solo traveler looking for authentic experiences and flexibility",
      couple: "romantic couple seeking memorable experiences together",
      family: "family with mixed ages, needs comfortable and family-friendly options",
      friends: "group of friends looking for fun, adventure, and social experiences",
    };

    const paceDescriptions: Record<string, string> = {
      relaxed: "prefer a relaxed pace with fewer activities but more time to enjoy each place",
      packed: "want to maximize sightseeing and cover as many attractions as possible",
    };

    const systemPrompt = `You are an expert India travel planner. Create detailed, practical day-by-day itineraries with accurate local knowledge. Always provide realistic cost estimates in INR. Consider local weather, festivals, and seasonal factors.`;

    const userPrompt = `Create a ${dayCount}-day travel itinerary for ${tripDetails.destination}, India.

Travel Details:
- Season: ${season}
- Travel Style: ${travelStyleDescriptions[tripDetails.travelStyle] || tripDetails.travelStyle}
- Pace: ${paceDescriptions[tripDetails.pace] || tripDetails.pace}
- Total Budget: ₹${tripDetails.budget.toLocaleString("en-IN")}
- Daily Budget: ₹${dailyBudget.toLocaleString("en-IN")} per day

Please provide a JSON response with this exact structure:
{
  "summary": "Brief 2-3 sentence overview of the trip",
  "totalEstimatedCost": number,
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title/theme",
      "places": [
        {
          "name": "Place name",
          "description": "Brief description",
          "timingTip": "Best time to visit",
          "estimatedCost": number
        }
      ],
      "transport": {
        "mode": "Auto/Metro/Cab/etc",
        "description": "How to get around",
        "estimatedCost": number
      },
      "food": [
        {
          "meal": "Breakfast/Lunch/Dinner",
          "recommendation": "Restaurant or food type",
          "cuisine": "Local specialty",
          "estimatedCost": number
        }
      ],
      "dailyCostBreakdown": {
        "sightseeing": number,
        "transport": number,
        "food": number,
        "miscellaneous": number,
        "total": number
      },
      "tips": ["Practical tip 1", "Practical tip 2"]
    }
  ],
  "packingTips": ["Season-specific packing suggestion"],
  "generalTips": ["Local customs", "Safety tips", "Money-saving tips"]
}

Ensure costs are realistic for ${tripDetails.destination} and stay within the daily budget of ₹${dailyBudget}. Include local gems and must-visit spots.`;

    console.log("Generating itinerary for:", tripDetails.destination);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let itinerary;
    try {
      itinerary = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse itinerary. Please try again.");
    }

    console.log("Itinerary generated successfully for:", tripDetails.destination);

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
