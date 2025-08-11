import { createOptionsContainer } from '@/presentation/features/dashboard/options/di/OptionsContainer.server';
import { OptionsPage } from '@/presentation/features/dashboard/options/components/OptionsPage';
import { OptionsDataResponse } from '@/presentation/features/dashboard/options/application/GetOptionsDataUseCase';

export default async function OptionsRoute() {
  // DDD: Dependency injection - build complete container
  const { optionsService } = createOptionsContainer();

  try {
    // DDD: Execute use case through service layer
    // All business logic and data preparation happens in domain/application layers
    const result: OptionsDataResponse = await optionsService.getOptionsData();
    
    // Atomic Design: Render page template with clean separation
    return <OptionsPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in OptionsRoute:', error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in OptionsRoute:', error);
    throw error;
  }
}
