import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { API_URL } from '../../config/env';

// Tipo para compatibilidad con React Native
export type ImageInfo = {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
};

export const TutoringImageService = {
  /**
   * Sube una imagen para una tutoría al servicio de almacenamiento
   * @param tutoringId ID de la tutoría
   * @param imageInfo Información de la imagen a subir (compatible con React Native)
   * @returns URL de la imagen subida
   */
  uploadTutoringImage: async (tutoringId: string, imageInfo: ImageInfo): Promise<string> => {
    try {
      console.log('Iniciando subida de imagen para tutoría:', tutoringId);
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
      
      // Crear nombre de archivo único para la nueva imagen
      const fileExtension = imageInfo.uri.split('.').pop() || 'jpg';
      const uniqueFileName = `tutoring-${tutoringId}-${new Date().getTime()}.${fileExtension}`;
      
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
      
      formData.append('tutoringId', tutoringId);
      formData.append('fileName', uniqueFileName);
      
      console.log('FormData creado con tutoringId:', tutoringId);
      console.log('FormData creado con fileName:', uniqueFileName);
      
      // Subir la nueva imagen
      console.log('Enviando solicitud a:', `${API_URL}/storage/tutoring-images`);
      
      const uploadResponse = await axios.post(
        `${API_URL}/storage/tutoring-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 60000, // 60 segundos
        }
      );
      
      console.log('Respuesta de subida del servidor:', uploadResponse.data);
      
      // Obtener la URL de la nueva imagen
      const urlResponse = await axios.get(
        `${API_URL}/storage/tutoring-images/${tutoringId}/${uniqueFileName}`
      );
      
      console.log('Respuesta del endpoint getImageUrl:', urlResponse.data);
      
      if (urlResponse.data && urlResponse.data.url) {
        return urlResponse.data.url;
      }
      
      throw new Error('No se pudo obtener la URL de la imagen');
    } catch (error: any) {
      console.error('Error al subir imagen de tutoría:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.data?.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      }
      
      // En caso de error, usar una URL por defecto
      const placeholderUrl = `https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=`;
      console.log('Usando URL por defecto debido al error de subida');
      return placeholderUrl;
    }
  },
  
  /**
   * Elimina una imagen de tutoría del almacenamiento
   * @param tutoringId ID de la tutoría
   * @param fileName Nombre del archivo a eliminar
   * @returns Verdadero si se eliminó correctamente
   */
  deleteTutoringImage: async (tutoringId: string, fileName: string): Promise<boolean> => {
    try {
      console.log('Eliminando imagen:', fileName, 'para tutoría:', tutoringId);
      const response = await axios.delete(
        `${API_URL}/storage/tutoring-images/${tutoringId}/${fileName}`
      );
      
      console.log('Respuesta de eliminación:', response.data);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error al eliminar imagen de tutoría:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      return false;
    }
  },
  
  /**
   * Función auxiliar para extraer el nombre del archivo de una URL
   * @param url URL de la imagen
   * @returns Nombre del archivo
   */
  getFileNameFromUrl: (url: string): string => {
    // Extraer el nombre del archivo de la URL
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  }
};