import LoadingOverlay from '@components/common/LoadingOverlay';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import propertyService from '@services/propertyService';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LandlordStackParamList } from '../../types/navigation';
import { Platform } from "react-native";

type EditPropertyScreenNavigationProp = NativeStackNavigationProp<
  LandlordStackParamList,
  'EditProperty'
>;

const EditPropertyScreen: React.FC = () => {
  const navigation = useNavigation<EditPropertyScreenNavigationProp>();
  const route = useRoute();
  const { propertyId } = route.params as { propertyId: number };
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent_amount: '',
    deposit_amount: '',
    address: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    property_type: '',
  });

  useEffect(() => {
    loadProperty();
  }, []);

  const loadProperty = async () => {
    try {
      const property = await propertyService.getPropertyById(propertyId);
      setFormData({
        title: property.title || '',
        description: property.description || '',
        rent_amount: property.rent_amount?.toString() || '',
        deposit_amount: property.deposit_amount?.toString() || '',
        address: property.address || '',
        city: property.city || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area_sqft: property.area_sqft?.toString() || '',
        property_type: property.property_type || '',
      });
      setExistingImages(property.images?.map(img => img.image_url) || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load property');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.rent_amount || !formData.address || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Update property details
      await propertyService.updateProperty(propertyId, {
        title: formData.title,
        description: formData.description,
        rent_amount: parseFloat(formData.rent_amount),
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
        address: formData.address,
        city: formData.city,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : undefined,
        property_type: formData.property_type,
      });

      // Upload new images if any
      if (images.length > 0) {
        const imageFormData = new FormData();

        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          if (Platform.OS === "web") {
            // ✅ WEB: convert URI → Blob
            const response = await fetch(image);
            const blob = await response.blob();

            imageFormData.append("files", blob, `image_${i}.jpg`);
          } else {
            // ✅ MOBILE (Android/iOS)
            imageFormData.append("files", {
              uri: image.startsWith("file://") ? image : `file://${image}`,
              name: `image_${i}.jpg`,
              type: "image/jpeg",
            } as any);
          }
        }

        // Debug
        imageFormData.forEach((value, key) => {
          console.log("KEY:", key, "VALUE:", value);
        });

        await propertyService.uploadPropertyImages(propertyId, imageFormData);
      }

      if (Platform.OS === 'web') {
        window.alert('Property updated successfully');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Success', 'Property updated successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to update property');
      } else {
        Alert.alert('Error', 'Failed to update property');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Current Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {existingImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />a
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Icon name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* New Images */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Add New Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeNewImage(index)}
                >
                  <Icon name="close-circle" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Icon name="camera-outline" size={40} color="#999" />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Rent Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                value={formData.rent_amount}
                onChangeText={(text) => setFormData({ ...formData, rent_amount: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Deposit (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.deposit_amount}
                onChangeText={(text) => setFormData({ ...formData, deposit_amount: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput
                style={styles.input}
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput
                style={styles.input}
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Area (sq.ft.)</Text>
              <TextInput
                style={styles.input}
                value={formData.area_sqft}
                onChangeText={(text) => setFormData({ ...formData, area_sqft: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Property Type</Text>
              <TextInput
                style={styles.input}
                value={formData.property_type}
                onChangeText={(text) => setFormData({ ...formData, property_type: text })}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Property</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoadingOverlay visible={submitting} message="Updating property..." />
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
  imageSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditPropertyScreen;