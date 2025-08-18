import { ClientHttpClientFactory } from "./http-client-client";

export enum HomeSlideType {
  BANNER = "BANNER",
  PLACEHOLDER = "PLACEHOLDER",
}

export interface HomeSlide {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  slideType: HomeSlideType;
  moduleId: number | null;
  entityId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHomeSlideRequest {
  title: string;
  description?: string;
  imageUrl: string;
  displayOrder?: number;
  slideType?: HomeSlideType;
  moduleId?: number;
  entityId?: number;
}

export interface UpdateHomeSlideRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  slideType?: HomeSlideType;
  moduleId?: number;
  entityId?: number;
}

export interface GetHomeSlidesParams {
  slideType?: HomeSlideType;
  isActive?: boolean;
  limit?: number;
}

export interface ReorderSlideRequest {
  id: number;
  displayOrder: number;
}

export interface ReorderSlidesRequest {
  slideOrders: ReorderSlideRequest[];
}

class HomeSlidesService {
  private readonly httpClient = ClientHttpClientFactory.createClientWithAuth();

  async getHomeSlides(params?: GetHomeSlidesParams): Promise<HomeSlide[]> {
    const queryParams: Record<string, string> = {};
    if (params?.slideType) {
      queryParams.slideType = params.slideType;
    }
    if (params?.isActive !== undefined) {
      queryParams.isActive = String(params.isActive);
    }
    if (params?.limit) {
      queryParams.limit = String(params.limit);
    }
    const queryString =
      Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : "";
    const response = await this.httpClient.get<{
      data: HomeSlide[];
      message: string;
      statusCode: string;
    }>(`/home-slides${queryString}`);
    return response.data;
  }

  async getHomeBanners(): Promise<HomeSlide[]> {
    const response = await this.httpClient.get<{
      data: HomeSlide[];
      message: string;
      statusCode: string;
    }>(
      "/home-slides/banners"
    );
    return response.data;
  }

  async getPlaceholderSlide(): Promise<HomeSlide | null> {
    try {
      const response = await this.httpClient.get<HomeSlide>(
        "/home-slides/placeholder"
      );
      return response;
    } catch (error) {
      return null;
    }
  }

  async getHomeSlideById(id: number): Promise<HomeSlide | null> {
    try {
      const response = await this.httpClient.get<HomeSlide>(
        `/home-slides/${id}`
      );
      return response;
    } catch (error) {
      return null;
    }
  }

  async createHomeSlide(data: CreateHomeSlideRequest): Promise<HomeSlide> {
    console.log({dataToBeInserted: data});
    const response = await this.httpClient.post<HomeSlide>(
      "/home-slides",
      data
    );
    return response;
  
  }

  async updateHomeSlide(
    id: number,
    data: UpdateHomeSlideRequest
  ): Promise<HomeSlide> {
    const response = await this.httpClient.put<HomeSlide>(
      `/home-slides/${id}`,
      data
    );
    return response;
  }

  async toggleSlideStatus(id: number): Promise<HomeSlide> {
    const response = await this.httpClient.put<HomeSlide>(
      `/home-slides/${id}/toggle`
    );
    return response;
  }

  async reorderSlides(data: ReorderSlidesRequest): Promise<void> {
    await this.httpClient.put("/home-slides/reorder", data);
  }

  async deleteHomeSlide(id: number): Promise<void> {
    await this.httpClient.delete(`/home-slides/${id}`);
  }
}

export const homeSlidesService = new HomeSlidesService();
