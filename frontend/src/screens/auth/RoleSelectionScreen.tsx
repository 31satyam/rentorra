import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'RoleSelection'
>;

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Rentorra</Text>
          <Text style={styles.subtitle}>Find your perfect rental home</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.tenantButton]}
            onPress={() => navigation.navigate('Login', { role: 'tenant' })}
            activeOpacity={0.8}
          >
            <Icon name="person-outline" size={24} color="#fff" style={styles.buttonIcon} />
            <View>
              <Text style={styles.buttonTitle}>I'm a Tenant</Text>
              <Text style={styles.buttonSubtitle}>Looking for a rental</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.landlordButton]}
            onPress={() => navigation.navigate('Login', { role: 'landlord' })}
            activeOpacity={0.8}
          >
            <Icon name="business-outline" size={24} color="#fff" style={styles.buttonIcon} />
            <View>
              <Text style={styles.buttonTitle}>I'm a Landlord</Text>
              <Text style={styles.buttonSubtitle}>Want to list my property</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Rentorra?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register', { role: 'tenant' })}
          >
            <Text style={styles.signupText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenantButton: {
    backgroundColor: '#007AFF',
  },
  landlordButton: {
    backgroundColor: '#34C759',
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  signupText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;