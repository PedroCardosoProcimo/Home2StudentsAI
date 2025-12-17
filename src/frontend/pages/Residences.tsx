import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/frontend/components/layout/Layout";
import { ResidenceCard } from "@/frontend/components/residences/ResidenceCard";
import { ResidenceCardSkeleton } from "@/frontend/components/residences/ResidenceCardSkeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/frontend/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { useResidences } from "@/backend/hooks/useResidences";

const Residences = () => {
  const { data: residences = [], isLoading, error } = useResidences(true);
  const [cityFilter, setCityFilter] = useState<string>("all");

  const cities = [...new Set(residences.map((r) => r.city))];
  const filteredResidences =
    cityFilter === "all"
      ? residences
      : residences.filter((r) => r.city === cityFilter);

  return (
    <Layout>
      <div className="pt-24 md:pt-28">
        <div className="container-narrow section-padding">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Residences</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Our Residences
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Find your perfect student home in Portugal. Each residence is
                carefully selected for its location, amenities, and community.
              </p>
            </div>

            {/* Filter */}
            <div className="w-full md:w-48">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">
                Failed to load residences. Please try again later.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <ResidenceCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredResidences.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No residences found for the selected city.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredResidences.map((residence, index) => (
                <ResidenceCard
                  key={residence.id}
                  residence={residence}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Residences;
