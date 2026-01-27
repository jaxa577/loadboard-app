import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { loadsService } from '../services/loads';
import { Load, PaginationInfo } from '../types';

interface Props {
  navigation: any;
}

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  cargoType?: string;
  originCity?: string;
  destinationCity?: string;
}

export default function AvailableLoadsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchLoads(1, true);
  }, []);

  const fetchLoads = async (page: number = 1, reset: boolean = false) => {
    try {
      setError(null);
      const response = await loadsService.getAvailableLoads(page, 20);
      console.log('Fetched loads:', response.loads?.length || 0, 'loads, page:', page);

      if (reset) {
        setLoads(response.loads);
        applyFilters(response.loads, searchQuery, filters);
      } else {
        const newLoads = [...loads, ...response.loads];
        setLoads(newLoads);
        applyFilters(newLoads, searchQuery, filters);
      }

      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching loads:', err);
      console.error('Error details:', err.response?.data || err.message);

      const errorMessage = err.response?.data?.message || err.message || t('errors.fetchFailed');
      setError(errorMessage);

      if (err.response?.status === 401) {
        Alert.alert(
          t('errors.authError'),
          t('errors.sessionExpired'),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          t('errors.error'),
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoads(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || pagination.page >= pagination.pages) return;

    setLoadingMore(true);
    fetchLoads(pagination.page + 1, false);
  }, [loadingMore, pagination, loads]);

  const applyFilters = (data: Load[], search: string, activeFilters: Filters) => {
    let result = [...data];

    // Search filter - with null safety
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((load) => {
        const originCity = load.originCity?.toLowerCase() || '';
        const destinationCity = load.destinationCity?.toLowerCase() || '';
        const cargoType = load.cargoType?.toLowerCase() || '';
        const displayId = load.displayId?.toLowerCase() || '';

        return (
          originCity.includes(query) ||
          destinationCity.includes(query) ||
          cargoType.includes(query) ||
          displayId.includes(query)
        );
      });
    }

    // Price filters
    if (activeFilters.minPrice) {
      result = result.filter((load) => load.price >= (activeFilters.minPrice || 0));
    }
    if (activeFilters.maxPrice) {
      result = result.filter((load) => load.price <= (activeFilters.maxPrice || Infinity));
    }

    // Weight filters
    if (activeFilters.minWeight) {
      result = result.filter((load) => load.weight >= (activeFilters.minWeight || 0));
    }
    if (activeFilters.maxWeight) {
      result = result.filter((load) => load.weight <= (activeFilters.maxWeight || Infinity));
    }

    // Cargo type filter - with null safety
    if (activeFilters.cargoType) {
      result = result.filter((load) =>
        (load.cargoType?.toLowerCase() || '').includes(activeFilters.cargoType!.toLowerCase())
      );
    }

    // Origin city filter - with null safety
    if (activeFilters.originCity) {
      result = result.filter((load) =>
        (load.originCity?.toLowerCase() || '').includes(activeFilters.originCity!.toLowerCase())
      );
    }

    // Destination city filter - with null safety
    if (activeFilters.destinationCity) {
      result = result.filter((load) =>
        (load.destinationCity?.toLowerCase() || '').includes(activeFilters.destinationCity!.toLowerCase())
      );
    }

    setFilteredLoads(result);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(loads, text, filters);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    const newFilters = { ...filters, [key]: key.includes('City') || key === 'cargoType' ? value : numValue };
    setFilters(newFilters);
  };

  const applyActiveFilters = () => {
    applyFilters(loads, searchQuery, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    applyFilters(loads, searchQuery, {});
    setShowFilters(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((v) => v !== undefined && v !== '').length;
  };

  const formatWeight = (weightKg: number) => {
    if (weightKg >= 1000) {
      return `${(weightKg / 1000).toFixed(1)} ${t('units.tons')}`;
    }
    return `${weightKg} ${t('units.kg')}`;
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      RUB: '₽',
      KZT: '₸',
    };
    return `${symbols[currency] || currency}${price.toLocaleString()}`;
  };

  const renderLoadCard = ({ item }: { item: Load }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LoadDetails', { loadId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <Text style={styles.route}>
            {item.originCity || t('common.unknown')} → {item.destinationCity || t('common.unknown')}
          </Text>
          {item.displayId && (
            <Text style={styles.loadId}>ID: {item.displayId}</Text>
          )}
        </View>
        <Text style={styles.price}>{formatPrice(item.price, item.currency)}</Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('load.cargo')}:</Text>
          <Text style={styles.detailValue}>{item.cargoType || '-'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('load.weight')}:</Text>
          <Text style={styles.detailValue}>{formatWeight(item.weight)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('load.loading')}:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.loadingDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('load.delivery')}:</Text>
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.footerText}>{t('common.loadingMore')}</Text>
      </View>
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
      {/* Total Count Header */}
      <View style={styles.totalHeader}>
        <Text style={styles.totalText}>
          {t('load.totalLoads')}: {pagination.total}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('load.searchPlaceholder')}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter-outline" size={24} color="#2563eb" />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchLoads(1, true)}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loads List */}
      <FlatList
        data={filteredLoads}
        renderItem={renderLoadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('load.noLoads')}</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || getActiveFilterCount() > 0
                ? t('load.adjustFilters')
                : t('load.checkLater')}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('filter.title')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filter Inputs */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('filter.priceRange')}</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder={t('filter.min')}
                  keyboardType="numeric"
                  value={filters.minPrice?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('minPrice', text)}
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder={t('filter.max')}
                  keyboardType="numeric"
                  value={filters.maxPrice?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('maxPrice', text)}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('filter.weightRange')}</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder={t('filter.min')}
                  keyboardType="numeric"
                  value={filters.minWeight?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('minWeight', text)}
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder={t('filter.max')}
                  keyboardType="numeric"
                  value={filters.maxWeight?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('maxWeight', text)}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('filter.cargoType')}</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder={t('filter.cargoTypePlaceholder')}
                value={filters.cargoType || ''}
                onChangeText={(text) => handleFilterChange('cargoType', text)}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('filter.originCity')}</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder={t('filter.originCityPlaceholder')}
                value={filters.originCity || ''}
                onChangeText={(text) => handleFilterChange('originCity', text)}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('filter.destinationCity')}</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder={t('filter.destinationCityPlaceholder')}
                value={filters.destinationCity || ''}
                onChangeText={(text) => handleFilterChange('destinationCity', text)}
              />
            </View>

            {/* Filter Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>{t('filter.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyActiveFilters}
              >
                <Text style={styles.applyButtonText}>{t('filter.apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  totalHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeContainer: {
    flex: 1,
    marginRight: 12,
  },
  route: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  price: {
    fontSize: 24,
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
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  filterInputFull: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  filterSeparator: {
    fontSize: 16,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2563eb',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
