import propertyService from '@services/propertyService';
import React, { useEffect, useState } from 'react';
import { Modal, TextInput } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Inquiry } from '../../types/index';

const LandlordInquiriesScreen: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const data = await propertyService.getLandlordInquiries();
      setInquiries(data);
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

  const handleSubmitReply = async () => {
  if (!replyText || !selectedInquiryId) return;

  try {
    await propertyService.replyToInquiry(selectedInquiryId, replyText);

    Alert.alert("Success", "Reply sent");
    setModalVisible(false);
    setReplyText('');
    loadInquiries();
  } catch (error) {
    Alert.alert("Error", "Failed to send reply");
  }
};

  const renderInquiry = ({ item }: { item: Inquiry }) => (
    <View style={styles.inquiryCard}>
      <View style={styles.inquiryHeader}>
        <View style={styles.propertyInfo}>
          <Icon name="home-outline" size={16} color="#34C759" />
          <Text style={styles.propertyId}>Property #{item.property_id}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.tenantInfo}>
        <Icon name="person-outline" size={16} color="#666" />
        <Text style={styles.tenantId}>Tenant #{item.tenant_id}</Text>
      </View>
      
      <Text style={styles.message}>{item.message}</Text>
      
      {item.reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Your Reply:</Text>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => {
            setSelectedInquiryId(item.id);
            setModalVisible(true);
          }}
        >
          <Text style={styles.replyButtonText}>Reply to Inquiry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
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
              When tenants contact you about your properties, they will appear here
            </Text>
          </View>
        }
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reply to Inquiry</Text>

            <TextInput
              style={styles.input}
              placeholder="Type your reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => {
                  setModalVisible(false);
                  setReplyText('');
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#34C759' }]}
                onPress={handleSubmitReply}
              >
                <Text style={{ color: '#fff' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  propertyId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  tenantId: {
    fontSize: 14,
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  replyButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContainer: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  minHeight: 80,
  textAlignVertical: 'top',
},

modalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
},

modalButton: {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginHorizontal: 5,
},
});

export default LandlordInquiriesScreen;