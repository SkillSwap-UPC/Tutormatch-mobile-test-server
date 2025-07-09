import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Text } from '../../../utils/TextFix';

import BottomNavbar from '@/src/dashboard/components/BottomNavbar';
import Sidebar from '@/src/dashboard/components/SideBar';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Navbar from '../../../dashboard/components/Navbar';
import DeleteAccountModal from '../../../user/components/DeleteProfileModal';
import EditProfileModal from '../../../user/components/EditProfileModal';
import LogoutModal from '../../../user/components/LogOutProfileModal';
import { UserService } from '../../../user/services/UserService';
import { User as UserType } from '../../../user/types/User';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/authService';

// Definición del tipo para los parámetros de la ruta
type RouteParams = {
  Profile: {
    userId?: string;
  };
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isLogOutModalVisible, setLogOutModalVisible] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [logoutAccount, setLogoutAccount] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const navigation = useNavigation<StackNavigationProp<any>>();
  const { signOut, user: authUser } = useAuth();
  const route = useRoute<RouteProp<RouteParams, 'Profile'>>();
  const userId = route.params?.userId;

  // Obtener los datos del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Si hay un userId en los parámetros, estamos viendo el perfil de otro usuario
        if (userId) {
          // Verificar si el usuario que estamos viendo es el usuario actual
          const currentUserId = await AuthService.getCurrentUserId();
          setIsCurrentUser(userId === currentUserId);

          // Obtener los datos del usuario por ID
          const userData = await UserService.getUserById(userId);
          setUser(userData);
          return;
        }

        // Si no hay userId, estamos viendo nuestro propio perfil
        setIsCurrentUser(true);

        // Primero intentamos obtener el usuario del hook useAuth
        if (authUser) {
          setUser(authUser);
          setLoading(false);
          return;
        }

        // Si no está en el hook, intentamos obtenerlo desde AuthService
        const currentUserId = await AuthService.getCurrentUserId();
        if (!currentUserId) {
          // Si no hay ID de usuario, redirigir al login
          Alert.alert(
            'Error',
            'Sesión no encontrada. Por favor inicia sesión.'
          );
          navigation.navigate('Login');
          return;
        }

        // Obtener el perfil completo desde AuthService
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          setUser(userProfile);
        } else {
          // Como último recurso, intentar obtener desde el UserService
          const userData = await UserService.getUserById(currentUserId);
          setUser(userData);
        }
      } catch (error: any) {
        console.error('Error al obtener datos del usuario:', error);
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Error al cargar los datos del perfil'
        );
        // Si falla la obtención de datos, redirigir al login
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, navigation, userId]);

  const handleSaveProfile = async (updatedUser: UserType) => {
    try {
      if (!user) {
        throw new Error('No hay usuario para actualizar');
      }

      // Actualizar el perfil del usuario
      await UserService.updateProfile(updatedUser);
      setUser(updatedUser);

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al actualizar perfil'
      );
    }
  };

  const handleLogout = async () => {
    setLogoutAccount(true);
    try {
      const { success } = await signOut();
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Error al cerrar sesión');
    } finally {
      setLogoutAccount(false);
      setLogOutModalVisible(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      // Eliminar la cuenta del usuario
      await UserService.deleteAccount(user.id);

      // Cerrar sesión después de eliminar la cuenta
      await signOut();

      Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente');

      // Redirigir al inicio después de un breve retraso
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 2000);
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al eliminar la cuenta'
      );
    } finally {
      setDeletingAccount(false);
      setDeleteModalVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F05C5C" />
          <Text style={styles.loadingText}>Cargando datos del perfil...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontró información del usuario</Text>
        </View>
      </View>
    );
  }

  // Formatear la fecha de creación
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Fecha desconocida';

    try {
      const date = typeof dateString === 'string'
        ? new Date(dateString)
        : dateString;

      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear el número de teléfono
  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <View style={styles.container}>
      <Navbar />

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileCard}>
          {/* Botón de editar - solo visible para el usuario actual */}
          {isCurrentUser && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Encabezado del perfil */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarPlaceholder}>
                  {user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U'}
                </Text>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userMemberSince}>
                Miembro desde {formatDate(user.createdAt)}
              </Text>
              <Text style={styles.userRole}>
                {user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.semesterNumber}° Semestre
              </Text>
              <Text style={styles.userAcademicYear}>{user.academicYear}</Text>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="white" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Acerca de mí</Text>
            </View>
            <Text style={styles.bioText}>
              {user.bio || 'Sin biografía disponible.'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="white" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Contacto</Text>
            </View>
            {user.phone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/51${user.phone ? user.phone.replace(/\s/g, '') : ''}`)}
              >
                <Text style={styles.phoneText}>
                  +51 {formatPhone(user.phone)}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.bioText}>
                No hay número de teléfono disponible.
              </Text>
            )}
          </View>

          {/* Opciones de perfil - solo visibles para el usuario actual */}
          {isCurrentUser && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setLogOutModalVisible(true)}
              >
                <Ionicons name="log-out" size={18} color="white" style={styles.buttonIcon} />
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setDeleteModalVisible(true)}
              >
                <Ionicons name="trash" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavbar onToggleSidebar={toggleSidebar} />

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Modales - solo se renderizan para el usuario actual */}
      {isCurrentUser && (
        <>
          <EditProfileModal
            visible={isEditModalVisible}
            onHide={() => setEditModalVisible(false)}
            user={user}
            onSave={handleSaveProfile}
          />

          <DeleteAccountModal
            visible={isDeleteModalVisible}
            onHide={() => setDeleteModalVisible(false)}
            onConfirm={handleDeleteAccount}
            loading={deletingAccount}
          />

          <LogoutModal
            visible={isLogOutModalVisible}
            onHide={() => setLogOutModalVisible(false)}
            onConfirm={handleLogout}
            loading={logoutAccount}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
  },
  profileCard: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    maxWidth: 600,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#404040',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    zIndex: 1,
  },
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F05C5C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9ca3af',
    marginBottom: 4,
  },
  userMemberSince: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#F05C5C',
    marginBottom: 2,
  },
  userAcademicYear: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  bioText: {
    color: '#9ca3af',
    lineHeight: 20,
  },
  phoneText: {
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#F05C5C',
    padding: 10,
    borderRadius: 8,
  },
  supportButton: {
    backgroundColor: '#d93548',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  supportButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ProfilePage;