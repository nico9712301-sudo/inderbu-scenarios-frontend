"use server";

import { revalidatePath } from 'next/cache';
import { SubScenario } from '@/services/api';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { SubScenarioRepository } from '../infrastructure/SubScenarioRepository';

export async function createSubScenarioAction(
  data: Omit<SubScenario, "id"> & { images?: any[] }
) {
  try {
    // Autenticación desde servidor
    const subscenarioRepository = new SubScenarioRepository();
    // Direct API call with authentication
    const subScenarioCreated = await subscenarioRepository.create(data);

    // Revalidate the sub-scenarios page to show updated data
    // revalidatePath('/dashboard/sub-scenarios');
    return {
      success: true,
      data: subScenarioCreated,
    };
  } catch (error: any) {
    console.error('Error creating sub-scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al crear sub-escenario',
    };
  }
}

export async function associateImagesToSubScenarioAction(
  id: number,
  images: any[]
) {
  try {
    // Autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Prepare FormData for image uploads
    const fd = new FormData();
    images.forEach((img) => {
      fd.append("files", img.file);
      fd.append("isFeature", img.isFeature ? "true" : "false");
    });

    // Direct API call with authentication
    await httpClient.post(`/sub-scenarios/${id}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Revalidate the sub-scenarios page to show updated data
    revalidatePath('/dashboard/sub-scenarios');

    return {
      success: true,
      message: 'Images associated successfully',
    };
  } catch (error: any) {
    console.error('Error associating images to sub-scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al asociar imágenes al sub-escenario',
    };
  }
}

export async function updateSubScenarioAction(
  id: number,
  data: Partial<SubScenario>
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updated = await httpClient.put(`/sub-scenarios/${id}`, data);

    // Revalidate the sub-scenarios page to show updated data
    revalidatePath('/dashboard/sub-scenarios');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating sub-scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar sub-escenario',
    };
  }
}
