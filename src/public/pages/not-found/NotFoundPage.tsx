import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text } from '../../../utils/TextFix';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../../App';

const NotFoundPage: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.title}>Página no encontrada</Text>
        <Text style={styles.message}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#F05C5C', // Equivalente a text-red-500
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF', // Equivalente a text-gray-400
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F05C5C', // Basado en tu color primary
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotFoundPage;