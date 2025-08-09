import { 
  InvalidScenarioIdError, 
  ScenarioNotFoundError,
  ScenarioAccessDeniedError 
} from '@/entities/scenario/domain/scenario-detail.domain';
import { ScenarioDetailPage } from '@/features/scenarios/detail/components/pages/ScenarioDetailPage';
import { createScenarioDetailContainer } from '@/features/scenarios/detail/di';
import { redirect, notFound } from 'next/navigation';
interface PageProps {
  params: { id: string };
}

export default async function ScenarioDetailRoute({ params }: PageProps) {
  const { id } = await params;
  
  // DDD: Dependency injection - build complete container
  const { scenarioDetailService } = createScenarioDetailContainer();

  try {
    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result = await scenarioDetailService.getScenarioDetail(id);

    // Atomic Design: Render page template with clean separation
    // PASS SERVER ACTION AS PROP
    return <ScenarioDetailPage
      initialData={result} 
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
    // Use the same DI container for metadata generation
    const { scenarioDetailService } = createScenarioDetailContainer();
    const result = await scenarioDetailService.getScenarioDetail(id);
    
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
