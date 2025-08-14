import { IActivityArea, INeighborhood } from "../types/filters.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface SubScenarioApiData {
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

interface ActivityAreaApiData {
  id: number;
  name: string;
}

interface NeighborhoodApiData {
  id: number;
  name: string;
}

// Sub-Scenarios API Service
export async function getSubScenarios(params: {
  page: number;
  limit: number;
  searchQuery: string;
  activityAreaId: number;
  neighborhoodId: number;
  hasCost?: boolean;
}): Promise<{ data: SubScenarioApiData[]; meta: any }> {
  try {
    const searchParams = new URLSearchParams();
    
    searchParams.append('page', params.page.toString());
    searchParams.append('limit', params.limit.toString());
    
    if (params.searchQuery.trim()) {
      searchParams.append('search', params.searchQuery.trim());
    }
    
    if (params.activityAreaId > 0) {
      searchParams.append('activityAreaId', params.activityAreaId.toString());
    }
    
    if (params.neighborhoodId > 0) {
      searchParams.append('neighborhoodId', params.neighborhoodId.toString());
    }
    
    if (params.hasCost !== undefined) {
      searchParams.append('hasCost', params.hasCost.toString());
    }

    const url = `${API_BASE_URL}/sub-scenarios?${searchParams.toString()}`;
    console.log('Fetching sub-scenarios from:', url);

    const response = await fetch(url, {
      cache: 'no-store', // SSR fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sub-scenarios: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<SubScenarioApiData[]> = await response.json();
    
    console.log(`Fetched ${result.data.length} sub-scenarios`);
    
    return {
      data: result.data,
      meta: result.meta || {
        page: params.page,
        limit: params.limit,
        totalPages: 1,
        totalItems: result.data.length
      }
    };

  } catch (error) {
    console.error('Error fetching sub-scenarios:', error);
    throw error;
  }
}

// Activity Areas API Service
export async function getActivityAreas(): Promise<IActivityArea[]> {
  try {
    const url = `${API_BASE_URL}/activity-areas`;
    console.log('Fetching activity areas from:', url);

    const response = await fetch(url, {
      cache: 'force-cache', // Static data can be cached
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activity areas: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<IActivityArea[]> = await response.json();
    
    console.log(`Fetched ${result.data.length} activity areas`);
    return result.data;

  } catch (error) {
    console.error('Error fetching activity areas:', error);
    throw error;
  }
}

// Neighborhoods API Service  
export async function getNeighborhoods(): Promise<INeighborhood[]> {
  try {
    const url = `${API_BASE_URL}/neighborhoods`;
    console.log('Fetching neighborhoods from:', url);

    const response = await fetch(url, {
      cache: 'force-cache', // Static data can be cached
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhoods: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<INeighborhood[]> = await response.json();
    
    console.log(`Fetched ${result.data.length} neighborhoods`);
    return result.data;

  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    throw error;
  }
}

// Search functions for client-side components
export async function searchActivityAreas(search: string = ""): Promise<ActivityAreaApiData[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append('search', search.trim());
    }
    params.append('limit', '20');

    const url = `${API_BASE_URL}/activity-areas?${params.toString()}`;
    console.log('Searching activity areas:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search activity areas: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<ActivityAreaApiData[]> = await response.json();
    console.log(`Found ${result.data.length} activity areas matching "${search}"`);
    return result.data;

  } catch (error) {
    console.error('Error searching activity areas:', error);
    return []; // Return empty array on error
  }
}

export async function searchNeighborhoods(search: string = ""): Promise<NeighborhoodApiData[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append('search', search.trim());
    }
    params.append('limit', '20');

    const url = `${API_BASE_URL}/neighborhoods?${params.toString()}`;
    console.log('Searching neighborhoods:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search neighborhoods: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<NeighborhoodApiData[]> = await response.json();
    console.log(`Found ${result.data.length} neighborhoods matching "${search}"`);
    return result.data;

  } catch (error) {
    console.error('Error searching neighborhoods:', error);
    return []; // Return empty array on error
  }
}

// Export API service objects for adapters
export const subScenarioApiService = {
  getSubScenarios
};


export const neighborhoodApiService = {
  getNeighborhoods
};

