import api from './api';
import { Load, Application, PaginationInfo } from '../types';

export interface LoadsResponse {
  loads: Load[];
  pagination: PaginationInfo;
}

export const loadsService = {
  async getAvailableLoads(page: number = 1, limit: number = 20): Promise<LoadsResponse> {
    const response = await api.get<LoadsResponse>('/loads', {
      params: {
        page,
        limit,
      },
    });
    // Backend returns { loads, pagination } structure
    return {
      loads: response.data.loads || [],
      pagination: response.data.pagination || { page, limit, total: 0, pages: 0 },
    };
  },

  async getLoadById(id: string): Promise<Load> {
    const response = await api.get<Load>(`/loads/${id}`);
    return response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications/my');
    return response.data;
  },

  async applyToLoad(loadId: string): Promise<Application> {
    const response = await api.post<Application>('/applications', {
      loadId,
      role: 'DRIVER',
    });
    return response.data;
  },

  async getAcceptedLoads(): Promise<Application[]> {
    const applications = await this.getMyApplications();
    return applications.filter((app) => app.status === 'ACCEPTED');
  },
};
