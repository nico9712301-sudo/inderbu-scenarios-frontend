import { useQuery } from "@tanstack/react-query";
import { homeSlidesService } from "@/shared/api/home-slides";

const DEFAULT_PLACEHOLDER = "https://via.placeholder.com/400x250/e5e7eb/9ca3af?text=Sin+Imagen";

export function usePlaceholderImage() {
  const { data: placeholderSlide } = useQuery({
    queryKey: ["placeholder-slide"],
    queryFn: () => homeSlidesService.getPlaceholderSlide(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1, // Only retry once to avoid too many requests on failure
  });

  return placeholderSlide?.imageUrl || DEFAULT_PLACEHOLDER;
}