import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import Navbar from '../../dashboard/components/Navbar';
import { useAuth } from '../../public/hooks/useAuth';
import { Text } from '../../utils/TextFix';

// Tipos de solicitud de soporte
const supportTypes = [
  { label: 'Problema técnico', value: 'technical' },
  { label: 'Consulta sobre tutoría', value: 'tutoring' },
  { label: 'Reclamo o queja', value: 'complaint' },
  { label: 'Sugerencia', value: 'suggestion' },
  { label: 'Otro', value: 'other' }
];

// Correo de soporte
const SUPPORT_EMAIL = "rlopezhuaman321@gmail.com";

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    supportType: null as { label: string, value: string } | null,
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSupportTypeDropdown, setShowSupportTypeDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        name: fullName,
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupportTypeSelect = (item: { label: string, value: string }) => {
    setFormData(prev => ({ ...prev, supportType: item }));
    setShowSupportTypeDropdown(false);
  };

  // Función para abrir el cliente de correo del usuario
  const openMailClient = () => {
    const supportTypeText = formData.supportType?.label || 'No especificado';

    const subject = encodeURIComponent(`Soporte TutorMatch: ${formData.subject}`);
    const body = encodeURIComponent(`
Nombre: ${formData.name}
Correo: ${formData.email}
Tipo de consulta: ${supportTypeText}

${formData.message}

--
Enviado desde la aplicación móvil de TutorMatch
    `);

    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            "Error",
            "No se encontró una aplicación de correo disponible en tu dispositivo."
          );
        }
      })
      .catch(error => {
        Alert.alert(
          "Error",
          "Ocurrió un problema al abrir tu cliente de correo."
        );
        console.error("Error al abrir el correo:", error);
      });
  };

  const validateForm = () => {
    if (!formData.subject) {
      Alert.alert("Error", "Por favor ingresa un asunto para tu consulta");
      return false;
    }
    
    if (!formData.supportType) {
      Alert.alert("Error", "Por favor selecciona un tipo de consulta");
      return false;
    }
    
    if (!formData.message) {
      Alert.alert("Error", "Por favor escribe un mensaje detallando tu consulta");
      return false;
    }
    
    return true;
  };

  const handleSendEmail = () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    // Simular tiempo de envío
    setTimeout(() => {
      openMailClient();
      setSubmitting(false);
      setSuccess(true);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        "Correo preparado",
        "Se ha abierto tu cliente de correo con los datos del formulario.",
        [{ text: "OK" }]
      );
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 2000);
    }, 1000);
  };
  // Si el formulario se envió con éxito
  if (success) {
    return (
      <>
        <Navbar />
        <DashboardLayout>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.successTitle}>¡Solicitud Enviada!</Text>
            <Text style={styles.successMessage}>
              Hemos preparado tu solicitud de soporte. Se ha abierto tu cliente de correo para que puedas enviar el mensaje directamente.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </DashboardLayout>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <DashboardLayout>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Centro de Soporte</Text>
            <Text style={styles.headerSubtitle}>
              Estamos aquí para ayudarte. Completa el formulario a continuación y nuestro equipo te responderá lo antes posible.
            </Text>
          </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={24} color="#F05C5C" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Formulario de Soporte</Text>
              <Text style={styles.cardSubtitle}>
                Cuéntanos en qué podemos ayudarte
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              {/* Nombre - Autocompletado y deshabilitado */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre completo 
                  <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.name}
                  placeholder="Tu nombre"
                  placeholderTextColor="#6B7280"
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              {/* Email - Autocompletado y deshabilitado */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Correo electrónico 
                  <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#6B7280"
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              {/* Asunto */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Asunto <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.subject}
                  onChangeText={(text) => handleChange('subject', text)}
                  placeholder="Asunto de tu consulta"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              {/* Tipo de soporte */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de consulta 
                  <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowSupportTypeDropdown(!showSupportTypeDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {formData.supportType?.label || "Selecciona una opción"}
                  </Text>
                  <Ionicons 
                    name={showSupportTypeDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
                
                {showSupportTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {supportTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={styles.dropdownItem}
                        onPress={() => handleSupportTypeSelect(type)}
                      >
                        <Text style={styles.dropdownItemText}>{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              {/* Mensaje */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mensaje <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.message}
                  onChangeText={(text) => handleChange('message', text)}
                  placeholder="Describe tu problema o consulta en detalle"
                  placeholderTextColor="#6B7280"
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Sección de Libro de Reclamaciones */}
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Ionicons name="alert-circle" size={18} color="#F59E0B" style={styles.alertIcon} />
                <Text style={styles.alertTitle}>Libro de Reclamaciones</Text>
              </View>
              <Text style={styles.alertText}>
                Este formulario también funciona como Libro de Reclamaciones virtual. Si deseas presentar una queja o reclamo formal,
                selecciona "Reclamo o queja" en el tipo de consulta y proporciona todos los detalles necesarios. Tu reclamo será
                procesado de acuerdo a la normativa vigente en un plazo no mayor a 30 días hábiles.
              </Text>
            </View>

            {/* Botones de envío */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendEmail}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="mail" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Usar cliente de correo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Información adicional de contacto */}
        <View style={[styles.card, styles.contactCard]}>
          <Text style={styles.contactTitle}>Otros canales de atención</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Correo electrónico</Text>
              <Text style={styles.contactValue}>rlopezhuaman321@gmail.com</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Horario de atención</Text>
              <Text style={styles.contactValue}>Lunes a Viernes: 9:00 am - 6:00 pm</Text>
            </View>
          </View>        
          </View>
      </ScrollView>
    </DashboardLayout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  iconContainer: {
    backgroundColor: 'rgba(240, 92, 92, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  formContainer: {
    padding: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  formGroup: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#F05C5C',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  disabledInput: {
    opacity: 0.6,
  },
  textArea: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    height: 120,
  },
  dropdown: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dropdownMenu: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    marginTop: 4,
    position: 'absolute',
    width: '100%',
    top: 80,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  alertBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
  },
  alertText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#F05C5C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactCard: {
    marginBottom: 50,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  contactInfo: {
    padding: 16,
  },
  contactItem: {
    marginBottom: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: '#F05C5C',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Estilos para la página de éxito
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default SupportPage;