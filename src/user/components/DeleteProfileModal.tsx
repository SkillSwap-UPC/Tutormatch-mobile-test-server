import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from '../../utils/TextFix';

interface DeleteAccountModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  visible, 
  onHide, 
  onConfirm, 
  loading 
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Eliminar Cuenta</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.warningHeader}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={24} color="#F05C5C" />
              </View>
              <Text style={styles.warningTitle}>¿Eliminar tu cuenta?</Text>
            </View>

            <Text style={styles.paragraphText}>
              Estás a punto de eliminar tu cuenta permanentemente. Esta acción no se puede deshacer 
              y toda tu información será eliminada definitivamente.
            </Text>

            <View style={styles.itemsGrid}>
              <View style={styles.gridItem}>
                <Ionicons name="person" size={18} color="#9CA3AF" style={styles.itemIcon} />
                <Text style={styles.itemText}>Perfil completo</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="book" size={18} color="#9CA3AF" style={styles.itemIcon} />
                <Text style={styles.itemText}>Todas tus tutorías</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="time" size={18} color="#9CA3AF" style={styles.itemIcon} />
                <Text style={styles.itemText}>Historial de actividad</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="card" size={18} color="#9CA3AF" style={styles.itemIcon} />
                <Text style={styles.itemText}>Datos personales</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoBoxContent}>
                <Ionicons name="information-circle" size={18} color="#F05C5C" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  Esta acción es permanente y no se puede deshacer.
                </Text>
              </View>
            </View>

            <Text style={styles.paragraphText}>
              Si estás seguro de que deseas continuar, haz clic en "Eliminar mi cuenta".
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 450,
    backgroundColor: '#252525',
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
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    backgroundColor: '#1e1f1e',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    backgroundColor: 'rgba(240, 92, 92, 0.1)',
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paragraphText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 8,
  },
  itemIcon: {
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoBox: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(240, 92, 92, 0.3)',
    marginBottom: 16,
  },
  infoBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#F05C5C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default DeleteAccountModal;