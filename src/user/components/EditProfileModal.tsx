import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../utils/TextFix';
import { useAvatar } from '../hooks/avatarContext';
import { UserService } from '../services/UserService';
import { User } from '../types/User';

interface EditProfileModalProps {
  visible: boolean;
  onHide: () => void;
  user: User;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onHide,
  user,
  onSave
}) => {
  const [formData, setFormData] = useState<User>(user);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.avatar);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const { updateAvatarUrl } = useAvatar();
  const insets = useSafeAreaInsets();

  // Reiniciar los datos del formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setFormData(user);
      setProfileImage(user.avatar);
    }
  }, [user, visible]);

  const handleInputChange = (name: string, value: string) => {
    if (name === 'phone') {
      // Solo permitir dígitos numéricos (0-9)
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length > 0 && numericValue[0] !== '9') {
        // Si no empieza con 9, forzar que empiece con 9
        const adjustedValue = numericValue.length > 1 ? numericValue.substring(1) : '';
        setFormData({ ...formData, [name]: '9' + adjustedValue });
      } else {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleSave = () => {
    onSave({ ...formData, avatar: profileImage });
    onHide();
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  const handleCancel = () => {
    // Resetear los datos al cancelar
    setFormData(user);
    setProfileImage(user.avatar);
    onHide();
  };

  const handleImageUpload = async () => {
    try {
      // Solicitar permisos primero
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la galería');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Avatar suele ser cuadrado
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      // Obtener el primer activo seleccionado
      const selectedAsset = result.assets[0];

      // Validaciones básicas
      if (selectedAsset.fileSize && selectedAsset.fileSize > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Previsualización inmediata
      setProfileImage(selectedAsset.uri);

      setUploadingImage(true);
      Alert.alert('Subiendo', 'Subiendo imagen al servidor...');

      // Crear objeto de información de imagen compatible
      const imageInfo = {
        uri: selectedAsset.uri,
        type: `image/${selectedAsset.uri.split('.').pop() || 'jpeg'}`,
        name: selectedAsset.uri.split('/').pop() || 'avatar.jpg',
        size: selectedAsset.fileSize
      };

      // Subir archivo usando el servicio mejorado
      const uploadedUrl = await UserService.uploadAvatar(formData.id, imageInfo);

      // Actualizar con la URL real del servidor
      setProfileImage(uploadedUrl);

      setFormData(prevFormData => ({
        ...prevFormData,
        avatar: uploadedUrl
      }));

      updateAvatarUrl(uploadedUrl);

      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error: any) {
      console.error('Error detallado al subir imagen:', error);

      // Limpiar la previsualización si hay error
      setProfileImage(user.avatar);

      Alert.alert('Error', error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    // Si no hay imagen, no hay nada que eliminar
    if (!profileImage) {
      return;
    }

    try {
      setUploadingImage(true);

      // Mostrar alerta de carga
      Alert.alert('Eliminando', 'Eliminando foto de perfil...');

      // Extraer el nombre del archivo del avatar actual
      let avatarFileName = null;
      try {
        const urlObj = new URL(profileImage);
        const pathParts = urlObj.pathname.split('/');
        // El nombre del archivo suele ser el último segmento de la ruta
        avatarFileName = pathParts[pathParts.length - 1];
      } catch (e) {
        console.warn('No se pudo obtener el nombre del archivo del avatar:', e);
        throw new Error('No se pudo identificar el archivo de avatar para eliminar');
      }
      setProfileImage(undefined);
      setFormData(prevFormData => ({
        ...prevFormData,
        avatar: undefined
      }));

      updateAvatarUrl(null);

      Alert.alert('Éxito', 'Foto de perfil eliminada correctamente');
    } catch (error: any) {
      console.error('Error al eliminar avatar:', error);
      Alert.alert('Error', error.message || 'Error al eliminar la foto de perfil');
    } finally {
      setUploadingImage(false);
    }
  };  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Foto de Perfil */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Foto de Perfil</Text>
              <View style={styles.profileImageContainer}>
                <View style={styles.avatarContainer}>
                  {uploadingImage && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarPlaceholder}>
                      {formData.firstName?.charAt(0) || formData.lastName?.charAt(0) || 'U'}
                    </Text>
                  )}
                </View>
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImageUpload}
                    disabled={uploadingImage}
                  >
                    <Ionicons name="camera" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.uploadButtonText}>
                      {uploadingImage ? 'Subiendo...' : 'Cambiar foto'}
                    </Text>
                  </TouchableOpacity>
                  {profileImage && (
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      disabled={uploadingImage}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Eliminar foto</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  style={styles.input}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  style={styles.input}
                  placeholder="Ingresa tu apellido"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Año Académico</Text>
                <TextInput
                  value={formData.academicYear}
                  onChangeText={(value) => handleInputChange('academicYear', value)}
                  style={styles.input}
                  placeholder="Ej: 2024"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Teléfono
                  <Text style={styles.labelHint}> (Solo números, formato peruano)</Text>
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  style={styles.input}
                  placeholder="999999999"
                  placeholderTextColor="#6B7280"
                  maxLength={9}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>
                  Debe empezar con 9 y contener 9 dígitos
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Biografía</Text>
                <TextInput
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Cuéntanos un poco sobre ti..."
                  placeholderTextColor="#6B7280"
                />              
                </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={uploadingImage}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={uploadingImage}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#252525',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F05C5C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4a4a4a',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageActions: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#F05C5C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    alignItems: 'center',
    padding: 8,
  },
  removeButtonText: {
    color: '#F05C5C',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  labelHint: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '400',
  },  input: {
    backgroundColor: '#1e1e1e',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#4a4a4a',
    backgroundColor: '#252525',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F05C5C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileModal;