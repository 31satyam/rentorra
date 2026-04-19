import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import propertyService from '@services/propertyService';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Property } from '../../types/index';
import { LandlordStackParamList } from '../../types/navigation';
import { API_URL } from '@constants/config';

type PropertyDetailScreenNavigationProp = NativeStackNavigationProp<
  LandlordStackParamList,
  'PropertyDetail'
>;

const PropertyDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<PropertyDetailScreenNavigationProp>();
  const { propertyId } = route.params as { propertyId: number };

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperty();
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(propertyId);
              Alert.alert('Success', 'Property deleted', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  if (loading || !property) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
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
        <Text style={styles.title}>{property.title}</Text>

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

        <Text style={styles.city}>{property.city}</Text>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailBox}>
            <Icon name="bed-outline" size={24} color="#34C759" />
            <Text style={styles.detailLabel}>Bedrooms</Text>
            <Text style={styles.detailValue}>{property.bedrooms || 'N/A'}</Text>
          </View>

          <View style={styles.detailBox}>
            <Icon name="water-outline" size={24} color="#34C759" />
            <Text style={styles.detailLabel}>Bathrooms</Text>
            <Text style={styles.detailValue}>{property.bathrooms || 'N/A'}</Text>
          </View>

          <View style={styles.detailBox}>
            <Icon name="square-outline" size={24} color="#34C759" />
            <Text style={styles.detailLabel}>Area</Text>
            <Text style={styles.detailValue}>{property.area_sqft || 'N/A'} sqft</Text>
          </View>

          <View style={styles.detailBox}>
            <Icon name="home-outline" size={24} color="#34C759" />
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProperty', { propertyId })}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit Property</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Icon name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Property</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
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
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  city: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 20,
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
  actionButtons: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PropertyDetailScreen;