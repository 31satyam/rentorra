import { useAuth } from '@context/AuthContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TestScreen = () => {
  const { user, userRole, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Screen Working! 🎉</Text>
      <Text style={styles.text}>Welcome {user?.name}</Text>
      <Text style={styles.text}>Role: {userRole}</Text>
      <Text style={styles.text}>Email: {user?.email}</Text>
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestScreen;