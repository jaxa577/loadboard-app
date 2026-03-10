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
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DRIVER' as 'DRIVER' | 'BROKER' | 'SHIPPER', // Default to Driver
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error') || 'Error', t('auth.nameRequired') || 'Please enter your name');
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert(t('common.error') || 'Error', t('auth.phoneRequired') || 'Please enter your phone number');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert(t('common.error') || 'Error', t('auth.invalidEmail') || 'Please enter a valid email address');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      Alert.alert(t('common.error') || 'Error', t('auth.minCharacters') || 'Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('common.error') || 'Error', t('auth.passwordsNotMatch') || 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        role: formData.role, // Use selected role instead of hardcoding 'driver'
      };

      await api.post('/auth/register', registerData);

      Alert.alert(
        t('common.success') || 'Success',
        t('auth.registrationSuccess') || 'Registration successful! Please login with your credentials.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('auth.registrationFailed') || 'Registration failed. Please try again.';
      Alert.alert(t('common.error') || 'Registration Failed', errorMessage);
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
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.joinAs') || 'Join as a Driver, Broker, or Shipper'}</Text>

          <View style={styles.roleSelector}>
            {(['DRIVER', 'BROKER', 'SHIPPER'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  formData.role === role && styles.roleOptionSelected,
                ]}
                onPress={() => updateField('role', role)}
              >
                <Text
                  style={[
                    styles.roleText,
                    formData.role === role && styles.roleTextSelected,
                  ]}
                >
                  {t(`roles.${role.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t('auth.name')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('profile.enterName') || "e.g. John Doe"}
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={styles.label}>{t('auth.phone')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="+1234567890"
              placeholderTextColor="#9ca3af"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <Text style={styles.label}>{t('auth.email')} ({t('common.optional') || 'Optional'})</Text>
            <TextInput
              style={styles.input}
              placeholder={t('profile.enterEmail') || "you@example.com"}
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Text style={styles.label}>{t('auth.password')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.minCharacters') || "Min 6 characters"}
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>{t('auth.confirmPassword') || 'Password (Confirm)'} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.repeatPassword') || "Repeat password"}
              placeholderTextColor="#9ca3af"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.register')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                {t('auth.alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleOptionSelected: {
    backgroundColor: '#2563eb',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleTextSelected: {
    color: '#fff',
  },
});
