import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from '../../utils/TextFix';

import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onHide: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onHide, onAccept }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.mainTitle}>Resumen Ejecutivo - TutorMatch</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qué es TutorMatch</Text>
              <Text style={styles.sectionText}>
                TutorMatch conecta estudiantes de UPC con tutores calificados. Al usar nuestra plataforma, 
                aceptas estos términos de uso.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Registro de Usuarios</Text>
              <Text style={styles.sectionText}>
                • Debes ser estudiante de UPC{"\n"}
                • Proporciona información veraz{"\n"}
                • Mantén tu cuenta segura{"\n"}
                • Si eres menor de edad, necesitas autorización de tus padres
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Membresía de Tutores</Text>
              <Text style={styles.sectionText}>
                • Los tutores pagan una membresía única para acceder a la plataforma{"\n"}
                • Pago solo por Yape o Plin{"\n"}
                • Reembolso en 1-2 horas si hay errores en el pago{"\n"}
                • Un administrador revisa y aprueba cada membresía
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios y Pagos</Text>
              <Text style={styles.sectionText}>
                • TutorMatch solo conecta tutores y estudiantes{"\n"}
                • Los acuerdos de pago son directamente entre tutor y estudiante{"\n"}
                • No procesamos pagos de tutorías{"\n"}
                • Los tutores definen sus horarios y tarifas
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reglas de Conducta</Text>
              <Text style={styles.sectionText}>
                • Comportamiento respetuoso y profesional{"\n"}
                • No actividades ilegales o fraudulentas{"\n"}
                • No acoso ni discriminación{"\n"}
                • No contenido inapropiado
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Responsabilidades</Text>
              <Text style={styles.sectionText}>
                • TutorMatch no garantiza resultados académicos{"\n"}
                • No somos responsables de transacciones entre usuarios{"\n"}
                • Los tutores son responsables de la calidad de sus clases{"\n"}
                • Protegemos tus datos según nuestra política de privacidad
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comunicación</Text>
              <Text style={styles.sectionText}>
                Facilitamos el contacto inicial. Después pueden comunicarse por email o WhatsApp 
                de manera profesional.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cambios y Terminación</Text>
              <Text style={styles.sectionText}>
                • Podemos actualizar estos términos (te avisaremos){"\n"}
                • Puedes cancelar tu cuenta cuando quieras{"\n"}
                • Podemos suspender cuentas que violen las reglas{"\n"}
                • Rigen las leyes de Perú
              </Text>
            </View>
          </ScrollView>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Al aceptar, confirmas que entiendes estos términos. Tiempo estimado de lectura: 2-3 minutos.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onHide}
            >
              <Ionicons name="close" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxHeight: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionText: {
    color: '#9ca3af',
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 4,
    margin: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#9ca3af',
    flex: 1,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
});

export default TermsModal;