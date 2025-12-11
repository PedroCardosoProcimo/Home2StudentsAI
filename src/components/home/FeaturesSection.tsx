import { MapPin, Sparkles, Users, Calendar, Loader2 } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";

const iconMap: { [key: string]: React.ElementType } = {
  MapPin,
  Sparkles,
  Users,
  Calendar,
};

export function FeaturesSection() {
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
            Why Choose HOME2STUDENTS
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We've thought of everything so you can focus on what matters most -
            your studies and making lifelong memories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {config?.features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5">
                  {Icon && <Icon className="w-7 h-7 text-secondary" />}
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
