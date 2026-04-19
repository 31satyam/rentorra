import { useAuth } from '@context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import AuthNavigator from './AuthNavigator';
import LandlordNavigator from './LandlordNavigator';
import TenantNavigator from './TenantNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userRole, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔵 AppNavigator - userRole:', userRole, 'isLoading:', isLoading);
  }, [userRole, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  console.log('🟢 AppNavigator - Rendering with role:', userRole);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userRole ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userRole === 'tenant' ? (
          <Stack.Screen name="Tenant" component={TenantNavigator} />
        ) : (
          <Stack.Screen name="Landlord" component={LandlordNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;