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
import { Application, Load } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Props {
  navigation: any;
}

export default function MyLoadsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [dataItems, setDataItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const isDriver = user?.role === 'DRIVER';

  useEffect(() => {
    fetchMyLoads();
  }, []);

  const fetchMyLoads = async () => {
    try {
      if (isDriver) {
        const data = await loadsService.getAcceptedLoads();
        setDataItems(data);
      } else {
        const response = await api.get('/loads/my');
        setDataItems(response.data);
      }
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

  const renderLoadCard = ({ item }: { item: any }) => {
    // If Driver, item is an Application involving a load
    // If Broker/Shipper, item is a Load object directly
    const load = isDriver ? item.load : item;

    if (!load) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (isDriver) {
             navigation.navigate('JourneyControls', {
               loadId: load.id,
               applicationId: item.id,
             });
          }
        }}
        activeOpacity={isDriver ? 0.7 : 1}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.route}>
              {load.originCity} → {load.destinationCity}
            </Text>
            <Text style={styles.idText}>ID: {load.displayId || load.id.slice(-6)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{load.status || t('load.status.active')}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('load.cargoType')}:</Text>
            <Text style={styles.detailValue}>{load.cargoType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('load.weight')}:</Text>
            <Text style={styles.detailValue}>{load.weight} kg</Text>
          </View>
          <View style={styles.detailRow}>
             <Text style={styles.detailLabel}>{t('load.posted')}:</Text>
             <Text style={styles.detailValue}>
               {load.createdAt ? formatDistanceToNow(new Date(load.createdAt), { addSuffix: true }) : t('time.recently')}
             </Text>
          </View>
          <View style={styles.detailRow}>
             <Text style={styles.detailLabel}>{t('load.date')}:</Text>
             <Text style={styles.detailValue}>
               {new Date(load.loadingDate || load.deliveryDate || Date.now()).toLocaleDateString() === new Date().toLocaleDateString() ? t('time.today') : new Date(load.loadingDate || load.deliveryDate || Date.now()).toLocaleDateString()}
             </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('load.payment')}:</Text>
            <Text style={styles.priceValue}>{load.price != null ? `$${load.price}` : t('load.negotiable') || 'Negotiable'}</Text>
          </View>
        </View>

        {isDriver && load.shipper && (
          <View style={styles.shipperInfo}>
            <Text style={styles.shipperName}>{t('roles.shipper')}: {load.shipper.name}</Text>
            <Text style={styles.shipperPhone}>{load.shipper.phone}</Text>
          </View>
        )}

        {isDriver && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              navigation.navigate('JourneyControls', {
                loadId: load.id,
                applicationId: item.id,
              })
            }
          >
            <Text style={styles.startButtonText}>{t('load.startJourney')} →</Text>
          </TouchableOpacity>
        )}
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
      <Text style={styles.activeCounter}>
        {dataItems.length} {t('load.status.active')} {t('load.loads')}
      </Text>
      <FlatList
        data={dataItems}
        renderItem={renderLoadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('load.noActiveLoads')}</Text>
            <Text style={styles.emptySubtext}>
              {t('load.applyToStart')}
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
  },
  idText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '500',
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
  activeCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
});
