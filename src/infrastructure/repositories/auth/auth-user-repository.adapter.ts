import {
  TLoginData,
  TRegisterData,
  TResetData,
} from "@/presentation/features/auth/schemas/auth-schemas";
import { ClientHttpClient } from "@/shared/api/http-client-client";
import { SimpleApiResponse } from "@/shared/api/types";
import { AuthTokens, User } from "@/entities/user/model/types";
import { executeWithDomainError } from './execute-with-domain-error.wrapper';

export interface UserRepository {
  login(credentials: TLoginData): Promise<AuthTokens>;
  register(data: TRegisterData): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  resetPassword(data: TResetData): Promise<void>;
  logout(): Promise<void>;
}

export class ApiUserRepository implements UserRepository {
  constructor(private httpClient: ClientHttpClient) {}

  async login(credentials: TLoginData): Promise<AuthTokens> {
    return executeWithDomainError(async () => {
      const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
        "/auth/login",
        credentials
      );
      return response.data;
    }, 'Failed to login user');
  }

  async register(data: TRegisterData): Promise<void> {
    return executeWithDomainError(async () => {
      const { confirmPassword, ...payload } = data; // remove confirmPassword here
      await this.httpClient.post<SimpleApiResponse<void>>("/users", payload);
    }, 'Failed to register user');
  }

  async getCurrentUser(): Promise<User> {
    return executeWithDomainError(async () => {
      const response =
        await this.httpClient.get<SimpleApiResponse<User>>("/auth/me");
      return response.data;
    }, 'Failed to get current user');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return executeWithDomainError(async () => {
      const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
        "/auth/refresh",
        { refresh_token: refreshToken }
      );
      return response.data;
    }, 'Failed to refresh auth token');
  }

  async resetPassword(data: TResetData): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.post<SimpleApiResponse<void>>(
        "/auth/reset-password",
        data
      );
    }, 'Failed to reset password');
  }

  async logout(): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.post<SimpleApiResponse<void>>("/auth/logout");
    }, 'Failed to logout user');
  }
}

// Factory function for creating repository instances
export const createUserRepository = (
  httpClient: ClientHttpClient
): UserRepository => {
  return new ApiUserRepository(httpClient);
};