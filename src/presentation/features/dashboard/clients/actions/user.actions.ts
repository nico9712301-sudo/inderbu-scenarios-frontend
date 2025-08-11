"use server";

import { revalidatePath } from 'next/cache';
import { CreateUserDto, UpdateUserDto } from '../domain/repositories/IUserRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export async function createUserAction(data: CreateUserDto) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const created = await httpClient.post('/users', data);

    // Revalidate the clients page to show updated data
    revalidatePath('/dashboard/clients');

    return {
      success: true,
      data: created,
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error.message || 'Error al crear usuario',
    };
  }
}

export async function updateUserAction(
  id: number,
  data: UpdateUserDto
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updated = await httpClient.put(`/users/${id}`, data);

    // Revalidate the clients page to show updated data
    revalidatePath('/dashboard/clients');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar usuario',
    };
  }
}

export async function getUserByIdAction(id: number) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const user = await httpClient.get(`/users/${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error('Error getting user:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener usuario',
    };
  }
}
