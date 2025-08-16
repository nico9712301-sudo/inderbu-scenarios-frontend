import { 
  InvalidScenarioIdError, 
  ScenarioNotFoundError,
  ScenarioAccessDeniedError 
} from '@/entities/scenario/domain/scenario-detail.domain';
import { ScenarioDetailPage } from '@/presentation/features/scenarios/detail/components/pages/ScenarioDetailPage';
import { createScenarioDetailContainer } from '@/presentation/features/scenarios/detail/di';
import { serializeScenarioDetailData } from '@/presentation/utils/serialization.utils';
import { redirect, notFound } from 'next/navigation';
interface PageProps {
  params: { id: string };
}

/**
 * Scenario Detail Page Route (Server Component)
 * 
 * Next.js App Router page that handles individual scenario details.
 * Uses dependency injection to get data and render the presentation layer.
 * Currently using legacy DI system - TODO: Migrate to standard ContainerFactory
 */
export default async function ScenarioDetailRoute({ params }: PageProps) {
  const { id } = await params;
  
  try {
    // DDD: Dependency injection - build complete container (Legacy pattern - TODO: migrate)
    const { getScenarioDetailUseCase } = createScenarioDetailContainer();
    
    // Execute Use Case through Application Layer - returns pure Domain Entities
    const domainResult = await getScenarioDetailUseCase.execute({ id });
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeScenarioDetailData(domainResult);

    // Atomic Design: Render page template with serialized data (plain objects)
    return <ScenarioDetailPage
      initialData={serializedResult} 
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
    // Use the same DI container for metadata generation (Legacy pattern - TODO: migrate)
    const { getScenarioDetailUseCase } = createScenarioDetailContainer();
    const result = await getScenarioDetailUseCase.execute({ id });
    
    return {
      title: `${result.scenario.name} | Reserva tu Espacio Deportivo`,
      description: `Reserva ${result.scenario.name} en ${result.scenario.scenario.name}. ${result.scenario.hasCost ? 'Espacio de pago' : 'Espacio gratuito'} con capacidad para ${result.scenario.numberOfPlayers} jugadores.`,
      keywords: `${result.scenario.name}, ${result.scenario.scenario.name}, ${result.scenario.activityArea.name}, reserva deportiva`,
    };
  } catch (error) {
    console.warn('Failed to generate metadata for scenario:', id, error);
    return {
      title: 'Escenario Deportivo | Reserva tu Espacio',
      description: 'Encuentra y reserva espacios deportivos para tus actividades.',
    };
  }
}
