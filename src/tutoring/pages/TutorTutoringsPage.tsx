import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavbar from '../../dashboard/components/BottomNavbar';
import Navbar from '../../dashboard/components/Navbar';
import SideBar from '../../dashboard/components/SideBar';
import { UserService } from '../../user/services/UserService';
import { User } from '../../user/types/User';
import { Text } from '../../utils/TextFix';
import TutoringCard from '../components/TutoringCard';
import { TutoringService } from '../services/TutoringService';
import { TutoringSession } from '../types/Tutoring';

// Definición de los parámetros de la ruta
type RouteParams = {
  TutorTutorings: {
    tutorId: string;
  };
};

const TutorTutoringsPage: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'TutorTutorings'>>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const tutorId = route.params?.tutorId;

  const [tutorings, setTutorings] = useState<TutoringSession[]>([]);
  const [tutor, setTutor] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { width } = Dimensions.get('window');
  const isTablet = width > 768;

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const fetchData = async () => {
    try {
      if (!tutorId) {
        setError('ID del tutor no válido');
        return;
      }

      setLoading(true);
      setError(null);

      // Obtener información del tutor y sus tutorías en paralelo
      const [tutorData, tutoringsData] = await Promise.all([
        UserService.getUserById(tutorId),
        TutoringService.getTutoringSessionsByTutorId(tutorId)
      ]);

      setTutor(tutorData);
      setTutorings(tutoringsData);

    } catch (error: any) {
      console.error('Error al cargar datos del tutor:', error);
      setError('Error al cargar los datos del tutor. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tutorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTutoringClick = (tutoringId: string) => {
    navigation.navigate('TutoringDetails', { tutoringId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleProfilePress = () => {
    if (tutor) {
      navigation.navigate('Profile', { userId: tutor.id });
    }
  };  // Calcular estadísticas del tutor
  const totalTutorings = tutorings.length;
  const activeYear = tutor?.createdAt 
    ? new Date(tutor.createdAt).getFullYear() 
    : new Date().getFullYear();

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={[styles.navbar, { paddingTop: insets.top }]}>
          <Navbar onToggleSidebar={toggleSidebar} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F05C5C" />          
          <Text style={styles.loadingText}>Cargando tutorías del tutor...</Text>
        </View>

        {isTablet && (
          <SideBar visible={sidebarVisible} />
        )}
        {!isTablet && 
        <BottomNavbar onToggleSidebar={toggleSidebar} />}
      </View>
    );
  }

  if (error || !tutor) {
    return (
      <View style={styles.container}>
        <View style={[styles.navbar, { paddingTop: insets.top }]}>
          <Navbar onToggleSidebar={toggleSidebar} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F05C5C" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorText}>
            {error || 'No se pudo encontrar la información del tutor'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>          
            </TouchableOpacity>
        </View>

        {isTablet && 
        (
          <SideBar visible={sidebarVisible} />
        )}
        {!isTablet && <BottomNavbar onToggleSidebar={toggleSidebar} />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <Navbar onToggleSidebar={toggleSidebar} />
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.tutorInfoSection}>
            <View style={styles.tutorImageContainer}>
              {tutor.avatar ? (
                <Image source={{ uri: tutor.avatar }} style={styles.tutorImage} />
              ) : (
                <View style={styles.tutorImagePlaceholder}>
                  <Text style={styles.tutorImageText}>
                    {tutor.firstName?.charAt(0)?.toUpperCase()}
                    {tutor.lastName?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>
                {tutor.firstName} {tutor.lastName}
              </Text>
              <Text style={styles.tutorTitle}>Tutor</Text>
              
              {tutor.email && (
                <View style={styles.contactInfo}>
                  <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.contactText}>{tutor.email}</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={16} color="white" />
                <Text style={styles.profileButtonText}>Ver perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>        
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTutorings}</Text>
            <Text style={styles.statLabel}>Tutorías</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Activo desde {activeYear}</Text>
          </View>
        </View>

        {/* Lista de tutorías */}
        <View style={styles.tutoringsSection}>
          <Text style={styles.sectionTitle}>
            Tutorías disponibles ({totalTutorings})
          </Text>
          
          {tutorings.length > 0 ? (
            <View style={styles.tutoringsGrid}>
              {tutorings.map((tutoring) => (
                <View key={tutoring.id} style={styles.tutoringCardContainer}>
                  <TutoringCard
                    tutoring={tutoring}
                    onClick={handleTutoringClick}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Sin tutorías disponibles</Text>
              <Text style={styles.emptyText}>
                Este tutor aún no ha publicado tutorías.
              </Text>
            </View>
          )}
        </View>      
        </ScrollView>

      {isTablet && (
        <SideBar visible={sidebarVisible} />
      )}
      {!isTablet && <BottomNavbar onToggleSidebar={toggleSidebar} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  navbar: {
    backgroundColor: '#252525',
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F05C5C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#F05C5C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#252525',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  tutorInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tutorImageContainer: {
    marginRight: 16,
  },
  tutorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  tutorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorImageText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  tutorTitle: {
    fontSize: 16,
    color: '#F05C5C',
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    color: '#9CA3AF',
    marginLeft: 8,
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c92020',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  profileButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F05C5C',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tutoringsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  tutoringsGrid: {
    gap: 16,
  },
  tutoringCardContainer: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default TutorTutoringsPage;
