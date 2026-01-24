import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    role: string;
  };
}

export default function RatingsScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchRatings = async () => {
    try {
      if (!user?.id) return;

      const response = await api.get(`/reviews/user/${user.id}`);
      setReviews(response.data);

      // Calculate average rating
      if (response.data.length > 0) {
        const sum = response.data.reduce((acc: number, review: Review) => acc + review.rating, 0);
        setAverageRating(sum / response.data.length);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRatings();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
            color={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Ionicons name="person-circle" size={40} color="#2563eb" />
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.reviewer.name}</Text>
            <Text style={styles.reviewerRole}>{item.reviewer.role}</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.ratingRow}>
        {renderStars(item.rating)}
        <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
      </View>

      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Ratings Yet</Text>
      <Text style={styles.emptyText}>
        Complete deliveries to receive ratings from shippers. Your ratings help
        build trust and get more loads.
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
      {/* Summary Header */}
      {reviews.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating))}
            <Text style={styles.reviewCount}>
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
        </View>
      )}

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
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
  summaryCard: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContent: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewerRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  reviewDate: {
    fontSize: 13,
    color: '#999',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  comment: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
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
