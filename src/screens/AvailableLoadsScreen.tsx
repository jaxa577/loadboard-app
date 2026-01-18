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
import { Load } from '../types';

interface Props {
  navigation: any;
}

export default function AvailableLoadsScreen({ navigation }: Props) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      const data = await loadsService.getAvailableLoads();
      setLoads(data);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoads();
  }, []);

  const renderLoadCard = ({ item }: { item: Load }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LoadDetails', { loadId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.route}>
          {item.originCity} → {item.destinationCity}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cargo:</Text>
          <Text style={styles.detailValue}>{item.cargoType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Weight:</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loading:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.loadingDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.deliveryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.shipper && (
        <View style={styles.shipperInfo}>
          <Text style={styles.shipperName}>{item.shipper.name}</Text>
          {item.shipper.rating && (
            <Text style={styles.rating}>⭐ {item.shipper.rating.toFixed(1)}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

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
        data={loads}
        renderItem={renderLoadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No available loads</Text>
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
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
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
  shipperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shipperName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  rating: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
