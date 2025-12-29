import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Calendar, Loader2, MapPinned, 
  Utensils, Car, Lightbulb, Package, Clock,
  Users, Zap, IndianRupee, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface Place {
  name: string;
  description: string;
  timingTip: string;
  estimatedCost: number;
}

interface Transport {
  mode: string;
  description: string;
  estimatedCost: number;
}

interface FoodItem {
  meal: string;
  recommendation: string;
  cuisine: string;
  estimatedCost: number;
}

interface DailyCost {
  sightseeing: number;
  transport: number;
  food: number;
  miscellaneous: number;
  total: number;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  places: Place[];
  transport: Transport;
  food: FoodItem[];
  dailyCostBreakdown: DailyCost;
  tips: string[];
}

interface ItineraryContent {
  summary: string;
  totalEstimatedCost: number;
  days: ItineraryDay[];
  packingTips: string[];
  generalTips: string[];
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  travel_style: string | null;
  pace: string | null;
  cover_image: string | null;
}

const destinationImages: Record<string, string> = {
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=400&fit=crop",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&h=400&fit=crop",
  "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=400&fit=crop",
  "manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=400&fit=crop",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=400&fit=crop",
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=400&fit=crop",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=400&fit=crop",
  "udaipur": "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200&h=400&fit=crop",
  "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&h=400&fit=crop",
  "default": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=400&fit=crop",
};

const getDestinationImage = (destination: string) => {
  const key = destination.toLowerCase();
  for (const [city, url] of Object.entries(destinationImages)) {
    if (key.includes(city)) return url;
  }
  return destinationImages.default;
};

const SharedTrip = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (shareToken) {
      fetchSharedTrip();
    }
  }, [shareToken]);

  const fetchSharedTrip = async () => {
    try {
      // Fetch trip by share token
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("share_token", shareToken)
        .eq("is_shared", true)
        .maybeSingle();

      if (tripError) throw tripError;
      
      if (!tripData) {
        setNotFound(true);
        return;
      }

      setTrip(tripData);

      // Fetch itinerary
      const { data: itineraryData, error: itineraryError } = await supabase
        .from("itineraries")
        .select("content")
        .eq("trip_id", tripData.id)
        .maybeSingle();

      if (itineraryError) throw itineraryError;

      if (itineraryData) {
        setItinerary(itineraryData.content as unknown as ItineraryContent);
      }
    } catch (error) {
      console.error("Error fetching shared trip:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTravelStyleLabel = (style: string | null) => {
    const labels: Record<string, string> = {
      solo: "Solo Traveler",
      couple: "Couple",
      family: "Family",
      friends: "Friends Group",
    };
    return labels[style || "solo"] || style;
  };

  const getPaceLabel = (pace: string | null) => {
    return pace === "packed" ? "Packed Schedule" : "Relaxed Pace";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Trip Not Found
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            This shared trip link is invalid or the trip is no longer being shared.
          </p>
          <Link to="/">
            <Button variant="hero">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={trip.cover_image || getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground">
            Shared Trip
          </div>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-white drop-shadow-lg">
              Ghumo<span className="text-primary">Yaar</span>
            </span>
          </Link>
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPinned className="w-4 h-4 text-primary" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                {getTravelStyleLabel(trip.travel_style)}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                {getPaceLabel(trip.pace)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-4">
        {!itinerary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              No itinerary available
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This trip doesn't have an itinerary yet.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Cost Summary Card */}
            <div className="glass rounded-2xl p-6 shadow-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Trip Summary
                  </h2>
                  <p className="text-muted-foreground">{itinerary.summary}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-muted-foreground">Estimated Total Cost</p>
                  <p className="font-display text-3xl font-bold text-primary flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    {itinerary.totalEstimatedCost?.toLocaleString("en-IN") || "N/A"}
                  </p>
                  {trip.budget && (
                    <p className="text-sm text-muted-foreground">
                      Budget: ₹{trip.budget.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Day-wise Itinerary */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Day-by-Day Plan
              </h2>
              
              <Accordion type="single" collapsible defaultValue="day-1" className="space-y-4">
                {itinerary.days?.map((day) => (
                  <AccordionItem 
                    key={day.dayNumber} 
                    value={`day-${day.dayNumber}`}
                    className="glass rounded-2xl border-none overflow-hidden shadow-card"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 text-left w-full">
                        <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-soft">
                          {day.dayNumber}
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-lg font-bold text-foreground">{day.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPinned className="w-3 h-3" />
                              {day.places?.length || 0} places
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />
                              {day.dailyCostBreakdown?.total?.toLocaleString("en-IN") || "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6 pt-2">
                        {/* Places */}
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPinned className="w-4 h-4 text-primary" />
                            </div>
                            Places to Visit
                          </h3>
                          <div className="grid gap-3">
                            {day.places?.map((place, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-muted/50 rounded-xl p-4 hover:bg-muted/70 transition-colors"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{place.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{place.description}</p>
                                    {place.timingTip && (
                                      <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {place.timingTip}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    ₹{place.estimatedCost}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Transport */}
                        {day.transport && (
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Car className="w-4 h-4 text-primary" />
                              </div>
                              Transport
                            </h3>
                            <div className="bg-muted/50 rounded-xl p-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{day.transport.mode}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{day.transport.description}</p>
                                </div>
                                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                  ₹{day.transport.estimatedCost}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Food */}
                        {day.food && day.food.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Utensils className="w-4 h-4 text-primary" />
                              </div>
                              Food Recommendations
                            </h3>
                            <div className="grid sm:grid-cols-3 gap-3">
                              {day.food.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="bg-muted/50 rounded-xl p-4"
                                >
                                  <p className="text-xs text-primary font-medium uppercase mb-1">
                                    {item.meal}
                                  </p>
                                  <p className="font-medium text-foreground text-sm">
                                    {item.recommendation}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.cuisine}
                                  </p>
                                  <p className="text-sm font-medium text-primary mt-2">
                                    ₹{item.estimatedCost}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Daily Tips */}
                        {day.tips && day.tips.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Lightbulb className="w-4 h-4 text-primary" />
                              </div>
                              Tips for the Day
                            </h3>
                            <ul className="space-y-2">
                              {day.tips.map((tip, idx) => (
                                <li 
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="text-primary mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Tips Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Packing Tips */}
              {itinerary.packingTips && itinerary.packingTips.length > 0 && (
                <div className="glass rounded-2xl p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    Packing Tips
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.packingTips.map((tip, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Tips */}
              {itinerary.generalTips && itinerary.generalTips.length > 0 && (
                <div className="glass rounded-2xl p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    General Tips
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.generalTips.map((tip, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Want to create your own travel itinerary?
              </p>
              <Link to="/">
                <Button variant="hero" size="lg">
                  Get Started with GhumoYaar
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SharedTrip;
