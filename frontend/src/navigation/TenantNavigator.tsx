import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { TenantStackParamList } from '../types/navigation';

import HomeScreen from '@screens/tenant/HomeScreen';
import InquiriesScreen from '@screens/tenant/InquiriesScreen';
import ProfileScreen from '@screens/tenant/ProfileScreen';
import PropertyDetailScreen from '@screens/tenant/PropertyDetailScreen';
import WishlistScreen from '@screens/tenant/WishlistScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<TenantStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Available Properties' }}
    />
    <Stack.Screen 
      name="PropertyDetail" 
      component={PropertyDetailScreen} 
      options={{ title: 'Property Details' }}
    />
  </Stack.Navigator>
);

const TenantNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wishlist') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Inquiries') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ title: 'Saved' }}
      />
      <Tab.Screen 
        name="Inquiries" 
        component={InquiriesScreen} 
        options={{ title: 'Inquiries' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default TenantNavigator;