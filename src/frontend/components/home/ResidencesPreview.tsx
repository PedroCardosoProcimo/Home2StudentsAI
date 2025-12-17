import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ResidenceCard } from "@/frontend/components/residences/ResidenceCard";
import { useResidences } from "@/backend/hooks/useResidences";

export function ResidencesPreview() {
  const { data: residences = [], isLoading } = useResidences(true);
  const previewResidences = residences.slice(0, 3);

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Our Residences
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully selected properties across Portugal's most
            vibrant student cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {previewResidences.map((residence, index) => (
                <ResidenceCard
                  key={residence.id}
                  residence={residence}
                  index={index}
                />
              ))}
            </>
          )}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/residences">
              See All Residences
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
