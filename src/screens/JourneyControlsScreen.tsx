import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { journeyService } from '../services/journey';
import { loadsService } from '../services/loads';
import { Journey, Load } from '../types';

interface Props {
  route: any;
  navigation: any;
}

export default function JourneyControlsScreen({ route, navigation }: Props) {
  const { loadId } = route.params;
  const [journey, setJourney] = useState<Journey | null>(null);
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initialize();

    return () => {
      stopLocationTracking();
    };
  }, []);

  const initialize = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      // Fetch load details
      const loadData = await loadsService.getLoadById(loadId);
      setLoad(loadData);

      // Check for active journey
      const activeJourney = await journeyService.getActiveJourney(loadId);
      if (activeJourney) {
        setJourney(activeJourney);
        startLocationTracking(activeJourney.id);
      }
    } catch (error) {
      console.error('Error initializing:', error);
      Alert.alert('Error', 'Failed to initialize journey');
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async () => {
    try {
      const newJourney = await journeyService.startJourney(loadId);
      setJourney(newJourney);
      startLocationTracking(newJourney.id);
      Alert.alert('Journey Started', 'GPS tracking is now active');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start journey');
    }
  };

  const stopJourney = async () => {
    if (!journey) return;

    Alert.alert(
      'Stop Journey',
      'Are you sure you want to stop this journey?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await journeyService.stopJourney(journey.id);
              stopLocationTracking();
              setJourney(null);
              Alert.alert('Journey Completed', 'Your journey has been completed');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to stop journey');
            }
          },
        },
      ]
    );
  };

  const startLocationTracking = async (journeyId: string) => {
    setTracking(true);

    // Request background location permission
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Background Permission',
        'Background location permission is needed for continuous tracking'
      );
    }

    // Send location updates every 10 seconds
    locationInterval.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed || 0,
          timestamp: location.timestamp,
        };

        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Send location to backend
        await journeyService.sendLocation(journeyId, locationData);
      } catch (error) {
        console.error('Error tracking location:', error);
      }
    }, 10000); // Every 10 seconds
  };

  const stopLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
    setTracking(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {load && (
          <>
            <View style={styles.loadInfo}>
              <Text style={styles.title}>
                {load.originCity} → {load.destinationCity}
              </Text>
              <Text style={styles.subtitle}>{load.cargoType}</Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>Journey Status</Text>
                {journey && tracking && (
                  <View style={styles.trackingIndicator}>
                    <View style={styles.trackingDot} />
                    <Text style={styles.trackingText}>Tracking</Text>
                  </View>
                )}
              </View>

              {journey ? (
                <View style={styles.journeyInfo}>
                  <Text style={styles.journeyText}>
                    Started: {new Date(journey.startTime).toLocaleString()}
                  </Text>
                  {currentLocation && (
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationText}>Current Location:</Text>
                      <Text style={styles.coordinates}>
                        {currentLocation.latitude.toFixed(6)},{' '}
                        {currentLocation.longitude.toFixed(6)}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.notStartedText}>Journey not started</Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(load.deliveryDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment:</Text>
                <Text style={styles.infoPrice}>${load.price}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.controls}>
        {!journey ? (
          <TouchableOpacity style={styles.startButton} onPress={startJourney}>
            <Text style={styles.startButtonText}>Start Journey</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopJourney}>
            <Text style={styles.stopButtonText}>Complete Journey</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  trackingText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  journeyInfo: {
    marginTop: 8,
  },
  journeyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  locationInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  notStartedText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoPrice: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  controls: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
