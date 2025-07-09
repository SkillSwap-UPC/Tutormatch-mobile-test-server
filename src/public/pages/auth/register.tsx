import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from "react";
import { Text } from '../../../utils/TextFix';

import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';

import { RootStackParamList } from "../../../App";
import { API_URL } from '../../../config/env';
import { supabase } from '../../../lib/supabase/client';
import { UserRole, UserStatus } from "../../../user/types/User";
import NavbarAuth from "../../components/NavbarAuth";
import TermsModal from "../../components/T&CModal";
import { useAuth } from "../../hooks/useAuth";

// Define el tipo para la navegación
type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function RegisterPage() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { signUp } = useAuth();
  const [emailError, setEmailError] = useState<string>('');

  // Estado del formulario ajustado según el tipo User
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student" as UserRole,
    firstName: "",
    lastName: "",
    gender: "",
    semesterNumber: 1,
    academicYear: "",
    bio: "",
    phone: "",
    tutor_id: "",
    status: "active" as UserStatus,
    avatar: ""
  });

  // Validación de correo UPC
  const validateEmail = (email: string): boolean => {
    const upcEmailRegex = /^[Uu]20([1-9][5-9]|[2-9][0-9])[a-zA-Z0-9]{5}@upc\.edu\.pe$/;
    return upcEmailRegex.test(email);
  };

  const handleTextChange = (name: string, value: string) => {
    // Validación en tiempo real para el campo de email
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setEmailError('El correo debe tener formato U20XXXXXXX@upc.edu.pe');
      } else {
        setEmailError('');
      }
    }

    // Validación específica para el campo telefónico
    if (name === 'phone') {
      if (!/^9\d{0,8}$/.test(value) && value !== '') {
        return; // No actualizar si no cumple con el patrón
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSemesterChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setFormData((prev) => ({ ...prev, semesterNumber: value }));
    }
  };

  const handleSubmitStep1 = () => {
    // Validación básica
    if (!formData.email || !formData.password) {
      Alert.alert(
        'Campos requeridos', 
        'Por favor completa todos los campos obligatorios'
      );
      return;
    }

    // Validación del correo institucional UPC
    if (!validateEmail(formData.email)) {
      Alert.alert(
        'Correo no válido', 
        'Debes usar un correo institucional UPC con formato U20XXXXXXX@upc.edu.pe'
      );
      return;
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 8) {
      Alert.alert(
        'Contraseña insegura',
        'La contraseña debe tener al menos 8 caracteres'
      );
      return;
    }

    setStep(2);
  };

  const handleSubmitStep2 = () => {
    // Validar campos primero
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.gender) {
      Alert.alert(
        'Campos requeridos', 
        'Por favor completa todos los campos obligatorios'
      );
      return;
    }

    // Mostrar el modal de términos y condiciones
    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermsModal(false);
    setLoading(true);

    try {
      // Almacenar los datos en AsyncStorage para el proceso de verificación
      await AsyncStorage.setItem('pendingRegistration', JSON.stringify({
        email: formData.email,
        userData: {
          ...formData,
          semesterNumber: typeof formData.semesterNumber === 'number'
            ? formData.semesterNumber
            : Number(formData.semesterNumber) || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));

      // Preparar datos completos para el registro
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        semesterNumber: Number(formData.semesterNumber), // Asegurarse de que sea número
        role: formData.role,
        // Si el backend espera campos adicionales, agrégalos aquí
      };

      // Añadir más diagnóstico antes de la llamada
      console.log('Intentando registro con correo:', formData.email);
      console.log('URL del endpoint:', `${API_URL}/auth/register`);

      try {
        // Llamada al endpoint de registro con datos completos
        const { success, message } = await signUp(
          formData.email,
          formData.password,
          userData
        );

        if (success) {
          Alert.alert(
            'Registro iniciado',
            'Tu cuenta está siendo creada. Por favor, verifica tu correo electrónico.'
          );

          // Redirigir a la página de verificación
          setTimeout(() => {
            navigation.navigate('Login');
          }, 1500);
        } else {
          throw new Error(message || "Error al registrar usuario");
        }
      } catch (signUpError: any) {
        console.error('Error específico en signUp:', signUpError);
        
        // Intentar registro directo con Supabase como respaldo
        try {
          console.log('Intentando registro directo con Supabase...');
          
          const { error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password
          });
          
          if (signUpError) {
            console.error('Error en registro directo con Supabase:', signUpError);
            throw new Error(signUpError.message || "Error al registrar usuario");
          }
          
          // Intentar crear el perfil directamente en la tabla profiles
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: (await supabase.auth.session())?.user?.id,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                role: formData.role,
                phone: formData.phone,
                gender: formData.gender,
                semester_number: formData.semesterNumber,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'active'
              });
              
            if (profileError) {
              console.warn('Error al crear perfil, pero el usuario fue registrado:', profileError);
            }
          } catch (profileInsertError) {
            console.warn('Error al intentar crear perfil:', profileInsertError);
          }
          
          Alert.alert(
            'Registro directo exitoso',
            'Tu cuenta ha sido creada. Por favor, verifica tu correo electrónico.'
          );
          
          // Redirigir a la página de login
          setTimeout(() => {
            navigation.navigate('Login');
          }, 1500);
          
          return;
        } catch (supabaseError: any) {
          console.error('Error en el método alternativo de registro:', supabaseError);
          throw supabaseError;
        }
      }
    } catch (error: any) {
      // Mejor diagnóstico de los errores
      let errorMessage = 'No se pudo completar el registro. Por favor, intenta nuevamente.';
      
      if (error.response) {
        // Error con respuesta del servidor
        console.error('Error del servidor:', {
          status: error.response.status,
          data: error.response.data
        });
        
        if (error.response.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join('. ');
          } else {
            errorMessage = error.response.data.message;
          }
        }
      } else if (error.message) {
        // Error con mensaje específico
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error de registro',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
  };

  // Opciones para género
  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
    { label: 'Otro', value: 'other' },
    { label: 'Prefiero no decir', value: 'preferredNotSay' }
  ];

  return (
    <View style={styles.container}>
      <NavbarAuth />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Crear una cuenta</Text>
            <Text style={styles.cardSubtitle}>
              {step === 1
                ? "Ingresa tus datos básicos para comenzar"
                : "Completa tu perfil para finalizar el registro"
              }
            </Text>
            {step === 2 && <Text style={styles.stepText}>Paso 2 de 2</Text>}
          </View>

          {/* Card Content */}
          {step === 1 ? (
            <View style={styles.formContainer}>
              {/* Formulario Paso 1 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  placeholder="U20XXXXXXX@upc.edu.pe"
                  value={formData.email}
                  onChangeText={(text) => handleTextChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null
                  ]}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="••••••••"
                    value={formData.password}
                    onChangeText={(text) => handleTextChange('password', text)}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.labelCenter}>Tipo de cuenta</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[
                      styles.radioOption,
                      formData.role === 'student' && styles.radioSelected
                    ]}
                    onPress={() => handleRoleChange('student')}
                  >
                    <View style={styles.radioCircle}>
                      {formData.role === 'student' && (
                        <View style={styles.radioFill} />
                      )}
                    </View>
                    <Text style={styles.radioText}>Estudiante</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.radioOption,
                      formData.role === 'tutor' && styles.radioSelected
                    ]}
                    onPress={() => handleRoleChange('tutor')}
                  >
                    <View style={styles.radioCircle}>
                      {formData.role === 'tutor' && (
                        <View style={styles.radioFill} />
                      )}
                    </View>
                    <Text style={styles.radioText}>Tutor</Text>
                  </TouchableOpacity>
                </View>
                
                {formData.role === 'tutor' && (
                  <Text style={styles.infoText}>
                    Para ser tutor, necesitarás seleccionar un plan después del registro
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmitStep1}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              {/* Formulario Paso 2 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChangeText={(text) => handleTextChange('firstName', text)}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChangeText={(text) => handleTextChange('lastName', text)}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  placeholder="987654321"
                  value={formData.phone}
                  onChangeText={(text) => handleTextChange('phone', text)}
                  keyboardType="numeric"
                  maxLength={9}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Género</Text>
                <View style={styles.pickerContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        formData.gender === option.value && styles.genderSelected
                      ]}
                      onPress={() => handleTextChange('gender', option.value)}
                    >
                      <Text style={[
                        styles.genderText,
                        formData.gender === option.value && styles.genderTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Semestre (1-10)</Text>
                <View style={styles.semesterContainer}>
                  <TouchableOpacity
                    style={styles.semesterButton}
                    onPress={() => handleSemesterChange(formData.semesterNumber - 1)}
                    disabled={formData.semesterNumber <= 1}
                  >
                    <Icon name="minus" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <Text style={styles.semesterValue}>
                    {formData.semesterNumber}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.semesterButton}
                    onPress={() => handleSemesterChange(formData.semesterNumber + 1)}
                    disabled={formData.semesterNumber >= 10}
                  >
                    <Icon name="plus" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={goBack}
                  disabled={loading}
                >
                  <Text style={styles.backButtonText}>Atrás</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmitStep2}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Completar Registro</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              ¿Ya tienes una cuenta?{" "}
              <Text 
                style={styles.footerLink}
                onPress={() => navigation.navigate('Login')}
              >
                Inicia sesión aquí
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Terms Modal */}
      <TermsModal
        visible={showTermsModal}
        onHide={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F0F0',
  },
  cardSubtitle: {
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#F0F0F0',
    marginBottom: 8,
    fontWeight: '500',
  },
  labelCenter: {
    color: '#F0F0F0',
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 12,
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioSelected: {
    // Estilos adicionales si es necesario
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d93548',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d93548',
  },
  radioText: {
    color: '#F0F0F0',
  },
  infoText: {
    color: '#FBBF24',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#d93548',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  genderOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  genderSelected: {
    borderColor: '#d93548',
    backgroundColor: 'rgba(246, 92, 92, 0.1)',
  },
  genderText: {
    color: '#9CA3AF',
  },
  genderTextSelected: {
    color: '#d93548',
  },
  semesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  semesterButton: {
    backgroundColor: '#d93548',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterValue: {
    color: '#F0F0F0',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#F0F0F0',
  },
  cardFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#F0F0F0',
    textAlign: 'center',
  },
  footerLink: {
    color: '#d93548',
    fontWeight: '500',
  },
});