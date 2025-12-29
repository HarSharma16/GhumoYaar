import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Destinations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const destinations = [
    {
      name: "Rajasthan",
      tagline: "Land of Kings",
      rating: 4.9,
      trips: "2.5K+",
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=800&fit=crop",
      color: "from-amber-500/80 to-orange-600/80",
    },
    {
      name: "Kerala",
      tagline: "God's Own Country",
      rating: 4.8,
      trips: "3.2K+",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop",
      color: "from-emerald-500/80 to-teal-600/80",
    },
    {
      name: "Ladakh",
      tagline: "Land of High Passes",
      rating: 4.9,
      trips: "1.8K+",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=800&fit=crop",
      color: "from-blue-500/80 to-indigo-600/80",
    },
    {
      name: "Goa",
      tagline: "Beach Paradise",
      rating: 4.7,
      trips: "4.1K+",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=800&fit=crop",
      color: "from-cyan-500/80 to-blue-600/80",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  return (
    <section id="destinations" className="py-24 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Top Destinations
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
              Trending <span className="text-gradient">Indian Escapes</span>
            </h2>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Destinations Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.name}
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${dest.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-current text-gold" />
                  <span className="text-primary-foreground text-sm font-medium">
                    {dest.rating}
                  </span>
                  <span className="text-primary-foreground/70 text-sm">
                    • {dest.trips} trips
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">
                  {dest.name}
                </h3>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{dest.tagline}</span>
                </div>

                {/* Hover CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    Explore
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Destinations;
