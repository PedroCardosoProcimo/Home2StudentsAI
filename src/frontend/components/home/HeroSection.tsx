import { Link } from "react-router-dom";
import { Button } from "@/frontend/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-narrow text-center text-primary-foreground pt-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight animate-fade-in">
          Your Home Away
          <br />
          From Home
        </h1>
        <p className="mt-6 text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in animation-delay-200">
          Premium student accommodation in Portugal's best cities. Live, study,
          and thrive in a community designed for you.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
          <Button asChild variant="hero" size="xl">
            <Link to="/residences">View Residences</Link>
          </Button>
          <Button asChild variant="hero-outline" size="xl">
            <Link to="/book">Book Now</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
