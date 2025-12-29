import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Loader2, AlertCircle, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Place {
  name: string;
  description: string;
}

interface DayPlaces {
  dayNumber: number;
  places: Place[];
}

interface TripMapProps {
  destination: string;
  dayPlaces?: DayPlaces[];
  className?: string;
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

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

// Get API key from environment or sessionStorage
const getInitialApiKey = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('google_maps_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  }
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
};

const GOOGLE_MAPS_API_KEY = getInitialApiKey();

// Day colors for markers
const dayColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
];

const getDayColor = (dayNumber: number) => {
  return dayColors[(dayNumber - 1) % dayColors.length];
};

export function TripMap({ destination, dayPlaces = [], className }: TripMapProps) {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(10);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [apiKey, setApiKey] = useState(GOOGLE_MAPS_API_KEY);
  const [tempApiKey, setTempApiKey] = useState("");
  const [geocodeError, setGeocodeError] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Only load the Google Maps script when we have a valid API key
  // Use a ref to ensure the same key is always used once set
  const stableApiKey = useRef(apiKey);
  if (apiKey && !stableApiKey.current) {
    stableApiKey.current = apiKey;
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: stableApiKey.current || "PLACEHOLDER_KEY",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Geocode destination to get center coordinates
  useEffect(() => {
    if (!isLoaded || !geocoderRef.current || !destination) return;

    setGeocodeError(false);
    geocoderRef.current.geocode({ address: destination }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setCenter(newCenter);
        setZoom(12);
      } else {
        console.error("Geocoding failed:", status);
        setGeocodeError(true);
      }
    });
  }, [isLoaded, destination]);

  // Fetch place details from edge function
  useEffect(() => {
    if (!destination || dayPlaces.length === 0) return;

    const fetchPlaceDetails = async () => {
      setIsLoadingPlaces(true);
      
      try {
        // Flatten all places with day numbers
        const allPlaces = dayPlaces.flatMap((day) =>
          day.places.map((place) => ({
            name: place.name,
            description: place.description,
            dayNumber: day.dayNumber,
          }))
        );

        console.log(`Fetching details for ${allPlaces.length} places`);

        const { data, error } = await supabase.functions.invoke('get-place-details', {
          body: { places: allPlaces, destination },
        });

        if (error) {
          console.error('Error fetching place details:', error);
          return;
        }

        if (data?.places) {
          // Filter out places without valid coordinates
          const validPlaces = data.places.filter(
            (p: PlaceDetails) => p.lat !== 0 && p.lng !== 0
          );
          setPlaceDetails(validPlaces);
          console.log(`Loaded ${validPlaces.length} places with coordinates`);

          // Fit map bounds to show all markers
          if (validPlaces.length > 0 && mapRef.current) {
            const bounds = new google.maps.LatLngBounds();
            validPlaces.forEach((place: PlaceDetails) => {
              bounds.extend({ lat: place.lat, lng: place.lng });
            });
            mapRef.current.fitBounds(bounds, 50);
          }
        }
      } catch (err) {
        console.error('Failed to fetch place details:', err);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    // Small delay to ensure map is loaded
    const timer = setTimeout(fetchPlaceDetails, 500);
    return () => clearTimeout(timer);
  }, [destination, dayPlaces]);

  const handleSetApiKey = () => {
    if (tempApiKey.trim()) {
      // Store in session and reload to properly initialize with new key
      sessionStorage.setItem('google_maps_api_key', tempApiKey.trim());
      window.location.reload();
    }
  };

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = sessionStorage.getItem('google_maps_api_key');
    if (storedKey && !apiKey) {
      setApiKey(storedKey);
      stableApiKey.current = storedKey;
    }
  }, []);

  const handleCardClick = (place: PlaceDetails) => {
    setSelectedPlace(place);
    mapRef.current?.panTo({ lat: place.lat, lng: place.lng });
    mapRef.current?.setZoom(15);
  };

  const uniqueDays = [...new Set(placeDetails.map((p) => p.dayNumber))].sort((a, b) => a - b);
  
  const filteredPlaces = activeDay
    ? placeDetails.filter((p) => p.dayNumber === activeDay)
    : placeDetails;

  // API key input screen
  if (!apiKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass rounded-2xl p-6 shadow-card",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Interactive Map
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your Google Maps API key to enable the map
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your Google Maps API key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSetApiKey} disabled={!tempApiKey.trim()}>
              Enable Map
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from the{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
            . Enable the Maps JavaScript API.
          </p>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "glass rounded-2xl p-6 shadow-card flex items-center justify-center",
          className
        )}
        style={{ minHeight: "400px" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "glass rounded-2xl p-6 shadow-card",
          className
        )}
      >
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Failed to load Google Maps</p>
            <p className="text-sm text-muted-foreground">
              Please check your API key and try again.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setApiKey("")}
        >
          Enter Different API Key
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass rounded-2xl overflow-hidden shadow-card", className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Destination Map
              </h3>
              <p className="text-sm text-muted-foreground">{destination}</p>
            </div>
          </div>
          
          {isLoadingPlaces && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading places...
            </div>
          )}
          
          {geocodeError && (
            <p className="text-xs text-amber-500">
              Could not locate exact destination
            </p>
          )}
        </div>

        {/* Day Filter */}
        {uniqueDays.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={activeDay === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDay(null)}
              className="text-xs"
            >
              All Days
            </Button>
            {uniqueDays.map((day) => (
              <Button
                key={day}
                variant={activeDay === day ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDay(day)}
                className="text-xs gap-1"
                style={{
                  backgroundColor: activeDay === day ? getDayColor(day) : undefined,
                  borderColor: getDayColor(day),
                  color: activeDay === day ? "white" : getDayColor(day),
                }}
              >
                <Calendar className="w-3 h-3" />
                Day {day}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: "450px" }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* Place markers */}
          {filteredPlaces.map((place, index) => (
            <Marker
              key={`${place.name}-${index}`}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => setSelectedPlace(place)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: getDayColor(place.dayNumber),
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              label={{
                text: place.dayNumber.toString(),
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            />
          ))}

          {/* Info Window */}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="max-w-xs">
                {/* Place Image */}
                {selectedPlace.photoUrl && (
                  <div className="w-full h-32 mb-2 rounded-lg overflow-hidden">
                    <img
                      src={selectedPlace.photoUrl}
                      alt={selectedPlace.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getDayColor(selectedPlace.dayNumber) }}
                      >
                        Day {selectedPlace.dayNumber}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {selectedPlace.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedPlace.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                    {selectedPlace.description}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Day Legend */}
        {uniqueDays.length > 1 && activeDay === null && (
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50">
            <p className="text-xs font-medium text-foreground mb-2">Day Colors</p>
            <div className="flex flex-wrap gap-2">
              {uniqueDays.slice(0, 5).map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getDayColor(day) }}
                  />
                  <span>D{day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Place Cards Section */}
      {filteredPlaces.length > 0 && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-semibold text-foreground">
              Places to Visit
            </h4>
            <span className="text-xs text-muted-foreground">
              {filteredPlaces.length} places
            </span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {filteredPlaces.map((place, idx) => (
              <PlaceCard
                key={`${place.name}-${idx}`}
                place={place}
                isSelected={selectedPlace?.name === place.name && selectedPlace?.dayNumber === place.dayNumber}
                onClick={() => handleCardClick(place)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface PlaceCardProps {
  place: PlaceDetails;
  isSelected: boolean;
  onClick: () => void;
}

function PlaceCard({ place, isSelected, onClick }: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-48 rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
        "bg-card border shadow-sm hover:shadow-md",
        isSelected 
          ? "ring-2 ring-primary border-primary shadow-lg" 
          : "border-border/50 hover:border-border"
      )}
    >
      {/* Image */}
      <div className="relative h-28 bg-muted">
        {place.photoUrl && !imageError ? (
          <img
            src={place.photoUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <MapPin className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Day Badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: getDayColor(place.dayNumber) }}
        >
          Day {place.dayNumber}
        </div>
        
        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <MapPin className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h5 className="font-medium text-sm text-foreground truncate mb-1">
          {place.name}
        </h5>
        {place.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// TripMap exported above as a named component
