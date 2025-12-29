import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceRequest {
  places: Array<{
    name: string;
    description: string;
    dayNumber: number;
  }>;
  destination: string;
}

interface PlaceDetails {
  name: string;
  description: string;
  dayNumber: number;
  lat: number;
  lng: number;
  photoUrl: string | null;
  placeId: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      throw new Error('Google Places API key not configured');
    }

    const { places, destination }: PlaceRequest = await req.json();
    
    if (!places || !Array.isArray(places) || places.length === 0) {
      console.log('No places provided');
      return new Response(
        JSON.stringify({ places: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${places.length} places for destination: ${destination}`);

    const placeDetails: PlaceDetails[] = [];

    for (const place of places) {
      try {
        // Use Text Search to find the place
        const searchQuery = `${place.name}, ${destination}`;
        console.log(`Searching for: ${searchQuery}`);
        
        const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
        searchUrl.searchParams.set('query', searchQuery);
        searchUrl.searchParams.set('key', apiKey);

        const searchResponse = await fetch(searchUrl.toString());
        const searchData = await searchResponse.json();

        if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
          const result = searchData.results[0];
          const location = result.geometry?.location;
          
          let photoUrl: string | null = null;
          
          // Get photo if available
          if (result.photos && result.photos.length > 0) {
            const photoReference = result.photos[0].photo_reference;
            // Construct photo URL
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
          }

          placeDetails.push({
            name: place.name,
            description: place.description,
            dayNumber: place.dayNumber,
            lat: location?.lat || 0,
            lng: location?.lng || 0,
            photoUrl,
            placeId: result.place_id || null,
          });

          console.log(`Found place: ${place.name} at (${location?.lat}, ${location?.lng})`);
        } else {
          console.log(`Place not found or API error for: ${place.name}, status: ${searchData.status}`);
          
          // Still add the place without coordinates (will be skipped on frontend)
          placeDetails.push({
            name: place.name,
            description: place.description,
            dayNumber: place.dayNumber,
            lat: 0,
            lng: 0,
            photoUrl: null,
            placeId: null,
          });
        }

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (placeError) {
        console.error(`Error processing place ${place.name}:`, placeError);
        placeDetails.push({
          name: place.name,
          description: place.description,
          dayNumber: place.dayNumber,
          lat: 0,
          lng: 0,
          photoUrl: null,
          placeId: null,
        });
      }
    }

    console.log(`Successfully processed ${placeDetails.filter(p => p.lat !== 0).length}/${places.length} places`);

    return new Response(
      JSON.stringify({ places: placeDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in get-place-details:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
