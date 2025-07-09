import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text } from '../../../utils/TextFix';

import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../../../App';
import NavbarAuth from '../../components/NavbarAuth';

export default function RegisterSuccessPage() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <NavbarAuth />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.title}>¡Registro Completado!</Text>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.message}>
              ¡Felicidades! Tu cuenta ha sido verificada y activada correctamente. Ahora puedes iniciar sesión y comenzar a utilizar todos los servicios de la plataforma.
            </Text>
            <Text style={styles.smallText}>
              Si tienes algún problema para iniciar sesión, ponte en contacto con soporte.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.button}
              onPress={goToLogin}
            >
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#121212',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  smallText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#F05C5C',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});