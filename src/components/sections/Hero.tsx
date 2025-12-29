import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

// Same destinations as Dashboard
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
  "Rajasthan",
  "Ladakh",
  "Hampi",
  "Mysore",
  "Pune",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Amritsar",
  "Jodhpur",
  "Khajuraho",
  "Ranthambore",
  "Jim Corbett",
  "Sundarbans",
];

function HeroBackground({ heroBackground }: { heroBackground: string }) {
  const [blurStrength, setBlurStrength] = useState(24);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 300;

      const blur = Math.max(0, 24 - (scrollY / maxScroll) * 24);
      setBlurStrength(blur);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Sharp Image */}
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Blurred Image with Animated Gradient Mask */}
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-105"
        style={{
          filter: `blur(${blurStrength}px)`,
          maskImage: "linear-gradient(to top, black 0%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 65%)",
          transition: "filter 0.1s linear",
        }}
      />
    </div>
  );
}

const Hero = () => {
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filter suggestions based on input
  useEffect(() => {
    if (destination.trim().length > 0) {
      const filtered = indianDestinations.filter((place) =>
        place.toLowerCase().includes(destination.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [destination]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (place: string) => {
    setDestination(place);
    setShowSuggestions(false);
  };

  const handlePlanTrip = () => {
    if (destination.trim()) {
      navigate(`/dashboard?destination=${encodeURIComponent(destination.trim())}`);
    } else {
      navigate("/dashboard");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const stats = [
    { icon: MapPin, value: "500+", label: "Destinations" },
    { icon: Users, value: "50K+", label: "Happy Travelers" },
    { icon: Calendar, value: "10K+", label: "Trips Planned" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Hero Background (sharp + blurred layers) */}
      <HeroBackground heroBackground={heroBackground} />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/40 to-background/20 dark:from-background/70 dark:via-background/50 dark:to-background/30" />
      {/* Subtle animated glow effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Explore{" "}
            <span className="text-gradient">Incredible India</span>
            <br />
            <span className="text-muted-foreground">Your Way</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Let AI craft your perfect Indian adventure. From Himalayan peaks to Kerala backwaters,
            we'll plan every detail of your dream trip.
          </motion.p>

          {/* Search Box */}
          <motion.div
            variants={itemVariants}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="glass rounded-2xl p-2 shadow-card border border-border">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => destination.trim() && filteredSuggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground font-body"
                  />
                  
                  {/* Autocomplete Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <div className="max-h-60 overflow-y-auto">
                          {filteredSuggestions.map((place, index) => (
                            <button
                              key={place}
                              onClick={() => handleSelectSuggestion(place)}
                              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                            >
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-body text-foreground">{place}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button variant="hero" size="lg" className="gap-2" onClick={handlePlanTrip}>
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Plan My Trip</span>
                  <span className="sm:hidden">Search</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Popular Destinations */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            <span className="text-muted-foreground text-sm">Popular:</span>
            {["Rajasthan", "Kerala", "Goa", "Ladakh", "Varanasi"].map((place) => (
              <motion.button
                key={place}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDestination(place)}
                className="px-4 py-1.5 rounded-full bg-card border border-border text-sm font-medium hover:border-primary hover:bg-accent transition-all"
              >
                {place}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="font-body text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
