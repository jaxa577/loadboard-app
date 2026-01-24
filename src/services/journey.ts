import api from './api';
import { Journey, LocationData } from '../types';

export const journeyService = {
  async startJourney(loadId: string): Promise<Journey> {
    const response = await api.post<Journey>('/journeys/start', { loadId });
    return response.data;
  },

  async stopJourney(journeyId: string): Promise<Journey> {
    const response = await api.post<Journey>(`/journeys/stop/${journeyId}`);
    return response.data;
  },

  async sendLocation(
    journeyId: string,
    locationData: LocationData
  ): Promise<void> {
    await api.post('/journeys/locations', {
      journeyId,
      ...locationData,
    });
  },

  async getActiveJourney(loadId: string): Promise<Journey | null> {
    try {
      const response = await api.get<Journey>(`/journeys/active/${loadId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
