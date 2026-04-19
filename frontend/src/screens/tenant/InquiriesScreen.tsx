import propertyService from '@/services/propertyService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Inquiry } from '../../types/index';

const InquiriesScreen: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      // You'll need to add this method to propertyService
      // const data = await propertyService.getMyInquiries();
      // setInquiries(data);
      const data = await propertyService.getMyInquiries();
      setInquiries(data); // Placeholder
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInquiries();
  };

  const renderInquiry = ({ item }: { item: Inquiry }) => (
    <View style={styles.inquiryCard}>
      <View style={styles.inquiryHeader}>
        <Text style={styles.propertyId}>Property #{item.property_id}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      {item.reply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Landlord Reply:</Text>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={inquiries}
        renderItem={renderInquiry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No inquiries yet</Text>
            <Text style={styles.emptySubtitle}>
              When you contact landlords, your inquiries will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
    gap: 12,
  },
  inquiryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  propertyId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 40,
  },
    replyBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e6f9ed',
    borderRadius: 8,
  },

  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },

  replyText: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
  },
});

export default InquiriesScreen;