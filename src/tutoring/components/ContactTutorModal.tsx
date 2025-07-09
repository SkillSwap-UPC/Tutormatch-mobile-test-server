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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onHide}
    >
      <TouchableWithoutFeedback onPress={onHide}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header con gradiente visual */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.headerIconContainer}>
                    <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Contactar tutor</Text>
                    <Text style={styles.headerSubtitle}>Inicia una conversación</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              {/* Información del tutor */}
              <View style={styles.tutorInfoCard}>
                <View style={styles.tutorAvatar}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.tutorDetails}>
                  <Text style={styles.tutorName}>{tutor.firstName} {tutor.lastName}</Text>
                  <Text style={styles.tutorLabel}>Tutor especializado</Text>
                </View>
              </View>
              
              {/* Content */}
              <View style={styles.content}>
                <View style={styles.textCenter}>
                  <Text style={styles.title}>¿Cómo deseas contactar a {tutor.firstName}?</Text>
                  <Text style={styles.subtitle}>
                    Selecciona tu método preferido para iniciar la comunicación y resolver tus dudas.
                  </Text>
                </View>

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleEmailContact}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionIconContainer}>
                      <Ionicons name="mail" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionText}>Correo electrónico</Text>
                      <Text style={styles.optionDetail} numberOfLines={1}>
                        {tutor.email}
                      </Text>
                    </View>
                    <View style={styles.optionArrow}>
                      <Ionicons name="chevron-forward" size={16} color="#BFDBFE" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onHide}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#374151',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tutorLabel: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  content: {
    padding: 20,
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDetail: {
    fontSize: 13,
    color: '#BFDBFE',
  },
  optionArrow: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default ContactTutorModal;