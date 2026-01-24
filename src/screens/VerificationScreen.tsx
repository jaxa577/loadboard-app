import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

interface DocumentUpload {
  uri: string;
  type: 'license-front' | 'license-back' | 'selfie';
  uploaded: boolean;
}

export default function VerificationScreen() {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos of your documents.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (type: 'license-front' | 'license-back' | 'selfie') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to provide the image',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(type),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => chooseFromGallery(type),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async (type: 'license-front' | 'license-back' | 'selfie') => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addDocument(result.assets[0].uri, type);
    }
  };

  const chooseFromGallery = async (type: 'license-front' | 'license-back' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addDocument(result.assets[0].uri, type);
    }
  };

  const addDocument = (uri: string, type: 'license-front' | 'license-back' | 'selfie') => {
    setDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.type !== type);
      return [...filtered, { uri, type, uploaded: false }];
    });
  };

  const removeDocument = (type: 'license-front' | 'license-back' | 'selfie') => {
    setDocuments((prev) => prev.filter((doc) => doc.type !== type));
  };

  const getDocumentByType = (type: 'license-front' | 'license-back' | 'selfie') => {
    return documents.find((doc) => doc.type === type);
  };

  const submitVerification = async () => {
    if (documents.length < 3) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would upload the images to the server
      // For now, we'll just simulate the upload
      const formData = new FormData();

      documents.forEach((doc) => {
        formData.append(doc.type, {
          uri: doc.uri,
          type: 'image/jpeg',
          name: `${doc.type}.jpg`,
        } as any);
      });

      // await api.post('/users/verification', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });

      setVerificationStatus('pending');
      Alert.alert(
        'Verification Submitted',
        'Your documents have been submitted for verification. We will review them and get back to you within 24-48 hours.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentSection = (
    title: string,
    description: string,
    type: 'license-front' | 'license-back' | 'selfie',
    iconName: any
  ) => {
    const document = getDocumentByType(type);

    return (
      <View style={styles.documentSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name={iconName} size={24} color="#2563eb" />
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionDescription}>{description}</Text>
          </View>
        </View>

        {document ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: document.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeDocument(type)}
            >
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage(type)}
          >
            <Ionicons name="camera-outline" size={32} color="#2563eb" />
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      {verificationStatus && (
        <View
          style={[
            styles.statusBanner,
            verificationStatus === 'pending' && styles.statusPending,
            verificationStatus === 'verified' && styles.statusVerified,
            verificationStatus === 'rejected' && styles.statusRejected,
          ]}
        >
          <Ionicons
            name={
              verificationStatus === 'pending'
                ? 'time'
                : verificationStatus === 'verified'
                ? 'checkmark-circle'
                : 'close-circle'
            }
            size={24}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {verificationStatus === 'pending' && 'Verification Pending'}
            {verificationStatus === 'verified' && 'Verified'}
            {verificationStatus === 'rejected' && 'Verification Rejected'}
          </Text>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#2563eb" />
        <Text style={styles.infoText}>
          To ensure safety and trust, please upload clear photos of your driver's license
          and a selfie for verification. All information is kept secure and confidential.
        </Text>
      </View>

      {/* Document Upload Sections */}
      {renderDocumentSection(
        'Driver License (Front)',
        'Clear photo of the front side',
        'license-front',
        'card-outline'
      )}

      {renderDocumentSection(
        'Driver License (Back)',
        'Clear photo of the back side',
        'license-back',
        'card-outline'
      )}

      {renderDocumentSection(
        'Selfie with License',
        'Hold your license next to your face',
        'selfie',
        'person-outline'
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (documents.length < 3 || loading) && styles.submitButtonDisabled,
        ]}
        onPress={submitVerification}
        disabled={documents.length < 3 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Requirements */}
      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.requirementText}>Photos must be clear and not blurry</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.requirementText}>All text must be readable</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.requirementText}>License must be valid and not expired</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.requirementText}>Selfie must clearly show your face</Text>
        </View>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  statusVerified: {
    backgroundColor: '#10b981',
  },
  statusRejected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  documentSection: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginVertical: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  requirementsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
  },
});
