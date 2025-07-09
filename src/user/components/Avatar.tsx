import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from '../../utils/TextFix';
import { useAvatar } from '../hooks/avatarContext';
interface AvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    id?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  style?: object;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', style = {} }) => {
  const { avatarUrl } = useAvatar();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Cargar currentUserId desde AsyncStorage
  useEffect(() => {
    const loadCurrentUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('currentUserId');
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error al obtener currentUserId:', error);
      }
    };
    
    loadCurrentUserId();
  }, []);

  // Determinar los estilos de tamaño
  const sizeStyles = {
    sm: {
      container: { width: 32, height: 32 },
      text: { fontSize: 14 }
    },
    md: {
      container: { width: 48, height: 48 },
      text: { fontSize: 16 }
    },
    lg: {
      container: { width: 64, height: 64 },
      text: { fontSize: 24 }
    }
  };
  
  // Usar avatar del contexto si el usuario es el actual o el del usuario pasado como prop
  const avatarToUse = user?.id === currentUserId
    ? avatarUrl || user.avatar
    : user.avatar;
  
  // Obtener la inicial para el fallback
  const initial = user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U';
  
  return (
    <View style={[
      styles.container, 
      sizeStyles[size].container,
      style
    ]}>
      {avatarToUse && !imageError ? (
        <Image
          source={{ uri: avatarToUse }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text style={[styles.initialText, sizeStyles[size].text]}>
          {initial}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100, // Muy grande para asegurar forma circular
    backgroundColor: '#DC2626', // equivalente a bg-red-600
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  initialText: {
    color: 'white',
    fontWeight: '500'
  }
});

export default Avatar;