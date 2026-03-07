import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function PostLoadScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    originCountry: 'Russia',
    originCity: '',
    destinationCountry: 'Russia',
    destinationCity: '',
    cargoType: '',
    weight: '',
    truckType: 'TENT', // Default to TENT based on Prisma enum
    paymentType: 'CASH', // Default based on Prisma enum
    loadingDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    price: '',
    currency: 'RUB',
    trucksCount: '',
    contactPhone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.originCity.trim() || !formData.destinationCity.trim()) {
      Alert.alert('Error', 'Origin and destination cities are required');
      return false;
    }
    if (!formData.cargoType.trim()) {
      Alert.alert('Error', 'Cargo type is required');
      return false;
    }
    if (!formData.weight.trim() || isNaN(Number(formData.weight))) {
      Alert.alert('Error', 'Valid weight is required');
      return false;
    }
    return true;
  };

  const handlePostLoad = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        weight: Number(formData.weight),
        price: formData.price ? Number(formData.price) : undefined,
        trucksCount: formData.trucksCount ? Number(formData.trucksCount) : undefined,
        loadingDate: new Date(formData.loadingDate).toISOString(),
      };

      await api.post('/loads', payload);

      Alert.alert('Success', 'Load posted successfully!', [{ text: 'OK' }]);
      // Reset form
      setFormData({
        ...formData,
        originCity: '',
        destinationCity: '',
        cargoType: '',
        price: '',
        trucksCount: '',
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to post load.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Origin</Text>
          <Text style={styles.label}>Origin Country</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Russia"
            placeholderTextColor="#9ca3af"
            value={formData.originCountry}
            onChangeText={(text) => updateField('originCountry', text)}
          />
          <Text style={styles.label}>Origin City *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Moscow"
            placeholderTextColor="#9ca3af"
            value={formData.originCity}
            onChangeText={(text) => updateField('originCity', text)}
          />

          <Text style={styles.sectionTitle}>Destination</Text>
          <Text style={styles.label}>Destination Country</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Russia"
            placeholderTextColor="#9ca3af"
            value={formData.destinationCountry}
            onChangeText={(text) => updateField('destinationCountry', text)}
          />
          <Text style={styles.label}>Destination City *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. St. Petersburg"
            placeholderTextColor="#9ca3af"
            value={formData.destinationCity}
            onChangeText={(text) => updateField('destinationCity', text)}
          />

          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <Text style={styles.label}>Cargo Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Steel, Electronics"
            placeholderTextColor="#9ca3af"
            value={formData.cargoType}
            onChangeText={(text) => updateField('cargoType', text)}
          />
          <Text style={styles.label}>Weight (tons) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 20"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(text) => updateField('weight', text)}
          />

          <Text style={styles.label}>Trucks Needed (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.trucksCount}
            onChangeText={(text) => updateField('trucksCount', text)}
          />

          <Text style={styles.label}>Truck Type (TENT, REFRIGERATOR, etc.)</Text>
          <View style={styles.pickerSubstitute}>
            {['TENT', 'REFRIGERATOR', 'CONTAINER'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  formData.truckType === type && styles.chipSelected,
                ]}
                onPress={() => updateField('truckType', type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.truckType === type && styles.chipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Payment & Schedule</Text>
          
          <Text style={styles.label}>Price & Currency (Optional)</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex2]}
              placeholder="e.g. 150000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => updateField('price', text)}
            />
            <View style={styles.currencySelector}>
              {['RUB', 'USD', 'EUR', 'KZT'].map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyChip,
                    formData.currency === curr && styles.currencyChipSelected,
                  ]}
                  onPress={() => updateField('currency', curr)}
                >
                  <Text
                    style={[
                      styles.currencyChipText,
                      formData.currency === curr && styles.currencyChipTextSelected,
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Loading Date (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={formData.loadingDate}
            onChangeText={(text) => updateField('loadingDate', text)}
          />

          <Text style={styles.sectionTitle}>Contact Info</Text>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +7 999 123 45 67"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={formData.contactPhone}
            onChangeText={(text) => updateField('contactPhone', text)}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePostLoad}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Post Load</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 12, marginBottom: 8 },
  label: { fontSize: 14, color: '#4b5563', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  flex2: { flex: 2, marginBottom: 0 },
  currencySelector: { flex: 3, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', alignItems: 'center' },
  currencyChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db' },
  currencyChipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  currencyChipText: { color: '#4b5563', fontWeight: '500', fontSize: 12 },
  currencyChipTextSelected: { color: '#fff' },
  pickerSubstitute: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db' },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#4b5563', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
