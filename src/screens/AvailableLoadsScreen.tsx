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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadsService } from '../services/loads';
import { Load } from '../types';

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
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      const data = await loadsService.getAvailableLoads();
      console.log('Fetched loads:', data?.length || 0, 'loads');
      setLoads(data || []);
      applyFilters(data || [], searchQuery, filters);
    } catch (error: any) {
      console.error('Error fetching loads:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoads();
  }, []);

  const applyFilters = (data: Load[], search: string, activeFilters: Filters) => {
    let result = [...data];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (load) =>
          load.originCity.toLowerCase().includes(query) ||
          load.destinationCity.toLowerCase().includes(query) ||
          load.cargoType.toLowerCase().includes(query)
      );
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

    // Cargo type filter
    if (activeFilters.cargoType) {
      result = result.filter((load) =>
        load.cargoType.toLowerCase().includes(activeFilters.cargoType!.toLowerCase())
      );
    }

    // Origin city filter
    if (activeFilters.originCity) {
      result = result.filter((load) =>
        load.originCity.toLowerCase().includes(activeFilters.originCity!.toLowerCase())
      );
    }

    // Destination city filter
    if (activeFilters.destinationCity) {
      result = result.filter((load) =>
        load.destinationCity.toLowerCase().includes(activeFilters.destinationCity!.toLowerCase())
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
      return `${(weightKg / 1000).toFixed(1)} т`;
    }
    return `${weightKg} кг`;
  };

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
          <Text style={styles.detailValue}>{formatWeight(item.weight)}</Text>
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city or cargo type..."
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

      {/* Loads List */}
      <FlatList
        data={filteredLoads}
        renderItem={renderLoadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No loads found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || getActiveFilterCount() > 0
                ? 'Try adjusting your search or filters'
                : 'Check back later for new loads'}
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
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filter Inputs */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.minPrice?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('minPrice', text)}
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.maxPrice?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('maxPrice', text)}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Weight Range (kg)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.minWeight?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('minWeight', text)}
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.maxWeight?.toString() || ''}
                  onChangeText={(text) => handleFilterChange('maxWeight', text)}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Cargo Type</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder="e.g., Electronics, Food"
                value={filters.cargoType || ''}
                onChangeText={(text) => handleFilterChange('cargoType', text)}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Origin City</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder="e.g., Moscow"
                value={filters.originCity || ''}
                onChangeText={(text) => handleFilterChange('originCity', text)}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Destination City</Text>
              <TextInput
                style={styles.filterInputFull}
                placeholder="e.g., St. Petersburg"
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
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyActiveFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    color: '#333',
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
    color: '#333',
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
    color: '#666',
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2563eb',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
