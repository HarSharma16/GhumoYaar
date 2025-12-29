import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook, Youtube, Github, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Explore: ["Destinations", "Itineraries", "Travel Guides", "Best Time to Visit"],
    Company: ["About Us", "Careers", "Press", "Blog"],
    Support: ["Help Center", "Safety", "Terms of Service", "Privacy Policy"],
  };

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/in/harsh-kumar-sharma-87a85024b/" },
    { icon: Github, href: "https://github.com/HarSharma16" },
    { icon: Instagram, href: "https://www.instagram.com/harsharma_16/" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a
              href="#"
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">
                Ghumo<span className="text-primary">Yaar</span>
              </span>
            </motion.a>
            <p className="font-body text-muted-foreground max-w-sm mb-6">
              AI-powered travel planning for incredible India. Create personalized itineraries,
              track budgets, and explore with confidence.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-lg font-semibold mb-4 text-foreground">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & Newsletter */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">harsharma16072004@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 95698 37300</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 GhumoYaar. Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
