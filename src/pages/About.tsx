import { motion } from "framer-motion";
import { 
  MapPin, 
  Sparkles, 
  Target, 
  Eye, 
  Brain, 
  Wallet, 
  Calendar, 
  Map, 
  MessageCircle,
  User,
  Heart,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import harshProfile from "@//assets/harshProfile.jpg"

const About = () => {
  const navigate = useNavigate();

  const smartFeatures = [
    {
      icon: Brain,
      title: "AI-Generated Personalized Itineraries",
      description: "Get custom travel plans tailored to your preferences, budget, and travel style."
    },
    {
      icon: Wallet,
      title: "Budget-Aware Trip Planning",
      description: "Smart recommendations that fit your budget without compromising on experiences."
    },
    {
      icon: Calendar,
      title: "India-Specific Travel Logic",
      description: "Optimized for Indian seasons, festivals, and crowd patterns."
    },
    {
      icon: Map,
      title: "Interactive Maps with Real Images",
      description: "Explore destinations visually with authentic place photos and detailed maps."
    },
    {
      icon: MessageCircle,
      title: "AI Travel Assistant",
      description: "Get real-time help and suggestions from your smart travel companion."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-saffron/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="font-body text-sm font-medium">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
              Ghumo<span className="text-primary">Yaar</span>
            </h1>
            
            <p className="font-display text-xl md:text-2xl text-primary mb-6">
              Your Smart Travel Yaar for Exploring India
            </p>
            
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              GhumoYaar is an AI-powered travel planning platform designed specially for exploring India. 
              It helps travelers create personalized itineraries, manage budgets, and explore destinations 
              visually using interactive maps and real place images.
            </p>
            
            <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")} className="gap-2">
              Start Planning <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 md:mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-card border border-border/50">
              <div className="aspect-[21/9] bg-gradient-to-br from-primary/20 via-saffron/10 to-teal/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/56/ee/6e/56ee6e8a84c4d605aad4a8400ec29a5c.jpg')] bg-cover bg-center opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-body text-foreground">Explore 500+ Indian Destinations</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Purpose
            </h2>
            <p className="font-body text-muted-foreground">What drives us to build GhumoYaar</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-sm hover:shadow-card transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mb-6 shadow-soft">
                    <Target className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    To make travel planning simple, affordable, and stress-free for Indian travelers 
                    using AI and local insights. We believe everyone deserves to explore the beauty 
                    of India without the hassle of complex planning.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border-saffron/20 bg-card/50 backdrop-blur-sm hover:shadow-card transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-gold flex items-center justify-center mb-6 shadow-soft">
                    <Eye className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    To become India's most trusted smart travel companion. We envision a future where 
                    every traveler has access to personalized, intelligent travel planning that makes 
                    exploring India an unforgettable experience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal mb-4">
              <Brain className="w-4 h-4" />
              <span className="font-body text-sm font-medium">Powered by AI</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Makes GhumoYaar Smart?
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Our intelligent features combine cutting-edge AI with deep knowledge of Indian travel
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {smartFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-card hover:border-primary/30 transition-all duration-300 bg-card/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* AI Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 relative max-w-4xl mx-auto"
          >
         
          </motion.div>
        </div>
      </section>

      {/* Maps Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron/10 text-saffron mb-4">
                <Map className="w-4 h-4" />
                <span className="font-body text-sm font-medium">Visual Exploration</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Maps & Visual Exploration
              </h2>
              <p className="font-body text-lg text-muted-foreground mb-6 leading-relaxed">
                GhumoYaar lets users explore their itinerary visually through interactive maps with 
                real images of every place. See your entire trip laid out on a beautiful map, 
                complete with route visualization and authentic destination photos.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-body text-sm text-foreground">Location Pins</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <Eye className="w-4 h-4 text-teal" />
                  <span className="font-body text-sm text-foreground">Real Images</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <Map className="w-4 h-4 text-saffron" />
                  <span className="font-body text-sm text-foreground">Route Visualization</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-card">
                <div className="aspect-[4/3] bg-gradient-to-br from-teal/20 via-primary/10 to-saffron/20 relative">
                  <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/10/1f/30/101f309cbe4708910a533a624d6dc6f6.jpg')] bg-cover bg-center opacity-30" />
                  
                  {/* Map Pins */}
                  <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center shadow-lg animate-pulse">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-1/3 right-1/4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center shadow-lg animate-pulse">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Route lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    <path
                      d="M 25% 25% Q 35% 40% 66% 50%"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      fill="none"
                      opacity="0.6"
                    />
                    <path
                      d="M 66% 50% Q 60% 55% 75% 66%"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      fill="none"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <User className="w-4 h-4" />
              <span className="font-body text-sm font-medium">The Creator</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              About the Developer
            </h2>
            
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10">
                <div className="w-40 h-40 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-6 shadow-card">
                  <img src={harshProfile} className="w-full h-full rounded-full object-cover"/>
                </div>
                
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Harsh Sharma
                </h3>
                <p className="font-body text-primary mb-6">Full-Stack Developer</p>
                
                <p className="font-body text-muted-foreground leading-relaxed">
                  Built by Harsh Sharma, a full-stack developer passionate about building real-world 
                  AI-powered applications. GhumoYaar was created to solve genuine travel planning 
                  problems while showcasing AI, maps, and modern web development. The goal is to make 
                  travel planning accessible and enjoyable for everyone exploring incredible India.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-saffron/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-6 shadow-card">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              GhumoYaar
            </h2>
            <p className="font-display text-xl text-primary mb-6">
              Travel smart. Travel desi.
            </p>
            
            <p className="font-body text-muted-foreground mb-8">
              Have feedback or suggestions? We'd love to hear from you. Help us make GhumoYaar better for every traveler.
            </p>
            
            <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")} className="gap-2">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
