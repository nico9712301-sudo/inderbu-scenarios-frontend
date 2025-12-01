import {
  ChevronRight,
  DollarSign,
  Eye,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { ISubScenario } from "@/presentation/features/home/types/filters.types";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { usePlaceholderImage } from "@/shared/hooks/use-placeholder-image";
import Image from "next/image";
import Link from "next/link";

interface ModernFacilityCardProps {
  subScenario: ISubScenario;
  priority?: boolean;
}

export function ModernFacilityCard({
  subScenario,
  priority = false,
}: ModernFacilityCardProps) {
  const {
    id,
    name,
    hasCost,
    numberOfSpectators,
    numberOfPlayers,
    scenario,
    activityArea,
    fieldSurfaceType,
  } = subScenario;

  const placeholderImage = usePlaceholderImage();
  
  // Normalize image URL - ensure it's a complete URL
  const normalizeImageUrl = (url: string | undefined): string => {
    if (!url) return placeholderImage;
    
    // If URL already includes protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Get API base URL - always use the API URL, not the frontend origin
    // This ensures images are loaded from the correct backend server
    const getApiBaseUrl = (): string => {
      // Check for environment variable first (for production)
      if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
        return (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
      }
      // Fallback to process.env (works in both client and server)
      if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      // Default to localhost:3001 for development (backend API port)
      return 'http://localhost:3001';
    };
    
    const baseUrl = getApiBaseUrl();
    
    // If URL starts with /, it's a relative path - construct full URL
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    
    // Otherwise, assume it's a relative path and prepend base URL
    return `${baseUrl}/${url}`;
  };
  
  const rawImageUrl = subScenario.imageGallery?.featured?.url;
  const subscenarioImageURL = rawImageUrl ? normalizeImageUrl(rawImageUrl) : placeholderImage;

  // DEBUG LOGS - Image loading diagnosis
  console.log('ModernFacilityCard DEBUG:', {
    subScenarioId: id,
    name,
    imageGallery: subScenario.imageGallery,
    featuredImageUrl: rawImageUrl,
    normalizedUrl: subscenarioImageURL,
    finalImageUrl: subscenarioImageURL,
    isUsingPlaceholder: subscenarioImageURL === placeholderImage,
    placeholderUrl: placeholderImage
  });

  return (
    <Link href={`/scenario/${id}`} className="block group">
      <Card
        className="h-full overflow-hidden border-0 shadow-sm hover:shadow-xl 
                     transition-all duration-300 group-hover:-translate-y-2 bg-card 
                     rounded-xl backdrop-blur-sm"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <Image
            src={subscenarioImageURL}
            alt={name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={85}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              console.error('ModernFacilityCard Image Error:', {
                subScenarioId: id,
                name,
                rawImageUrl: rawImageUrl,
                normalizedImageUrl: subscenarioImageURL,
                error: e
              });
            }}
            onLoad={() => {
              if (priority) {
                console.log('ModernFacilityCard Image Loaded (Priority):', {
                  subScenarioId: id,
                  url: subscenarioImageURL
                });
              }
            }}
          />

          {/* Price badge */}
          <div className="absolute top-3 right-3 z-20">
            <Badge
              variant={hasCost ? "destructive" : "secondary"}
              className={`${hasCost
                  ? "bg-red-500/90 text-white shadow-lg"
                  : "bg-green-500/90 text-white shadow-lg"
                } backdrop-blur-sm border-0`}
            >
              {hasCost ? (
                <>
                  <DollarSign className="w-3 h-3 mr-1" />
                  de pago
                </>
              ) : (
                "Gratuito"
              )}
            </Badge>
          </div>

          {/* Activity area badge */}
          <div className="absolute top-3 left-3 z-20">
            <Badge
              variant="outline"
              className="bg-background/90 text-foreground border-border/50 
                                              backdrop-blur-sm shadow-sm"
            >
              {activityArea.name}
            </Badge>
          </div>

          {/* Bottom overlay info */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 p-4 
                         bg-gradient-to-t from-black/80 to-transparent"
          >
            <h3
              className="font-semibold text-lg mb-1 line-clamp-2 text-white 
                         group-hover:text-secondary-200 transition-colors"
            >
              {name}
            </h3>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{scenario.neighborhood.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Surface type and rating */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className="text-xs bg-muted text-muted-foreground border-border"
            >
              {fieldSurfaceType.name}
            </Badge>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm ml-1 text-muted-foreground font-medium">
                4.5
              </span>
            </div>
          </div>

          {/* Address */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {scenario.address}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center bg-muted px-2 py-1 rounded-md">
              <Users className="w-3 h-3 mr-1" />
              <span>{numberOfPlayers} jugadores</span>
            </div>
            {numberOfSpectators > 0 && (
              <div className="flex items-center bg-muted px-2 py-1 rounded-md">
                <Eye className="w-3 h-3 mr-1" />
                <span>{numberOfSpectators} espectadores</span>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
            <span className="text-muted-foreground font-medium">
              Ver disponibilidad
            </span>
            <div
              className="flex items-center text-secondary-600 group-hover:text-secondary-700 
                           transition-colors font-medium"
            >
              <span>Reservar</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
