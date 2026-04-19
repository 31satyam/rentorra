import LoadingOverlay from '@components/common/LoadingOverlay';
import { useAuth } from '@context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import propertyService from '@services/propertyService';
import React, { useEffect, useState } from 'react';
import { API_URL } from '@constants/config';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Property } from '../../types/index';
import { TenantStackParamList } from '../../types/navigation';

type PropertyDetailScreenNavigationProp = NativeStackNavigationProp<
  TenantStackParamList,
  'PropertyDetail'
>;

const PropertyDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<PropertyDetailScreenNavigationProp>();
  const { propertyId } = route.params as { propertyId: number };
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    loadProperty();
    checkWishlist();
  }, []);

  const loadProperty = async () => {
    try {
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      Alert.alert('Error', 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const wishlist = await propertyService.getWishlist();
      setIsInWishlist(wishlist.some(item => item.id === propertyId));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await propertyService.removeFromWishlist(propertyId);
        setIsInWishlist(false);
        Alert.alert('Success', 'Removed from wishlist');
      } else {
        await propertyService.addToWishlist(propertyId);
        setIsInWishlist(true);
        Alert.alert('Success', 'Added to wishlist');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setSendingInquiry(true);
    try {
      await propertyService.createInquiry({
        property_id: propertyId,
        message: inquiryMessage,
      });
      setInquiryModal(false);
      setInquiryMessage('');
      Alert.alert('Success', 'Inquiry sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading || !property) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Image Gallery */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {property.images && property.images.length > 0 ? (
            property.images.map((image, index) => (
              <Image
                source={{
                  uri: property.images?.[0]
                    ? `${API_URL}${property.images[0].image_url}`
                    : "https://via.placeholder.com/300",
                }}
                style={{ width: 100, height: 100 }}
              />
            ))
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/400x300?text=No+Image' }}
              style={styles.image}
            />
          )}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{property.title}</Text>
            <TouchableOpacity onPress={handleToggleWishlist}>
              <Icon
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={28}
                color={isInWishlist ? '#ff3b30' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{property.rent_amount.toLocaleString()}</Text>
            <Text style={styles.perMonth}>/month</Text>
          </View>

          {property.deposit_amount && (
            <Text style={styles.deposit}>
              Deposit: ₹{property.deposit_amount.toLocaleString()}
            </Text>
          )}

          <View style={styles.locationContainer}>
            <Icon name="location-outline" size={20} color="#666" />
            <Text style={styles.location}>{property.address}</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Icon name="bed-outline" size={24} color="#007AFF" />
              <Text style={styles.detailLabel}>Bedrooms</Text>
              <Text style={styles.detailValue}>{property.bedrooms || 'N/A'}</Text>
            </View>

            <View style={styles.detailBox}>
              <Icon name="water-outline" size={24} color="#007AFF" />
              <Text style={styles.detailLabel}>Bathrooms</Text>
              <Text style={styles.detailValue}>{property.bathrooms || 'N/A'}</Text>
            </View>

            <View style={styles.detailBox}>
              <Icon name="square-outline" size={24} color="#007AFF" />
              <Text style={styles.detailLabel}>Area</Text>
              <Text style={styles.detailValue}>{property.area_sqft || 'N/A'} sqft</Text>
            </View>

            <View style={styles.detailBox}>
              <Icon name="home-outline" size={24} color="#007AFF" />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{property.property_type || 'N/A'}</Text>
            </View>
          </View>

          {/* Description */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Inquire Button */}
          <TouchableOpacity
            style={styles.inquireButton}
            onPress={() => setInquiryModal(true)}
          >
            <Text style={styles.inquireButtonText}>Contact Landlord</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Inquiry Modal */}
      <Modal
        visible={inquiryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInquiryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Inquiry</Text>
              <TouchableOpacity onPress={() => setInquiryModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Write your message here..."
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.sendButton, sendingInquiry && styles.sendButtonDisabled]}
              onPress={handleSendInquiry}
              disabled={sendingInquiry}
            >
              <Text style={styles.sendButtonText}>
                {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={sendingInquiry} message="Sending inquiry..." />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perMonth: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  deposit: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  detailBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  inquireButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  inquireButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PropertyDetailScreen;