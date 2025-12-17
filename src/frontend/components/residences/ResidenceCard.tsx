import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { Residence } from "@/shared/types";
import { Button } from "@/frontend/components/ui/button";
import { useRoomTypes } from "@/backend/hooks/useRoomTypes";
import { calculateMinimumStay } from "@/backend/lib/residenceUtils";

interface ResidenceCardProps {
  residence: Residence;
  index?: number;
}

export function ResidenceCard({ residence, index = 0 }: ResidenceCardProps) {
  const { data: roomTypes = [] } = useRoomTypes(residence.id);
  const minStay = calculateMinimumStay(roomTypes);

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={residence.imageUrl}
          alt={residence.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
            <MapPin className="w-3 h-3" />
            {residence.city}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-secondary transition-colors">
          {residence.name}
        </h3>
        <p className="mt-2 text-muted-foreground text-sm line-clamp-2">
          {residence.description}
        </p>

        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {residence.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {amenity}
            </span>
          ))}
          {residence.amenities.length > 3 && (
            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{residence.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">From</span>
            <p className="text-xl font-heading font-bold text-foreground">
              {residence.startingPrice !== null && residence.startingPrice !== undefined ? (
                <>
                  €{residence.startingPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </>
              ) : (
                <span className="text-base font-normal text-muted-foreground">
                  Price on request
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Min. {minStay} month{minStay > 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="group/btn">
            <Link to={`/residences/${residence.id}`}>
              View Details
              <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
