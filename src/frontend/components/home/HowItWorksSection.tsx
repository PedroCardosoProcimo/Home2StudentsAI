import { useConfig } from "@/backend/hooks/useConfig";
import { Loader2 } from "lucide-react";

export function HowItWorksSection() {
  const { data: config, isLoading } = useConfig();

  if (isLoading) {
    return (
      <section className="section-padding bg-muted">
        <div className="container-narrow flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-muted">
      <div className="container-narrow">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Book in 3 Simple Steps
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Finding and booking your perfect student accommodation has never
            been easier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {config?.steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector Line */}
              {index < (config?.steps.length || 0) - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Step Number */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-secondary text-secondary-foreground mx-auto flex items-center justify-center text-2xl font-bold font-heading">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-heading font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
