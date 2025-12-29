import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  MapPin, Plus, Calendar, IndianRupee, Plane, 
  LogOut, User, Loader2, MapPinned, Clock, Trash2, 
  Eye, Users, Zap, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  cover_image: string | null;
  created_at: string;
  travel_style: string | null;
  pace: string | null;
}

const indianDestinations = [
  "Goa",
  "Jaipur",
  "Kerala",
  "Manali",
  "Mumbai",
  "Delhi",
  "Agra",
  "Udaipur",
  "Varanasi",
  "Rishikesh",
  "Leh Ladakh",
  "Darjeeling",
  "Andaman Islands",
  "Shimla",
  "Ooty",
];

const destinationImages: Record<string, string> = {
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop",
  "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
  "manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop",
  "udaipur": "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=400&h=300&fit=crop",
  "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop",
  "default": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop",
};

const getDestinationImage = (destination: string) => {
  const key = destination.toLowerCase();
  for (const [city, url] of Object.entries(destinationImages)) {
    if (key.includes(city)) return url;
  }
  return destinationImages.default;
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("solo");
  const [pace, setPace] = useState("relaxed");

  // Check for destination from URL params (from Hero search)
  useEffect(() => {
    const destinationParam = searchParams.get("destination");
    if (destinationParam && user) {
      setDestination(destinationParam);
      setShowNewTripForm(true);
      // Clear the URL param after reading
      setSearchParams({});
    }
  }, [searchParams, user, setSearchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error",
        description: "Failed to load trips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const resetForm = () => {
    setDestination("");
    setStartDate(undefined);
    setEndDate(undefined);
    setBudget("");
    setTravelStyle("solo");
    setPace("relaxed");
  };

  const handleCreateTrip = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // First create the trip
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .insert({
          user_id: user!.id,
          title: `Trip to ${destination}`,
          destination,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          budget: parseFloat(budget),
          travel_style: travelStyle,
          pace,
          status: "planning",
        })
        .select()
        .single();

      if (tripError) throw tripError;

      toast({
        title: "Generating itinerary...",
        description: "Our AI is crafting your perfect travel plan.",
      });

      // Generate itinerary
      const response = await supabase.functions.invoke("generate-itinerary", {
        body: {
          tripDetails: {
            destination,
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            budget: parseFloat(budget),
            travelStyle,
            pace,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate itinerary");
      }

      const { itinerary } = response.data;

      // Save itinerary to database
      const { error: itineraryError } = await supabase
        .from("itineraries")
        .insert({
          trip_id: tripData.id,
          user_id: user!.id,
          content: itinerary,
        });

      if (itineraryError) {
        console.error("Error saving itinerary:", itineraryError);
      }

      toast({
        title: "Itinerary ready!",
        description: "Your personalized travel plan has been created.",
      });

      resetForm();
      setShowNewTripForm(false);
      
      // Navigate to the itinerary page
      navigate(`/itinerary/${tripData.id}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripToDelete.id);

      if (error) throw error;

      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted successfully.",
      });

      setTripToDelete(null);
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400";
      case "booked":
        return "bg-teal-500/20 text-teal-600 dark:text-teal-400";
      case "completed":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.a
              href="/"
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl md:text-2xl font-bold text-foreground">
                Ghumo<span className="text-primary">Yaar</span>
              </span>
            </motion.a>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Your Trips
              </h1>
              <p className="text-muted-foreground">
                Plan and manage your adventures across India
              </p>
            </div>
            <Button 
              variant="hero" 
              className="gap-2"
              onClick={() => setShowNewTripForm(true)}
            >
              <Plus className="w-4 h-4" />
              Create New Trip
            </Button>
          </div>

          {/* Trips Grid */}
          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-12 h-12 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                No trips yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start planning your first adventure! Create a trip and let our AI help you build the perfect itinerary.
              </p>
              <Button 
                variant="hero" 
                className="gap-2"
                onClick={() => setShowNewTripForm(true)}
              >
                <Plus className="w-4 h-4" />
                Create Your First Trip
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group glass rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/itinerary/${trip.id}`)}
                >
                  {/* Trip Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.cover_image || getDestinationImage(trip.destination)}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/itinerary/${trip.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-red-500/20 backdrop-blur-sm hover:bg-red-500/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripToDelete(trip);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-5">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {trip.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPinned className="w-4 h-4 text-primary" />
                        <span>{trip.destination}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                      </div>
                      
                      {trip.budget && (
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-primary" />
                          <span>₹{trip.budget.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Created {formatDate(trip.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* New Trip Form Dialog */}
      <Dialog open={showNewTripForm} onOpenChange={setShowNewTripForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Create New Trip</DialogTitle>
            <DialogDescription>
              Plan your next adventure across India
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a destination" />
                </SelectTrigger>
                <SelectContent>
                  {indianDestinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < (startDate || new Date())}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget (INR)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <Label>Travel Style</Label>
              <Select value={travelStyle} onValueChange={setTravelStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Solo Traveler
                    </div>
                  </SelectItem>
                  <SelectItem value="couple">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Couple
                    </div>
                  </SelectItem>
                  <SelectItem value="family">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Family
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends Group
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pace */}
            <div className="space-y-2">
              <Label>Trip Pace</Label>
              <Select value={pace} onValueChange={setPace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Relaxed Pace
                    </div>
                  </SelectItem>
                  <SelectItem value="packed">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Packed Schedule
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetForm();
                  setShowNewTripForm(false);
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1 gap-2"
                onClick={handleCreateTrip}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tripToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrip}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
