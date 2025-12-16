import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Users, ArrowLeft } from "lucide-react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRoomType } from "@/hooks/useRoomType";
import { useResidence } from "@/hooks/useResidence";
import { ResidenceCardSkeleton } from "@/components/residences/ResidenceCardSkeleton";

const RoomDetail = () => {
  const { id: residenceId, roomId } = useParams<{ id: string; roomId: string }>();
  const navigate = useNavigate();
  const { data: roomType, isLoading: roomLoading, error: roomError } = useRoomType(roomId);
  const { data: residenceData, isLoading: residenceLoading } = useResidence(residenceId);

  const isLoading = roomLoading || residenceLoading;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 min-h-screen">
          <div className="container-narrow section-padding">
            <ResidenceCardSkeleton />
          </div>
        </div>
      </Layout>
    );
  }

  if (roomError || !roomType) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 min-h-screen">
          <div className="container-narrow section-padding text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Room type not found
            </h1>
            <p className="mt-4 text-muted-foreground">
              The room type you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to={residenceId ? `/residences/${residenceId}` : "/residences"}>
                Back to Residence
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const residence = residenceData?.residence;

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
                <BreadcrumbLink asChild>
                  <Link to="/residences">Residences</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {residence && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/residences/${residence.id}`}>{residence.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{roomType.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back Button */}
          {residence && (
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate(`/residences/${residence.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {residence.name}
            </Button>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Room Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Header */}
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  {roomType.name}
                </h1>
                {residence && (
                  <p className="mt-2 text-muted-foreground">
                    At {residence.name}
                  </p>
                )}
              </div>

              {/* Room Images Slider */}
              {roomType.imagesUrl && roomType.imagesUrl.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                    Room Photos
                  </h2>
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {roomType.imagesUrl.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                              <img
                                src={image}
                                alt={`${roomType.name} - Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {roomType.imagesUrl.length > 1 && (
                        <>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
              )}

              {/* Floor Plan Image */}
              {roomType.floorPlanUrl && (
                <div>
                  <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                    Floor Plan
                  </h2>
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    <img
                      src={roomType.floorPlanUrl}
                      alt={`Floor plan of ${roomType.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Room Description */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {roomType.description}
                </p>
              </div>

              {/* Room Specifications */}
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                  Room Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Room Size</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {roomType.area} m²
                    </p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Occupancy</p>
                        <p className="text-lg font-semibold text-foreground mt-1">
                          {roomType.maxOccupancy} {roomType.maxOccupancy === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">Monthly Price</span>
                  <p className="text-3xl font-heading font-bold text-foreground">
                    €{roomType.basePrice}
                    <span className="text-base font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                {residence && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Minimum stay: {residence.minStay || 1} month{(residence.minStay || 1) > 1 ? 's' : ''}
                  </p>
                )}
                <Button
                  variant="coral"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/book?residence=${residenceId}&roomType=${roomId}`)}
                >
                  Book Now
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

export default RoomDetail;

