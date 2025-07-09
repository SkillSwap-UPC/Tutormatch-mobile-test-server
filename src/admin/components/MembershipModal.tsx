import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';


interface Props {
  modalOpen: boolean;
  modalImage: string | null;
  setModalOpen: (open: boolean) => void;
}

export default function MembershipModal({ modalOpen, modalImage, setModalOpen }: Props) {
  return (
    <Modal
      visible={modalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setModalOpen(false)}
    >
      <MembershipModalContent modalImage={modalImage} setModalOpen={setModalOpen} />
    </Modal>
  );
}

function MembershipModalContent({ modalImage, setModalOpen }: { modalImage: string | null; setModalOpen: (open: boolean) => void }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="image" size={20} color="#fff" />
            <Text style={styles.title}>Comprobante de Pago</Text>
          </View>
          <TouchableOpacity onPress={() => setModalOpen(false)}>
            <Feather name="x" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {modalImage ? (
            <Image
              source={{ uri: modalImage }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.errorContainer}>
              <Feather name="alert-triangle" size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
              <Text style={styles.errorText}>No se pudo cargar la imagen</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setModalOpen(false)}>
          <Feather name="x" size={18} color="#fff" />
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: 20,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
