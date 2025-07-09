import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Text } from '../../utils/TextFix';

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../public/hooks/useAuth';
import { AuthService } from '../../public/services/authService';
import { UserService } from '../../user/services/UserService';
import { User as UserType } from '../../user/types/User';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  type RootStackParamList = {
    Dashboard: undefined;
    Login: undefined;
    Profile: undefined;
  };
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { signOut, user: authUser } = useAuth();

  // Obtener los datos del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);

        // Primero intentamos obtener el usuario del hook useAuth
        if (authUser) {
          setCurrentUser(authUser);
          setError(null);
          setLoading(false);
          return;
        }

        // Verificar si hay una sesión activa
        if (!await AuthService.hasActiveSession()) {
          setError('Sesión no encontrada');
          setLoading(false);
          return;
        }

        // Obtener el ID del usuario actual
        const currentUserId = await AuthService.getCurrentUserId();

        // Obtener el perfil completo desde AuthService
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          setCurrentUser(userProfile);
          setError(null);
        } else {
          // Como último recurso, intentar obtener desde el UserService
          try {
            if (currentUserId) {
              const userData = await UserService.getUserById(currentUserId);
              setCurrentUser(userData);
              setError(null);
            }
          } catch (serviceError) {
            console.error('Error al obtener usuario desde UserService:', serviceError);
            setError('Error al cargar los datos del usuario');
          }
        }
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();  }, [authUser]);
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.logoContainer}>
              <TouchableOpacity 
                style={styles.logoLink}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <View style={styles.logoWrapper}>
                  <Image 
                    source={require('../../assets/imgs/TutorMatch.png')} 
                    style={styles.logo} 
                  />
                </View>
                <Text style={styles.logoText}>TutorMatch</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#F05C5C" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.logoContainer}>
              <TouchableOpacity 
                style={styles.logoLink}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <View style={styles.logoWrapper}>
                  <Image 
                    source={require('../../assets/imgs/TutorMatch.png')} 
                    style={styles.logo} 
                  />
                </View>
                <Text style={styles.logoText}>TutorMatch</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navContainer}>
        <View style={styles.innerContainer}>
          {/* Logo centrado */}
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={styles.logoLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('../../assets/imgs/TutorMatch.png')} 
                  style={styles.logo} 
                />
              </View>
              <Text style={styles.logoText}>TutorMatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2C2C2C',
  },
  navContainer: {
    backgroundColor: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
    zIndex: 1000,
    // Posición fija en la parte superior para móviles
    position: 'relative',
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56, // Altura mínima para touch targets en móviles
    maxHeight: 72, // Altura máxima para evitar que sea demasiado alto
  },  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Para centrar mejor el logo
    justifyContent: 'center',
  },
  logoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // Área de toque más grande
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoWrapper: {
    height: 28, // Reducido para móviles
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  logo: {
    height: 22, // Reducido para móviles
    width: 22,
  },
  logoText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16, // Reducido para móviles
    marginLeft: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
  errorText: {
    color: '#F05C5C',
  },
  loginButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '500',
  }
});

export default Navbar;