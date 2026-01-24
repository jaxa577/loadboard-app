import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadsService } from '../services/loads';
import { Load } from '../types';

interface Props {
  route: any;
  navigation: any;
}

export default function LoadDetailsScreen({ route, navigation }: Props) {
  const { loadId } = route.params;
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchLoadDetails();
  }, [loadId]);

  const fetchLoadDetails = async () => {
    try {
      const data = await loadsService.getLoadById(loadId);
      setLoad(data);

      // Check if user has already applied
      const applications = await loadsService.getMyApplications();
      const applied = applications.some((app) => app.loadId === loadId);
      setHasApplied(applied);
    } catch (error) {
      console.error('Error fetching load:', error);
      Alert.alert('Error', 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    Alert.alert(
      'Apply to Load',
      'Are you sure you want to apply to this load?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setApplying(true);
            try {
              await loadsService.applyToLoad(loadId);
              setHasApplied(true);
              Alert.alert('Success', 'Application submitted successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to apply'
              );
            } finally {
              setApplying(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!load) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Load not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {load.originCity} → {load.destinationCity}
          </Text>
          <Text style={styles.price}>${load.price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origin:</Text>
            <Text style={styles.value}>
              {load.originCity}, {load.originRegion}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Destination:</Text>
            <Text style={styles.value}>
              {load.destinationCity}, {load.destinationRegion}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{load.cargoType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{load.weight >= 1000 ? `${(load.weight / 1000).toFixed(1)} т` : `${load.weight} кг`}</Text>
          </View>
          {load.volume && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Volume:</Text>
              <Text style={styles.value}>{load.volume} m³</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Loading Date:</Text>
            <Text style={styles.value}>
              {new Date(load.loadingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivery Date:</Text>
            <Text style={styles.value}>
              {new Date(load.deliveryDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {load.shipper && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipper Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{load.shipper.name}</Text>
            </View>
            {load.shipper.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${load.shipper.phone}`)}
                  style={styles.phoneButton}
                >
                  <Ionicons name="call" size={16} color="#2563eb" />
                  <Text style={styles.phoneValue}>{load.shipper.phone}</Text>
                </TouchableOpacity>
              </View>
            )}
            {load.shipper.rating && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Rating:</Text>
                <Text style={styles.value}>
                  ⭐ {load.shipper.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {hasApplied ? (
          <View style={styles.appliedContainer}>
            <Text style={styles.appliedText}>✓ Application Submitted</Text>
            <Text style={styles.appliedSubtext}>
              The shipper will review your application
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.applyButton, applying && styles.buttonDisabled]}
            onPress={handleApply}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>Apply to Load</Text>
            )}
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  phoneValue: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  appliedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  appliedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  appliedSubtext: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
});
