import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as mime from 'react-native-mime-types';
import { API_URL } from '@/src/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MembershipService = {
  /**
   * Sube un comprobante de pago al backend y retorna la URL
   * @param file Objeto del archivo seleccionado por ImagePicker
   * @returns URL del comprobante subido
   */
  uploadPaymentProof: async (file: any): Promise<string> => {
    // En React Native, se recomienda guardar el userId en AsyncStorage
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId');
    
    if (!file || !file.uri) throw new Error('El archivo no fue seleccionado');
    
    const fileUri = file.uri;
    
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists || fileInfo.size === 0) throw new Error('El archivo está vacío o no fue seleccionado');
    if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) throw new Error('El archivo es demasiado grande. Máximo 5MB.');
    
    // Obtener extensión del archivo
    const fileExtension = fileUri.split('.').pop() || 'jpg';
    const mimeType = mime.lookup(fileUri) || file.mimeType || 'image/jpeg';
    
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'].includes(mimeType)) {
      throw new Error('Tipo de archivo inválido. Solo se permiten imágenes o PDF.');
    }
    
    const uniqueFileName = `paymentproof-${userId}-${Date.now()}.${fileExtension}`;
    
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: file.fileName || uniqueFileName,
      type: mimeType,
    } as any);
    formData.append('user_id', userId);
    formData.append('file_name', uniqueFileName);
    
    // Subir comprobante
    await axios.post(
      `${API_URL}/storage/payment-proofs`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
    );
    
    // Obtener la URL del comprobante
    const urlResponse = await axios.get(
      `${API_URL}/storage/payment-proofs/${userId}/${uniqueFileName}`
    );
    
    if (urlResponse.data && urlResponse.data.url) {
      return urlResponse.data.url;
    }
    
    throw new Error('No se pudo obtener la URL del comprobante');
  },

  /**
   * Crea una membresía en el backend
   * @param type Tipo de membresía ('BASIC' | 'STANDARD' | 'PREMIUM')
   * @param paymentProofUrl URL del comprobante subido
   * @returns Objeto de membresía creada
   */
  createMembership: async (type: 'BASIC' | 'STANDARD' | 'PREMIUM', paymentProofUrl: string) => {
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId');
    
    const body = {
      user_id: userId,
      type,
      status: 'pending',
      payment_proof: paymentProofUrl,
    };
    
    const response = await axios.post(`${API_URL}/memberships`, body);
    return response.data;
  },

  /**
   * Consulta la membresía activa del usuario actual
   */
  getMyMembership: async () => {
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId');
    
    const response = await axios.get(`${API_URL}/memberships/user/${userId}`);
    return response.data;
  }
};