import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { loadsService } from '../services/loads';
import { Application } from '../types';

interface Props {
  navigation: any;
}

export default function MyLoadsScreen({ navigation }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyLoads();
  }, []);

  const fetchMyLoads = async () => {
    try {
      const data = await loadsService.getAcceptedLoads();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching my loads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyLoads();
  }, []);

  const renderLoadCard = ({ item }: { item: Application }) => {
    if (!item.load) return null;

    const load = item.load;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('JourneyControls', {
            loadId: load.id,
            applicationId: item.id,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.route}>
            {load.originCity} → {load.destinationCity}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cargo:</Text>
            <Text style={styles.detailValue}>{load.cargoType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{load.weight} kg</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery:</Text>
            <Text style={styles.detailValue}>
              {new Date(load.deliveryDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={styles.priceValue}>${load.price}</Text>
          </View>
        </View>

        {load.shipper && (
          <View style={styles.shipperInfo}>
            <Text style={styles.shipperName}>Shipper: {load.shipper.name}</Text>
            <Text style={styles.shipperPhone}>{load.shipper.phone}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate('JourneyControls', {
              loadId: load.id,
              applicationId: item.id,
            })
          }
        >
          <Text style={styles.startButtonText}>Start Journey →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
      <FlatList
        data={applications}
        renderItem={renderLoadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active loads</Text>
            <Text style={styles.emptySubtext}>
              Apply to available loads to get started
            </Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  route: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  priceValue: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    flex: 1,
  },
  shipperInfo: {
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shipperName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shipperPhone: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});
