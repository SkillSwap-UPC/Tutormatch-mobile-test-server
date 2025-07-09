import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from '../../utils/TextFix';

interface LogoutModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ 
  visible, 
  onHide, 
  onConfirm, 
  loading 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="logout" size={24} color="#60A5FA" />
            </View>
            <Text style={styles.modalTitle}>¿Deseas cerrar tu sesión?</Text>
          </View>

          <Text style={styles.modalDescription}>
            Estás a punto de cerrar tu sesión actual. Tendrás que volver a iniciar sesión para acceder a tu cuenta.
          </Text>

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={20} color="#60A5FA" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Por seguridad, cierra siempre tu sesión en dispositivos compartidos.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onHide}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>No</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="check" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.confirmButtonText}>Sí</Text>
                </>
              )}
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
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#1e1f1e',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    padding: 12,
    borderRadius: 25,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  modalDescription: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default LogoutModal;