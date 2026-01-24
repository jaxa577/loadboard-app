import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

interface Load {
  id: string;
  originCity: string;
  destinationCity: string;
  cargoType: string;
  weight: number;
  price: number;
  status: string;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  loadId: string;
  load: Load;
}

export default function ApplicationsScreen() {
  const navigation = useNavigation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      case 'PENDING':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'PENDING':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderApplicationItem = ({ item }: { item: Application }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => (navigation as any).navigate('LoadDetails', { loadId: item.loadId })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <Text style={styles.city}>{item.load.originCity}</Text>
          <Ionicons name="arrow-forward" size={16} color="#666" />
          <Text style={styles.city}>{item.load.destinationCity}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={16}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.load.cargoType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="scale-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.load.weight} kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>${item.load.price}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Applied:</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          {item.updatedAt !== item.createdAt && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Updated:</Text>
              <Text style={styles.dateText}>{formatDate(item.updatedAt)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>View Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Applications</Text>
      <Text style={styles.emptyText}>
        You haven't applied to any loads yet. Browse available loads to get
        started.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  city: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flexDirection: 'row',
    gap: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: '#999',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetails: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
