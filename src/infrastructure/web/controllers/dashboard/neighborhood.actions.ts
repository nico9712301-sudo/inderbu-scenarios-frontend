"use server";

import { CreateNeighborhoodDto, UpdateNeighborhoodDto } from '@/shared/api/dto-types';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { revalidatePath } from 'next/cache';

/**
 * Neighborhood Server Actions
 * 
 * Next.js Server Actions that handle neighborhood management requests.
 * These act as controllers in the Clean Architecture.
 */

export async function createNeighborhoodAction(data: CreateNeighborhoodDto) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const created = await httpClient.post('/neighborhoods', data);

    // Revalidate the locations page to show updated data
    revalidatePath('/dashboard/locations');

    return {
      success: true,
      data: created,
    };
  } catch (error: any) {
    console.error('Error creating neighborhood:', error);
    return {
      success: false,
      error: error.message || 'Error al crear barrio',
    };
  }
}

export async function updateNeighborhoodAction(
  id: number,
  data: UpdateNeighborhoodDto
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updated = await httpClient.put(`/neighborhoods/${id}`, data);

    // Revalidate the locations page to show updated data
    revalidatePath('/dashboard/locations');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating neighborhood:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar barrio',
    };
  }
}