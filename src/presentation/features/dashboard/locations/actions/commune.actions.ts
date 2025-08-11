"use server";

import { revalidatePath } from 'next/cache';
import { CreateCommuneDto, UpdateCommuneDto } from '@/services/api';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export async function createCommuneAction(data: CreateCommuneDto) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const created = await httpClient.post('/communes', data);

    // Revalidate the locations page to show updated data
    revalidatePath('/dashboard/locations');

    return {
      success: true,
      data: created,
    };
  } catch (error: any) {
    console.error('Error creating commune:', error);
    return {
      success: false,
      error: error.message || 'Error al crear comuna',
    };
  }
}

export async function updateCommuneAction(
  id: number,
  data: UpdateCommuneDto
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updated = await httpClient.put(`/communes/${id}`, data);

    // Revalidate the locations page to show updated data
    revalidatePath('/dashboard/locations');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating commune:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar comuna',
    };
  }
}
