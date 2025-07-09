import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { User } from '../../user/types/User';
import { Text } from '../../utils/TextFix';

interface ContactTutorModalProps {
  visible: boolean;
  onHide: () => void;
  tutor: User | undefined;
}

const ContactTutorModal: React.FC<ContactTutorModalProps> = ({
  visible,
  onHide,
  tutor
}) => {
  if (!tutor) return null;

  const handleEmailContact = async () => {
    try {
      const subject = encodeURIComponent('Consulta sobre tutoría');
      const body = encodeURIComponent(`Hola ${tutor.firstName}, me interesa tu tutoría...`);
      const url = `mailto:${tutor.email}?subject=${subject}&body=${body}`;
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        onHide();
      } else {
        alert('No se puede abrir la aplicación de correo electrónico');
      }
    } catch (error) {
      console.error('Error al abrir el correo:', error);
      alert('Ocurrió un error al intentar abrir tu aplicación de correo');
    }
  };

  const handleWhatsAppContact = async () => {
    try {
      // Formato para WhatsApp: asegura que el número no tenga espacios
      const phoneNumber = tutor.phone?.replace(/\s/g, '');
      const message = encodeURIComponent(`Hola ${tutor.firstName}, me interesa tu tutoría que vi en TutorMatch.`);
      const url = `https://wa.me/51${phoneNumber}?text=${message}`;
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        onHide();
      } else {
        alert('No se puede abrir WhatsApp');
      }
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      alert('Ocurrió un error al intentar abrir WhatsApp');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onHide}
    >
      <TouchableWithoutFeedback onPress={onHide}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Contactar con el tutor</Text>
                <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              {/* Content */}
              <View style={styles.content}>
                <View style={styles.textCenter}>
                  <Text style={styles.title}>¿Cómo deseas contactar a {tutor.firstName}?</Text>
                  <Text style={styles.subtitle}>Selecciona una opción para iniciar la comunicación.</Text>
                </View>

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[styles.optionButton, styles.emailButton]}
                    onPress={handleEmailContact}
                  >
                    <Ionicons name="mail" size={32} color="#FFFFFF" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Correo electrónico</Text>
                    <Text style={styles.optionDetail}>{tutor.email}</Text>
                  </TouchableOpacity>

                  {tutor.phone ? (
                    <TouchableOpacity
                      style={[styles.optionButton, styles.whatsappButton]}
                      onPress={handleWhatsAppContact}
                    >
                      <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" style={styles.optionIcon} />
                      <Text style={styles.optionText}>WhatsApp</Text>
                      <Text style={styles.optionDetail}>
                        +51 {tutor.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.optionButton, styles.disabledButton]}>
                      <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" style={styles.optionIcon} />
                      <Text style={styles.optionText}>WhatsApp</Text>
                      <Text style={styles.optionDetail}>No disponible</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onHide}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  optionsContainer: {
    marginVertical: 16,
    gap: 10,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  emailButton: {
    backgroundColor: '#2563EB', // blue-600
  },
  whatsappButton: {
    backgroundColor: '#10B981', // green-600
  },
  disabledButton: {
    backgroundColor: '#4B5563', // gray-600
    opacity: 0.6,
  },
  optionIcon: {
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDetail: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ContactTutorModal;