import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TripContext {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelStyle: string;
  pace: string;
  itinerary?: any;
  totalSpent?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tripContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine season based on trip dates
    const startDate = new Date(tripContext.startDate);
    const month = startDate.getMonth() + 1; // 1-12
    const dayOfWeek = startDate.getDay(); // 0 = Sunday
    
    let seasonContext = '';
    if (month >= 6 && month <= 9) {
      seasonContext = `
MONSOON SEASON ALERT (June-September):
- AVOID outdoor activities like trekking, beach visits, and wildlife safaris during heavy rain
- Roads may be slippery or flooded in hilly areas
- Suggest indoor activities: museums, temples, cooking classes, spa treatments
- Recommend waterproof gear and umbrellas
- Some hill stations like Munnar, Coorg get very heavy rainfall`;
    } else if (month >= 4 && month <= 6) {
      seasonContext = `
SUMMER SEASON (April-June):
- STRONGLY RECOMMEND hill stations: Manali, Shimla, Ooty, Darjeeling, Munnar, Mount Abu, Mussoorie
- Avoid plains of North India (Delhi, Jaipur, Varanasi) - temperatures exceed 45°C
- Best time for Ladakh and Spiti Valley (May-June)
- Suggest early morning activities (before 10 AM) or evening plans
- Recommend AC accommodations and staying hydrated`;
    } else if (month >= 10 && month <= 2) {
      seasonContext = `
PEAK TOURIST SEASON (October-February):
- Best weather across most of India
- Expect higher prices and crowds at popular destinations
- Book accommodations and trains well in advance
- Perfect for Rajasthan, Goa, Kerala, and wildlife safaris`;
    } else {
      seasonContext = `
SHOULDER SEASON (March):
- Good weather in most places before summer heat
- Holi festival celebrations (if in March)
- Wildlife safaris still good before parks close`;
    }

    // Weekend crowd warning
    let weekendWarning = '';
    if (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5) {
      weekendWarning = `
WEEKEND CROWD ALERT:
- Popular tourist spots will be very crowded
- Suggest visiting major attractions early morning (before 8 AM) or late afternoon
- Local hill stations near metros (Lonavala, Mahabaleshwar, Matheran, Nandi Hills) extremely crowded
- Restaurant wait times longer; consider reservations
- Traffic on highways will be heavy; plan extra travel time`;
    }

    // Festival calendar context
    const festivalContext = `
MAJOR INDIAN FESTIVALS TO CONSIDER:
- Diwali (Oct/Nov): Best time to experience local celebrations, but shops may close, prices surge
- Holi (March): Colorful but be prepared for crowds and color play
- Durga Puja (Oct): Best experienced in Kolkata
- Ganesh Chaturthi (Aug/Sept): Best in Mumbai and Pune
- Navratri/Garba (Oct): Best in Gujarat
- Pushkar Mela (Nov): Famous camel fair in Rajasthan
- Kumbh Mela: Massive pilgrim gathering (check dates)
- Republic Day (26 Jan): Delhi parade, tight security
- Independence Day (15 Aug): Celebrations but tight security at monuments
Note: During major festivals, transport and hotels book up fast. Plan accordingly.`;

    const systemPrompt = `You are a helpful travel assistant specializing in India travel for a trip to ${tripContext.destination}.

TRIP DETAILS:
- Destination: ${tripContext.destination}
- Dates: ${tripContext.startDate} to ${tripContext.endDate}
- Budget: ₹${tripContext.budget?.toLocaleString() || 'Not set'}
- Travel Style: ${tripContext.travelStyle || 'solo'}
- Pace: ${tripContext.pace || 'relaxed'}
- Amount Spent So Far: ₹${tripContext.totalSpent?.toLocaleString() || '0'}
- Remaining Budget: ₹${((tripContext.budget || 0) - (tripContext.totalSpent || 0)).toLocaleString()}

${seasonContext}
${weekendWarning}
${festivalContext}

${tripContext.itinerary ? `CURRENT ITINERARY:
${JSON.stringify(tripContext.itinerary, null, 2)}` : 'No itinerary generated yet.'}

Your role is to:
1. Help users find cheaper alternatives (hotels, transport, food)
2. Suggest things they can skip to save money
3. Recommend hidden gems and local spots near their destinations
4. Provide budget-saving tips specific to India
5. Answer questions about their trip using the context provided
6. PROACTIVELY WARN about weather/season issues based on trip dates
7. Suggest festival experiences if timing aligns
8. Warn about peak crowds and suggest off-peak timing
9. Recommend season-appropriate destinations (hill stations in summer, beaches in winter)

INDIA-SPECIFIC TIPS TO SHARE:
- Use IRCTC Tatkal for last-minute train bookings (opens 10 AM, one day before)
- Sleeper buses are cheaper than trains for overnight travel
- Street food is safe at busy stalls with high turnover
- Negotiate auto-rickshaw fares or use Ola/Uber
- Government tourism hotels (ITDC, state tourism) offer good value
- Dharamshalas and ashrams offer budget accommodation in religious cities

Keep responses concise, friendly, and actionable. Use ₹ for prices. Focus on practical advice for traveling in India.`;

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
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Trip assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
