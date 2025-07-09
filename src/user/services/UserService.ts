import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { API_URL } from '../../config/env';
import { AuthService } from '../../public/services/authService';
import { User } from '../types/User';

// Tipo para compatibilidad con React Native
export type ImagePickerResult = {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
};

export const UserService = {
  // Obtener un usuario por ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get(`${API_URL}/profiles/${userId}`);
      return new User(response.data);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Actualizar el perfil de un usuario
  updateProfile: async (user: User): Promise<User> => {
    try {
      const updateData = {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        semesterNumber: user.semesterNumber,
        academicYear: user.academicYear
      };

      const response = await axios.patch(`${API_URL}/profiles/${user.id}`, updateData);
      return new User(response.data);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  // Eliminar la cuenta de un usuario
  deleteAccount: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/profiles/${userId}`);
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      throw error;
    }
  },

  // Versión adaptada para React Native
  uploadAvatar: async (userId: string, imageInfo: ImagePickerResult): Promise<string> => {
    try {
      console.log('Iniciando subida de avatar para usuario:', userId);
      console.log('Imagen seleccionada:', imageInfo.uri);
      
      // Validar la imagen
      if (!imageInfo || !imageInfo.uri) {
        throw new Error('La imagen está vacía o no fue seleccionada');
      }
      
      // Obtener información de tamaño del archivo si no está disponible
      let fileSize = imageInfo.size;
      if (!fileSize && Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(imageInfo.uri);
        if (fileInfo.exists) {
          fileSize = fileInfo.size;
        }
      }
      
      // Validar tamaño
      if (fileSize && fileSize > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Obtener el usuario actual para verificar si ya tiene un avatar
      const currentUser = await AuthService.getCurrentUserProfile();
      let previousAvatarFileName = null;
  
      // Extraer el nombre del archivo del avatar anterior si existe
      if (currentUser?.avatar) {
        try {
          const avatarUrl = new URL(currentUser.avatar);
          const pathParts = avatarUrl.pathname.split('/');
          // El nombre del archivo suele ser el último segmento de la ruta
          previousAvatarFileName = pathParts[pathParts.length - 1];
          console.log('Avatar anterior encontrado:', previousAvatarFileName);
        } catch (e) {
          console.warn('No se pudo obtener el nombre del archivo del avatar anterior:', e);
        }
      }
  
      // Crear nombre de archivo único para el nuevo avatar
      const fileExtension = imageInfo.uri.split('.').pop() || 'jpg';
      const uniqueFileName = `avatar-${userId}-${new Date().getTime()}.${fileExtension}`;
  
      // Preparar FormData para la subida
      const formData = new FormData();
      
      // En React Native, necesitamos añadir el archivo de forma diferente
      if (Platform.OS === 'web') {
        // Para web, podemos extraer el archivo como Blob
        const response = await fetch(imageInfo.uri);
        const blob = await response.blob();
        formData.append('file', blob, imageInfo.name || uniqueFileName);
      } else {
        // Para dispositivos nativos, usamos la URI directamente
        formData.append('file', {
          uri: imageInfo.uri,
          type: imageInfo.type || `image/${fileExtension}`,
          name: imageInfo.name || uniqueFileName
        } as any);
      }
      
      formData.append('userId', userId);
      formData.append('fileName', uniqueFileName);
  
      console.log('FormData creado con campos userId y fileName');
      
      // Subir el nuevo avatar
      const uploadResponse = await axios.post(
        `${API_URL}/storage/avatars`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 segundos
        }
      );
  
      console.log('Respuesta de subida del servidor:', uploadResponse.data);
  
      // Obtener la URL del nuevo avatar
      const urlResponse = await axios.get(
        `${API_URL}/storage/avatars/${userId}/${uniqueFileName}`
      );
  
      console.log('Respuesta del endpoint getAvatarUrl:', urlResponse.data);
  
      if (urlResponse.data && urlResponse.data.url) {
        const newAvatarUrl = urlResponse.data.url;
  
        // Después de confirmar que el nuevo avatar se subió correctamente,
        // eliminamos el avatar anterior si existe
        if (previousAvatarFileName) {
          try {
            console.log(`Intentando eliminar avatar anterior: ${previousAvatarFileName}`);
            const deleteResponse = await axios.delete(
              `${API_URL}/storage/avatars/${userId}/${previousAvatarFileName}`
            );
            console.log('Resultado de eliminación del avatar anterior:', deleteResponse.data);
          } catch (deleteError) {
            // No interrumpir el flujo si la eliminación falla
            console.warn('Error al eliminar avatar anterior:', deleteError);
          }
        }
  
        // Actualizar el perfil del usuario con la nueva URL
        try {
          if (currentUser) {
            // Creamos una copia del usuario con la nueva URL
            const updatedUser = {
              ...currentUser,
              avatar: newAvatarUrl
            };
            
            // Actualizamos el perfil
            await AuthService.updateProfile(currentUser.id, { avatar: newAvatarUrl });
          }
        } catch (profileError) {
          console.warn('Error al actualizar perfil con nuevo avatar:', profileError);
          // Continuamos aunque falle la actualización del perfil
        }
        
        return newAvatarUrl;
      }
  
      throw new Error('No se pudo obtener la URL del avatar');
    } catch (error: any) {
      console.error('Error completo al subir avatar:', error);
  
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
  
        if (error.response?.data?.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      }
  
      // En caso de error, usar avatar por defecto
      const defaultAvatarUrl = 'https://ui-avatars.com/api/?background=random&name=' + 
        encodeURIComponent(userId.substring(0, 2));
      console.log('Usando avatar por defecto debido al error de subida:', defaultAvatarUrl);
      
      throw new Error(error.message || 'Error al subir la imagen');
    }
  },
  
  // Método auxiliar para seleccionar imágenes
  pickAvatarImage: async (): Promise<ImagePickerResult | null> => {
    try {
      // Esta función depende de expo-image-picker, que debes instalar
      // npm install expo-image-picker
      
      // Si quieres implementarla, aquí tienes un ejemplo:
      /*
      import * as ImagePicker from 'expo-image-picker';
      
      // Solicitar permisos primero
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('Se requieren permisos para acceder a la galería');
        return null;
      }
      
      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Avatar suele ser cuadrado
        quality: 0.8,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      // Obtener el primer activo seleccionado
      const selectedAsset = result.assets[0];
      
      // Crear objeto de información de imagen compatible
      return {
        uri: selectedAsset.uri,
        type: `image/${selectedAsset.uri.split('.').pop() || 'jpeg'}`,
        name: selectedAsset.uri.split('/').pop() || 'avatar.jpg',
        size: selectedAsset.fileSize
      };
      */
      
      // Por ahora, devolvemos null
      console.warn('El método pickAvatarImage no está implementado');
      return null;
    } catch (error) {
      console.error('Error al seleccionar imagen de avatar:', error);
      return null;
    }
  }
};