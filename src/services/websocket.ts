import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEBSOCKET_URL = 'https://clb-back-production.up.railway.app';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.log('No token available for WebSocket connection');
        return;
      }

      this.socket = io(WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
      });

      return this.socket;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      return null;
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  };

  // Join a journey room to receive location updates
  joinJourney = (journeyId: string) => {
    if (this.socket) {
      this.socket.emit('join-journey', journeyId);
    }
  };

  // Leave a journey room
  leaveJourney = (journeyId: string) => {
    if (this.socket) {
      this.socket.emit('leave-journey', journeyId);
    }
  };

  // Listen for location updates
  onLocationUpdate = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  };

  // Remove location update listener
  offLocationUpdate = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.off('location-update', callback);
    }
  };

  // Listen for journey status changes
  onJourneyStatus = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.on('journey-status', callback);
    }
  };

  // Remove journey status listener
  offJourneyStatus = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.off('journey-status', callback);
    }
  };

  // Listen for new messages
  onNewMessage = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  };

  // Remove new message listener
  offNewMessage = (callback: (data: any) => void) => {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  };

  // Send a message
  sendMessage = (data: { receiverId: string; content: string }) => {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  };

  // Check if socket is connected
  isConnected = (): boolean => {
    return this.socket?.connected || false;
  };

  getSocket = (): Socket | null => {
    return this.socket;
  };
}

export default new WebSocketService();
