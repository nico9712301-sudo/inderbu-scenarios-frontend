"use server";

import { revalidatePath } from 'next/cache';
import { CreateScenarioDto, UpdateScenarioDto } from '@/services/api';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { createScenariosContainer } from '../di/ScenariosContainer.server';
import { IScenariosFilters } from '../domain/repositories/IScenarioRepository';

export async function createScenarioAction(data: CreateScenarioDto) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const created = await httpClient.post('/scenarios', data);

    // Revalidate the scenarios page to show updated data
    revalidatePath('/dashboard/scenarios');

    return {
      success: true,
      data: created,
    };
  } catch (error: any) {
    console.error('Error creating scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al crear escenario',
    };
  }
}

export async function updateScenarioAction(
  id: number,
  data: UpdateScenarioDto
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    
    console.log('Data:', data);

    // Direct API call with authentication
    const updated = await httpClient.put(`/scenarios/${id}`, data);

    // Revalidate the scenarios page to show updated data
    revalidatePath('/dashboard/scenarios');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar escenario',
    };
  }
}
