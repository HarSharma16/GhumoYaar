import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  Calendar,
  Wallet,
  Map,
  Users,
  Shield,
} from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Sparkles,
      title: "AI Itinerary Generator",
      description:
        "Smart AI creates personalized day-by-day itineraries based on your preferences, travel style, and budget.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Wallet,
      title: "Budget Tracker",
      description:
        "Track expenses in real-time, set daily limits, and get smart suggestions to stretch your travel budget.",
      color: "bg-secondary/20 text-secondary",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Optimize your travel time with intelligent scheduling that accounts for distances and opening hours.",
      color: "bg-gold/20 text-gold",
    },
    {
      icon: Map,
      title: "Offline Maps",
      description:
        "Download maps and itineraries for offline access. Never get lost, even without internet.",
      color: "bg-teal/20 text-teal",
    },
    {
      icon: Users,
      title: "Group Planning",
      description:
        "Collaborate with travel companions. Vote on activities, split expenses, and sync plans effortlessly.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Shield,
      title: "Travel Safety",
      description:
        "Real-time safety alerts, emergency contacts, and travel advisories for every destination.",
      color: "bg-secondary/20 text-secondary",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  return (
    <section id="features" className="py-24 relative" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need for
            <br />
            <span className="text-gradient">Perfect Travel</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            From planning to exploring, our AI-powered tools make every step of
            your journey seamless and memorable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
