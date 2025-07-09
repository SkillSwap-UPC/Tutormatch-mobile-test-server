import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { Text } from '../../../utils/TextFix';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RootStackParamList } from '../../../App';
import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from '../../../config/env';
import NavbarAuth from '../../components/NavbarAuth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  // Initialize Supabase client
  const supabase = createClient(
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // En React Native, necesitamos recibir el token de recuperación como parámetro
    // Este token lo obtendrías normalmente al hacer deep linking desde el email
    // Para este ejemplo, asumimos que el token viene como parámetro de ruta
    const params = route.params as any;
    const resetToken = params?.token;
    
    if (!resetToken) {
      Alert.alert(
        "Error",
        "No se encontró un token de recuperación válido",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } else {
      setToken(resetToken);
    }
  }, [route, navigation]);

  const handleSubmit = async () => {
    // Validar contraseñas
    if (password !== confirmPassword) {
      Alert.alert(
        "Error",
        "Las contraseñas no coinciden"
      );
      return;
    }
    
    if (password.length < 6) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }
    
    setLoading(true);
    
    try {
      // Para recuperación de contraseña, necesitamos utilizar el método apropiado
      // Esto puede variar según cómo esté configurado tu backend con Supabase
      if (!token) {
        throw new Error("Token de recuperación no encontrado");
      }
      
      const { error } = await supabase.auth.api.updateUser(token, {
        password: password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      Alert.alert(
        "Éxito",
        "Tu contraseña ha sido actualizada exitosamente",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
      
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo actualizar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <NavbarAuth />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={50} color="#F05C5C" />
            </View>
            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>
              Crea una nueva contraseña para tu cuenta
            </Text>
          </View>

          <View style={styles.cardContent}>
            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón para enviar */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buttonText}>Actualizando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Restablecer contraseña</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Volver al inicio de sesión</Text>
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
    padding: 16,
    backgroundColor: 'rgba(240, 92, 92, 0.1)',
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 6,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  button: {
    backgroundColor: '#F05C5C',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    alignItems: 'center',
  },
  link: {
    color: '#F05C5C',
    fontSize: 14,
    fontWeight: '500',
  },
});