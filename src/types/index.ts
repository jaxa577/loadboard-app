export interface Load {
  id: string;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  cargoType: string;
  weight: number;
  volume?: number;
  price: number;
  loadingDate: string;
  deliveryDate: string;
  status: string;
  shipperId: string;
  shipper?: {
    id: string;
    name: string;
    phone: string;
    rating?: number;
  };
  applications?: Application[];
  createdAt: string;
}

export interface Application {
  id: string;
  loadId: string;
  applicantId: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  load?: Load;
}

export interface Journey {
  id: string;
  loadId: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
}
