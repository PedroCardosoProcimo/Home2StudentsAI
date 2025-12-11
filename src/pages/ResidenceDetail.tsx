import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Users, Wifi, Dumbbell, Book, Home, Shield, Bike, UtensilsCrossed } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useResidence } from "@/hooks/useResidence";
import { useSettings } from "@/hooks/useSettings";
import { ResidenceCardSkeleton } from "@/components/residences/ResidenceCardSkeleton";

const amenityIcons: { [key: string]: React.ElementType } = {
  "High-Speed WiFi": Wifi,
  "Gym": Dumbbell,
  "Study Rooms": Book,
  "Library": Book,
  "Common Kitchen": UtensilsCrossed,
  "24/7 Security": Shield,
  "Bike Storage": Bike,
};

const ResidenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useResidence(id);
  const { data: settings } = useSettings();

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 min-h-screen">
          <div className="container-narrow section-padding">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <ResidenceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 min-h-screen">
          <div className="container-narrow section-padding text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Residence not found
            </h1>
            <p className="mt-4 text-muted-foreground">
              The residence you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to="/residences">Back to Residences</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { residence, roomTypes } = data;

  return (
    <Layout>
      <div className="pt-24 md:pt-28">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={residence.imageUrl}
            alt={residence.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container-narrow section-padding">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8 -mt-8 relative z-10">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/residences">Residences</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{residence.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  {residence.name}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span>{residence.address}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  About This Residence
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {residence.fullDescription}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {residence.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Home;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      >
                        <Icon className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                  Available Room Types
                </h2>
                <div className="space-y-4">
                  {roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-heading font-semibold text-foreground">
                            {room.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {room.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Max {room.maxOccupancy} {room.maxOccupancy === 1 ? 'person' : 'people'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-heading font-bold text-foreground">
                            €{room.basePrice}
                            <span className="text-sm font-normal text-muted-foreground">
                              /month
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Location
                </h2>
                <p className="text-muted-foreground mb-4">{residence.address}</p>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <p className="text-muted-foreground">Map coming soon</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">From</span>
                  <p className="text-3xl font-heading font-bold text-foreground">
                    €{residence.startingPrice}
                    <span className="text-base font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Minimum stay: {settings?.minimumStayMonths || 1} month{(settings?.minimumStayMonths || 1) > 1 ? 's' : ''}
                </p>
                <Button
                  variant="coral"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/book?residence=${residence.id}`)}
                >
                  Book This Residence
                </Button>
                <p className="mt-4 text-xs text-muted-foreground text-center">
                  Free cancellation up to 30 days before check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResidenceDetail;
