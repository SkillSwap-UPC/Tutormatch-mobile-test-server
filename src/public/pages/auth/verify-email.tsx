import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text } from '../../../utils/TextFix';

import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { RootStackParamList } from '../../../App';
import { API_URL } from '../../../config/env';
import { supabase } from "../../../lib/supabase/client";
import NavbarAuth from "../../components/NavbarAuth";
import { useAuth } from "../../hooks/useAuth";

interface PendingRegistration {
  email: string;
  userData: {
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    gender: string;
    semesterNumber: number;
    academicYear: string;
    bio: string;
    phone: string;
    status: string;
    avatar: string;
    [key: string]: any;
  };
}

export default function VerifyEmailPage() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [registering, setRegistering] = useState(true);
  const { signUp, verifyEmail } = useAuth();

  // Obtener parámetros de la ruta o desde un deeplink
  useEffect(() => {
    const getRouteParams = async () => {
      try {
        // Intentar obtener parámetros de la ruta
        const params = route.params as any;
        const emailParam = params?.email;
        const verifiedParam = params?.verified;
        const hasToken = params?.token;

        // Si encontramos el correo en los parámetros
        if (emailParam) {
          setEmail(emailParam);
          
          // Si está verificado o tiene token
          if (verifiedParam === 'true' || hasToken) {
            // Guardar en AsyncStorage para persistencia
            await AsyncStorage.setItem('email_verified', emailParam);
            
            setIsVerified(true);
            showAlert('Correo verificado', '¡Tu correo electrónico ha sido verificado con éxito!');
            
            setRegistering(false);
            setRegistrationComplete(true);
            
            // Procesar token si existe
            if (hasToken) {
              processVerificationToken(params.token);
            }
          } else {
            // Verificar si ya fue verificado anteriormente
            try {
              const verifiedEmail = await AsyncStorage.getItem('email_verified');
              if (verifiedEmail === emailParam) {
                setIsVerified(true);
                setRegistering(false);
                setRegistrationComplete(true);
              } else {
                // Verificar si hay un registro pendiente
                const pendingRegistrationStr = await AsyncStorage.getItem('pendingRegistration');
                if (pendingRegistrationStr) {
                  try {
                    const pendingRegistration = JSON.parse(pendingRegistrationStr);
                    if (pendingRegistration.email === emailParam && !registrationComplete) {
                      completeRegistration(pendingRegistration);
                    }
                  } catch (error) {
                    console.error("Error al procesar el registro pendiente:", error);
                    setRegistering(false);
                  }
                } else {
                  setRegistering(false);
                }
              }
            } catch (error) {
              console.error("Error al leer AsyncStorage:", error);
              setRegistering(false);
            }
          }
        } else {
          setRegistering(false);
        }
      } catch (error) {
        console.error('Error al procesar parámetros:', error);
        setRegistering(false);
      }
    };

    // También verificar enlaces profundos que podrían contener parámetros de verificación
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('verify-email')) {
        try {
          const urlObj = new URL(url);
          const emailParam = urlObj.searchParams.get('email');
          const verifiedParam = urlObj.searchParams.get('verified');
          const token = urlObj.searchParams.get('token');
          
          if (emailParam) {
            setEmail(emailParam);
            
            if (verifiedParam === 'true' || token) {
              await AsyncStorage.setItem('email_verified', emailParam);
              setIsVerified(true);
              showAlert('Correo verificado', '¡Tu correo electrónico ha sido verificado con éxito!');
              setRegistering(false);
              setRegistrationComplete(true);
              
              if (token) {
                processVerificationToken(token);
              }
            }
          }
        } catch (error) {
          console.error('Error al procesar deep link:', error);
        }
      }
    };

    // Configurar listener para deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Verificar si la app fue abierta por un deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      } else {
        getRouteParams();
      }
    }).catch(err => {
      console.error('Error al obtener URL inicial:', err);
      getRouteParams();
    });

    return () => {
      subscription.remove();
    };
  }, [route.params]);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const processVerificationToken = async (token: string) => {
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { token });
    } catch (error) {
      console.error("Error al procesar el token de verificación:", error);
    }
  };

  const completeRegistration = async (pendingRegistration: PendingRegistration) => {
    setLoading(true);
    
    try {
      const { email, userData } = pendingRegistration;
    
      if (!userData.password) {
        throw new Error('Falta la contraseña en los datos de registro');
      }
      
      const { success, message } = await signUp(email, userData.password, userData);
      
      if (success) {
        setRegistrationComplete(true);
        await AsyncStorage.removeItem('pendingRegistration');
        
        showAlert('Registro enviado', 'Se ha enviado un correo de verificación a tu dirección de correo.');
      } else {
        showAlert('Error de registro', message);
        setTimeout(() => navigation.navigate('Register'), 3000);
      }
    } catch (error: any) {
      showAlert('Error de registro', error.message || 'Ha ocurrido un error al completar el registro.');
    } finally {
      setLoading(false);
      setRegistering(false);
    }
  };
  
  const handleVerificationComplete = async () => {
    if (!email) {
      showAlert('Error', 'No se pudo determinar el correo a verificar');
      return;
    }
  
    setChecking(true);
    
    try {
      // Verificar primero si el correo ya está marcado como verificado en AsyncStorage
      const verifiedEmail = await AsyncStorage.getItem('email_verified');
      if (verifiedEmail === email) {
        showAlert('Verificación exitosa', 'Tu correo electrónico ya está verificado. Redirigiendo...');
        
        setTimeout(() => {
          navigation.navigate('RegisterSuccess');
        }, 2000);
        return;
      }
  
      // Usamos la función de verificación de email de useAuth
      const { success, message, isVerified } = await verifyEmail(email);
      
      if (success && isVerified) {
        await AsyncStorage.setItem('email_verified', email);
        
        showAlert('Verificación exitosa', 'Tu correo electrónico ha sido verificado. Redirigiendo...');
        
        setTimeout(() => {
          navigation.navigate('RegisterSuccess');
        }, 2000);
      } else if (success && !isVerified) {
        showAlert('Correo no verificado', 'Por favor, verifica tu correo antes de continuar.');
      } else {
        showAlert('Error', message || 'Error al verificar el correo');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Error al verificar el correo');
    } finally {
      setChecking(false);
    }
  };
  
  // Función para reenviar correo de verificación
  const resendVerificationEmail = async () => {
    if (!email) {
      showAlert('Error', 'No se pudo determinar el correo para reenviar la verificación');
      return;
    }

    setLoading(true);
    
    try {
      // Obtener la URL base para el deeplink de la app
      const prefix = await Linking.getInitialURL() || 'tutormatch://';
      const redirectUrl = `${prefix}verify-email?email=${encodeURIComponent(email)}&verified=true`;
      
      // Intentamos usar la API primero para reenviar el correo
      try {
        await axios.post(`${API_URL}/auth/resend-verification`, { 
          email,
          redirectUrl
        });
        
        showAlert('Correo enviado', 'Se ha reenviado el correo de verificación');
        return;
      } catch (apiError) {
        console.error("Error al reenviar desde API, usando Supabase como fallback:", apiError);
      }
      
      // Fallback a Supabase si la API falla - Compatible con versión 1.35.7
      const { data, error } = await supabase.auth.api.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        throw error;
      }
      
      showAlert('Correo enviado', 'Se ha reenviado un correo para verificar tu cuenta');
    } catch (error: any) {
      showAlert('Error', error.message || 'Error al reenviar correo de verificación');
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
              {isVerified ? (
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              ) : (
                <Ionicons name="mail" size={64} color="#F05C5C" />
              )}
            </View>
            <Text style={styles.title}>
              {isVerified ? "¡Correo Verificado!" : "Verifica tu correo"}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            {registering ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F05C5C" style={styles.spinner} />
                <Text style={styles.loadingText}>Completando el registro...</Text>
              </View>
            ) : (
              <>
                {isVerified ? (
                  <Text style={styles.verifiedMessage}>
                    ¡Tu correo electrónico <Text style={styles.emailHighlight}>{email}</Text> ha sido verificado correctamente! Puedes continuar para acceder a la plataforma.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.message}>
                      {registrationComplete ? 'Hemos enviado un correo de verificación a:' : 'Se enviará un correo de verificación a:'}
                    </Text>
                    <Text style={styles.emailText}>
                      {email || "tu dirección de correo"}
                    </Text>
                    <Text style={styles.instructions}>
                      Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
                    </Text>
                    <Text style={styles.smallText}>
                      Si no encuentras el correo, revisa tu carpeta de spam o solicita un nuevo correo de verificación.
                    </Text>
                  </>
                )}
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            {isVerified ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('RegisterSuccess')}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Ir a la página de éxito</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleVerificationComplete}
                  disabled={checking || loading || registering}
                >
                  {checking ? (
                    <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="white" style={styles.buttonIcon} />
                  )}
                  <Text style={styles.buttonText}>
                    {checking ? "Verificando..." : "He verificado mi correo"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={resendVerificationEmail}
                  disabled={checking || loading || registering}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  ) : (
                    <Ionicons name="mail" size={20} color="white" style={styles.buttonIcon} />
                  )}
                  <Text style={styles.buttonText}>
                    {loading ? "Enviando..." : "Reenviar correo de verificación"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={() => navigation.navigate('Dashboard')}
              disabled={checking || loading}
            >
              <Text style={styles.buttonText}>Volver al inicio</Text>
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
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#121212',
  },
  card: {
    width: '100%',
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
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
  verifiedMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  button: {
    backgroundColor: '#F05C5C',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2D2D2D',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
});