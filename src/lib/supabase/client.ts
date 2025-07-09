import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from '../../config/env';

// Verificar que las constantes estén definidas
if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados en config/env.ts');
}

// Implementación completa y segura para localStorage en React Native
class ReactNativeLocalStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getItem:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setItem:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removeItem:', error);
    }
  }

  // Añadir métodos adicionales que podrían ser utilizados por Supabase
  async clear(): Promise<void> {
    try {
      // Solo limpiamos claves específicas de Supabase para no afectar otras partes de la app
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(key => 
        key.startsWith('sb-') || 
        key.startsWith('supabase.') || 
        key === 'auth_token');
      
      if (supabaseKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseKeys);
      }
    } catch (error) {
      console.error('Error clear:', error);
    }
  }

  async key(index: number): Promise<string | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys[index] || null;
    } catch (error) {
      console.error('Error key:', error);
      return null;
    }
  }
}

// Crear la instancia del localStorage personalizado
const localStorage = new ReactNativeLocalStorage();

// Opciones mejoradas para supabase
const supabaseOptions = {
  localStorage: localStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  fetch: fetch
};

// Crear el cliente con la configuración mejorada
export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL, 
  EXPO_PUBLIC_SUPABASE_ANON_KEY, 
  supabaseOptions
);

export const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Monkeypatching global para evitar problemas con localStorage
if (typeof global !== 'undefined' && !global.localStorage) {
  (global as any).localStorage = localStorage;
}

// Test de conexión
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('Error de conexión con Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error crítico al conectar con Supabase:', error);
    return false;
  }
};

// Ejecutar el test de conexión al inicio
testSupabaseConnection().then(connected => {
  console.log('Estado de conexión inicial con Supabase:', connected ? 'Conectado' : 'Desconectado');
});