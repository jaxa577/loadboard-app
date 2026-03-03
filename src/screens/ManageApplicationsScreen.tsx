import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Applicant {
  id: string;
  name: string;
  role: string;
  rating: number;
}

interface Application {
  id: string;
  status: string;
  applicant: Applicant;
}

interface LoadWithApplications {
  id: string;
  displayId?: string;
  originCity: string;
  destinationCity: string;
  cargoType: string;
  weight: number;
  status: string;
  applications: Application[];
  createdAt: string;
}

export default function ManageApplicationsScreen() {
  const [loads, setLoads] = useState<LoadWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchLoadsWithApplications = async () => {
    try {
      // By default for Shipper/Broker, /loads/my returns loads with applications included
      const response = await api.get('/loads/my');
      setLoads(response.data);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoadsWithApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoadsWithApplications();
  }, []);

  const handleAction = async (applicationId: string, action: 'accept' | 'reject') => {
    setProcessingId(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/${action}`);
      Alert.alert(t('common.success'), `Application ${action}ed`);
      fetchLoadsWithApplications(); // Refresh to get updated statuses
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to process application';
      Alert.alert(t('common.error'), msg);
    } finally {
      setProcessingId(null);
    }
  };

  const renderApplication = (app: Application) => (
    <View key={app.id} style={styles.applicationItem}>
      <View style={styles.appHeader}>
        <View style={styles.appUserInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#4b5563" />
          <Text style={styles.appName}>{app.applicant.name}</Text>
          <Text style={styles.appRole}>({app.applicant.role})</Text>
        </View>
        <View style={styles.appRating}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.appRatingText}>
            {app.applicant.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {app.status === 'PENDING' ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            onPress={() => handleAction(app.id, 'accept')}
            disabled={processingId === app.id}
          >
            {processingId === app.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('common.accept')}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => handleAction(app.id, 'reject')}
            disabled={processingId === app.id}
          >
            <Text style={styles.btnText}>{t('common.reject')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusBadge, app.status === 'ACCEPTED' ? styles.statusAccepted : styles.statusRejected]}>
          <Text style={styles.statusText}>{app.status}</Text>
        </View>
      )}
    </View>
  );

  const renderLoadItem = ({ item }: { item: LoadWithApplications }) => {
    // Only show loads that have applications
    if (!item.applications || item.applications.length === 0) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.routeText}>
              {item.originCity} <Ionicons name="arrow-forward" size={16} /> {item.destinationCity}
            </Text>
            <Text style={styles.idText}>ID: {item.displayId || item.id.slice(-6)}</Text>
          </View>
          <Text style={styles.cargoText}>{item.cargoType} • {item.weight}kg</Text>
        </View>

        <View style={styles.applicationsList}>
          {item.applications.map(renderApplication)}
        </View>
      </View>
    );
  };

  const hasAnyApplications = loads.some(l => l.applications && l.applications.length > 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasAnyApplications && (
        <Text style={styles.activeCounter}>
          {loads.filter(l => l.applications?.length > 0).length} {t('load.loads')}
        </Text>
      )}
      {!hasAnyApplications ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>{t('load.noLoads')}</Text>
          <Text style={styles.emptyText}>{t('load.checkBackLater')}</Text>
        </View>
      ) : (
        <FlatList
          data={loads}
          renderItem={renderLoadItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12, marginBottom: 12 },
  routeText: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  idText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  cargoText: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  applicationsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  applicationItem: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  appUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  appRole: { fontSize: 13, color: '#6b7280', textTransform: 'capitalize' },
  appRating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, gap: 4 },
  appRatingText: { fontSize: 12, fontWeight: 'bold', color: '#d97706' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusAccepted: { backgroundColor: '#d1fae5' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
  activeCounter: { fontSize: 14, fontWeight: '600', color: '#6b7280', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
});
