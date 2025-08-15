import {
  TLoginData,
  TRegisterData,
  TResetData,
} from "@/presentation/features/auth/schemas/auth-schemas";
import { ClientHttpClient } from "@/shared/api/http-client-client";
import { SimpleApiResponse } from "@/shared/api/types";
import { AuthTokens, User } from "@/entities/user/model/types";

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
    const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async register(data: TRegisterData): Promise<void> {
    const { confirmPassword, ...payload } = data; // ⬅️ remove it here
    await this.httpClient.post<SimpleApiResponse<void>>("/users", payload);
  }

  async getCurrentUser(): Promise<User> {
    const response =
      await this.httpClient.get<SimpleApiResponse<User>>("/auth/me");
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
    return response.data;
  }

  async resetPassword(data: TResetData): Promise<void> {
    await this.httpClient.post<SimpleApiResponse<void>>(
      "/auth/reset-password",
      data
    );
  }

  async logout(): Promise<void> {
    await this.httpClient.post<SimpleApiResponse<void>>("/auth/logout");
  }
}

// Factory function for creating repository instances
export const createUserRepository = (
  httpClient: ClientHttpClient
): UserRepository => {
  return new ApiUserRepository(httpClient);
};