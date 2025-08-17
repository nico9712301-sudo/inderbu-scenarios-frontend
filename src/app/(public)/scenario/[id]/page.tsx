import { SerializedScenarioDetailResponse, serializeScenarioDetailData, SerializedAvailabilityResponse, serializeAvailabilityData } from '@/presentation/utils/serialization.utils';
import { 
  InvalidScenarioIdError, 
  ScenarioNotFoundError,
  ScenarioAccessDeniedError 
} from '@/entities/scenario/domain/scenario-detail.domain';
import { ScenarioDetailPage } from '@/presentation/features/scenarios/detail/components/pages/ScenarioDetailPage';
import { GetAvailabilityUseCase } from '@/application/availability/use-cases/GetAvailabilityUseCase';
import { GetScenarioDetailUseCase } from '@/application/scenario-detail/GetScenarioDetailUseCase';
import { SubScenarioBackend } from '@/infrastructure/transformers/SubScenarioTransformer';
import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { getTodayString, parseWeekdays } from '@/shared/utils/date-helpers';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { redirect, notFound } from 'next/navigation';

interface PageProps {
  params: { id: string };
  searchParams: { 
    date?: string; 
    finalDate?: string; 
    weekdays?: string 
  };
}

/**
 * Scenario Detail Page Route (Server Component)
 * 
 * Next.js App Router page that handles individual scenario details.
 * Uses dependency injection to get data and render the presentation layer.
 * Now using modern DDD Container pattern with ContainerFactory
 */
export default async function ScenarioDetailRoute({ params, searchParams }: PageProps) {
  const { id } = await params;
  const awaitedSearchParams = await searchParams;
  
  try {
    // DDD: Dependency injection - use central container factory
    const container = ContainerFactory.createContainer();
    const getScenarioDetailUseCase = container.get<GetScenarioDetailUseCase>(TOKENS.GetScenarioDetailUseCase);
    const getAvailabilityUseCase = container.get<GetAvailabilityUseCase>(TOKENS.GetAvailabilityUseCase);
    
    // Execute Use Case through Application Layer - returns pure Domain Entities
    const domainResult: SubScenarioEntity = await getScenarioDetailUseCase.execute({ id });
    
    // Execute Availability Use Case with query params
    const availabilityResult = await getAvailabilityUseCase.execute({
      subScenarioId: parseInt(id),
      initialDate: awaitedSearchParams.date || getTodayString(),
      finalDate: awaitedSearchParams.finalDate,
      weekdays: parseWeekdays(awaitedSearchParams.weekdays),
    });
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult: SerializedScenarioDetailResponse = serializeScenarioDetailData(domainResult);
    const serializedAvailability: SerializedAvailabilityResponse = serializeAvailabilityData(availabilityResult);

    console.log('ScenarioDetailRoute - Fetched Scenario Data:', serializedResult);
    console.log('ScenarioDetailRoute - Fetched Availability Data:', serializedAvailability);

    // Atomic Design: Render page template with serialized data (plain objects)
    return <ScenarioDetailPage
      initialData={serializedResult}
      availabilityData={serializedAvailability}
      searchParams={awaitedSearchParams}
    />;

  } catch (error) {
    console.error('SSR Error in ScenarioDetailRoute:', error);

    // DDD: Handle domain-specific errors with proper responses
    if (error instanceof InvalidScenarioIdError) {
      console.warn('Invalid scenario ID provided:', error.message);
      redirect('/?error=invalid-scenario-id');
    }

    if (error instanceof ScenarioNotFoundError) {
      console.warn('Scenario not found:', error.message);
      notFound(); // Next.js 404 page
    }

    if (error instanceof ScenarioAccessDeniedError) {
      console.warn('Access denied to scenario:', error.message);
      redirect('/auth/login?redirect=' + encodeURIComponent(`/scenario/${id}`));
    }

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in ScenarioDetailRoute:', error);
    throw error;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  
  try {
    // Use the same DI container for metadata generation (Modern pattern)
    const container = ContainerFactory.createContainer();
    const getScenarioDetailUseCase = container.get<GetScenarioDetailUseCase>(TOKENS.GetScenarioDetailUseCase);
    const result = await getScenarioDetailUseCase.execute({ id });
    
    return {
      title: `${result.scenario.name} | Reserva tu Espacio Deportivo`,
      description: `Reserva ${result.scenario.name} en ${result.scenario.name}. ${result.hasCost ? 'Espacio de pago' : 'Espacio gratuito'} con capacidad para ${result.numberOfPlayers} jugadores.`,
      keywords: `${result.scenario.name}, ${result.scenario.name}, ${result.scenario.name}, reserva deportiva`,
    };
  } catch (error) {
    console.warn('Failed to generate metadata for scenario:', id, error);
    return {
      title: 'Escenario Deportivo | Reserva tu Espacio',
      description: 'Encuentra y reserva espacios deportivos para tus actividades.',
    };
  }
}
