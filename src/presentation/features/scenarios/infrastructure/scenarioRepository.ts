// Infrastructure: Clean Scenario Repository Adapter (DDD Architecture - No Legacy Dependencies)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ScenarioApiData {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
}

// Clean Scenario API Service (no server contamination, no legacy apiClient)
export async function getScenarioById(scenarioId: string): Promise<ScenarioApiData> {
  try {
    const url = `${API_BASE_URL}/sub-scenarios/${scenarioId}`;
    console.log('Fetching scenario from:', url);

    const response = await fetch(url, {
      cache: 'no-store', // Dynamic data for individual scenarios
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Scenario with ID ${scenarioId} not found`);
      }
      throw new Error(`Failed to fetch scenario: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // DEBUG: Log actual API response structure
    console.log('RAW API Response:', JSON.stringify(data, null, 2));
    
    // HANDLE DIFFERENT API RESPONSE FORMATS
    let scenario: ScenarioApiData;
    
    if (data && typeof data.id === 'number') {
      // Direct scenario object
      scenario = data;
    } else if (data && data.data && typeof data.data.id === 'number') {
      // Wrapped in data property
      scenario = data.data;
    } else if (data && data.subScenario && typeof data.subScenario.id === 'number') {
      // Wrapped in subScenario property
      scenario = data.subScenario;
    } else {
      console.error('Unexpected API response format for scenario:', data);
      throw new Error('Invalid scenario data format received from API');
    }
    
    console.log(`Fetched scenario: "${scenario.name}" (ID: ${scenario.id})`);
    return scenario;

  } catch (error) {
    console.error('Error fetching scenario:', error);
    throw error;
  }
}

// Repository Adapter Pattern (bridges domain to API) - CLEAN VERSION
export class CleanScenarioRepositoryAdapter {
  async findById(scenarioId: string): Promise<ScenarioApiData | null> {
    console.log('CleanScenarioRepositoryAdapter: Executing findById with ID:', scenarioId);
    
    try {
      const data = await getScenarioById(scenarioId);
      
      console.log(`CleanScenarioRepositoryAdapter: Found scenario "${data.name}"`);
      return data;
    } catch (error) {
      console.error('CleanScenarioRepositoryAdapter: Error:', error);
      
      // Handle 404 as null (not found)
      if (error instanceof Error && error.message.includes('not found')) {
        console.log(`Scenario ${scenarioId} not found`);
        return null;
      }
      
      throw error;
    }
  }

  async exists(scenarioId: string): Promise<boolean> {
    console.log('CleanScenarioRepositoryAdapter: Checking existence of ID:', scenarioId);
    
    try {
      const scenario = await this.findById(scenarioId);
      const exists = scenario !== null;
      
      console.log(`Scenario ${scenarioId} exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error('CleanScenarioRepositoryAdapter: Error checking existence:', error);
      return false;
    }
  }
}

// Export service object for easy usage
export const scenarioApiService = {
  getScenarioById
};