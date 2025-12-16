import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MapPin, Users, Wifi, Dumbbell, Book, Home, Shield, UtensilsCrossed, Shirt, Car, Wind, Flame, Armchair, PawPrint } from "lucide-react";
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
import { ResidenceCardSkeleton } from "@/components/residences/ResidenceCardSkeleton";

const amenityIcons: { [key: string]: React.ElementType } = {
  "High-Speed WiFi": Wifi,
  "Kitchen": UtensilsCrossed,
  "Laundry": Shirt,
  "Study Room": Book,
  "Gym": Dumbbell,
  "Parking": Car,
  "Air Conditioning": Wind,
  "Heating": Flame,
  "Furnished": Armchair,
  "24/7 Security": Shield,
  "Pet Friendly": PawPrint,
};

const ResidenceDetail = () => {
  const { id, residenceId } = useParams<{ id?: string; residenceId?: string }>();
  const navigate = useNavigate();
  // Support both :id and :residenceId for backward compatibility
  const residenceIdParam = id || residenceId;
  const { data, isLoading, error } = useResidence(residenceIdParam);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <div id="room-types">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                  Available Room Types
                </h2>
                <div className="space-y-4">
                  {roomTypes.map((room) => (
                    <Link
                      key={room.id}
                      to={`/residences/${residence.id}/rooms/${room.id}`}
                      className="block"
                    >
                      <div className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-secondary transition-colors">
                              {room.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {room.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Max {room.maxOccupancy} {room.maxOccupancy === 1 ? 'person' : 'people'}</span>
                              </div>
                              <span>•</span>
                              <span>{room.area} m²</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-heading font-bold text-foreground">
                              €{room.basePrice}
                              <span className="text-sm font-normal text-muted-foreground">
                                /month
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 group-hover:text-secondary transition-colors">
                              View details →
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
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

            {/* Right Column - Info Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">From</span>
                  <p className="text-3xl font-heading font-bold text-foreground">
                    {residence.startingPrice !== null && residence.startingPrice !== undefined ? (
                      <>
                        €{residence.startingPrice}
                        <span className="text-base font-normal text-muted-foreground">
                          /month
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-normal text-muted-foreground">
                        Price on request
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Minimum stay: {residence?.minStay || 1} month{(residence?.minStay || 1) > 1 ? 's' : ''}
                </p>
                {roomTypes.length > 0 && (
                  <Button
                    variant="coral"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      // Scroll to room types section with offset for header
                      const roomTypesSection = document.getElementById('room-types');
                      if (roomTypesSection) {
                        const headerOffset = 120;
                        const elementPosition = roomTypesSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    View Rooms to Book
                  </Button>
                )}
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
