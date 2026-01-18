import api from './api';
import { Load, Application } from '../types';

export const loadsService = {
  async getAvailableLoads(): Promise<Load[]> {
    const response = await api.get<Load[]>('/loads', {
      params: { status: 'OPEN' },
    });
    return response.data;
  },

  async getLoadById(id: string): Promise<Load> {
    const response = await api.get<Load>(`/loads/${id}`);
    return response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications/user');
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
