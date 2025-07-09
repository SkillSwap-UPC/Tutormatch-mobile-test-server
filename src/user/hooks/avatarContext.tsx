import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../../public/services/authService';

interface AvatarContextType {
  avatarUrl: string | null;
  updateAvatarUrl: (newUrl: string | null) => void;
  isLoadingAvatar: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  updateAvatarUrl: () => {},
  isLoadingAvatar: false
});

export const useAvatar = () => useContext(AvatarContext);

export const AvatarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState<boolean>(true);

  // Cargar el avatar al iniciar
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        setIsLoadingAvatar(true);
        const userId = await AuthService.getCurrentUserId();
        
        if (!userId) {
          setAvatarUrl(null);
          return;
        }
        
        const user = await AuthService.getCurrentUserProfile();
        if (user && user.avatar) {
          setAvatarUrl(user.avatar);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Error al cargar avatar:', error);
        setAvatarUrl(null);
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    loadUserAvatar();
  }, []);

  const updateAvatarUrl = async (newUrl: string | null) => {
    setAvatarUrl(newUrl);
    
    // Si hay un usuario actual, actualizamos su perfil en AsyncStorage
    // para mantener coherencia entre sesiones
    const userId = await AuthService.getCurrentUserId();
    if (userId) {
      try {
        const currentUserData = await AsyncStorage.getItem('currentUserProfile');
        if (currentUserData) {
          try {
            const userData = JSON.parse(currentUserData);
            userData.avatar = newUrl;
            await AsyncStorage.setItem('currentUserProfile', JSON.stringify(userData));
          } catch (error) {
            console.error('Error al actualizar avatar en AsyncStorage:', error);
          }
        }
      } catch (error) {
        console.error('Error al acceder a AsyncStorage:', error);
      }
    }
  };

  return (
    <AvatarContext.Provider value={{ avatarUrl, updateAvatarUrl, isLoadingAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};