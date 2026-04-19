import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandlordStackParamList } from '../types/navigation';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import AddPropertyScreen from '@screens/landlord/AddPropertyScreen';
import DashboardScreen from '@screens/landlord/DashboardScreen';
import EditPropertyScreen from '@screens/landlord/EditPropertyScreen';
import InquiriesScreen from '@screens/landlord/InquiriesScreen';
import ProfileScreen from '@screens/landlord/ProfileScreen';
import PropertyDetailScreen from '@screens/landlord/PropertyDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<LandlordStackParamList>();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ title: 'My Properties' }}
    />
    <Stack.Screen 
      name="AddProperty" 
      component={AddPropertyScreen} 
      options={{ title: 'Add Property' }}
    />
    <Stack.Screen 
      name="EditProperty" 
      component={EditPropertyScreen} 
      options={{ title: 'Edit Property' }}
    />
    <Stack.Screen 
      name="PropertyDetail" 
      component={PropertyDetailScreen} 
      options={{ title: 'Property Details' }}
    />
  </Stack.Navigator>
);

const LandlordNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Inquiries') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack} 
        options={{ title: 'Dashboard' }}
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

export default LandlordNavigator;