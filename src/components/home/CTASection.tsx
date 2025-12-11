import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section-padding bg-primary">
      <div className="container-narrow text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
          Ready to Find Your New Home?
        </h2>
        <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
          Join thousands of students who have already made HOME2STUDENTS their
          home in Portugal.
        </p>
        <div className="mt-8">
          <Button asChild variant="hero" size="xl">
            <Link to="/book">Start Your Booking</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
