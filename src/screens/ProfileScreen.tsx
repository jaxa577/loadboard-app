import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/users/profile', {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
      });

      await updateUser(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#2563eb" />
        </View>
        <Text style={styles.role}>{user.role?.toUpperCase()}</Text>
        {user.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.rating}>{user.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Profile Form */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              disabled={loading}
            >
              <Ionicons name="create-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            editable={isEditing && !loading}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            editable={isEditing && !loading}
            keyboardType="phone-pad"
            placeholder="Enter your phone"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            editable={isEditing && !loading}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
        </View>

        {isEditing && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Language Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <LanguageSwitcher />
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (navigation as any).navigate('Verification')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Verification</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (navigation as any).navigate('LoadHistory')}
        >
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.actionText}>History</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (navigation as any).navigate('Ratings')}
        >
          <Ionicons name="star-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Ratings</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  role: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonCancelText: {
    color: '#666',
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  buttonSave: {
    backgroundColor: '#2563eb',
  },
  buttonSaveText: {
    color: '#fff',
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#dc2626',
  },
});
