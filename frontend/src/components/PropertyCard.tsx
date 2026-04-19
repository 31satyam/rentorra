import { Property } from '../types/index';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}
import { API_URL } from '@constants/config';

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const defaultImage = 'https://via.placeholder.com/400x200?text=No+Image';
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0].image_url
    : defaultImage;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{
          uri: property.images?.[0]
            ? `${API_URL}${property.images[0].image_url}`
            : "https://via.placeholder.com/300",
        }}
        style={{ width: 100, height: 100 }}
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        
        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.location} numberOfLines={1}>{property.address}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="bed-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{property.bedrooms || 'N/A'} beds</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{property.bathrooms || 'N/A'} baths</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="square-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{property.area_sqft || 'N/A'} sqft</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{property.rent_amount.toLocaleString()}</Text>
          <Text style={styles.perMonth}>/month</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perMonth: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default PropertyCard;