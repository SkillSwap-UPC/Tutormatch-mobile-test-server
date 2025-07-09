import BottomNavbar from '@/src/dashboard/components/BottomNavbar';
import Navbar from '@/src/dashboard/components/Navbar';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseService } from '../../course/services/CourseService';
import { Course } from '../../course/types/Course';
import { UserService } from '../../user/services/UserService';
import { User } from '../../user/types/User';
import { Text } from '../../utils/TextFix';
import TutoringDetails from '../components/TutoringDetails';
import { TutoringService } from '../services/TutoringService';
import { TutoringReview, TutoringSession } from '../types/Tutoring';

// Definición de los parámetros de la ruta
type RouteParams = {
  TutoringDetails: {
    tutoringId: string;
  };
};

const TutoringDetailsPage: React.FC = () => {
  // Usar useRoute para obtener los parámetros en lugar de useParams
  const route = useRoute<RouteProp<RouteParams, 'TutoringDetails'>>();
  const tutoringId = route.params?.tutoringId;
  const insets = useSafeAreaInsets();

  const [tutoring, setTutoring] = useState<TutoringSession | null>(null);
  const [reviews, setReviews] = useState<TutoringReview[]>([]);
  const [tutor, setTutor] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tutoringId) {
          setError('ID de tutoría no proporcionado');
          return;
        }

        // Obtener la información de la tutoría
        const tutoringData = await TutoringService.getTutoringSession(tutoringId);
        setTutoring(tutoringData);

        // Obtener las reseñas
        const reviewsData = await TutoringService.getReviews(tutoringId);
        setReviews(reviewsData);

        // Cargas en paralelo para mejor rendimiento
        const promises = [];

        // Obtener el tutor
        if (tutoringData.tutorId) {
          promises.push(
            UserService.getUserById(tutoringData.tutorId.toString())
              .then(tutorData => setTutor(tutorData))
              .catch(error => {
                console.error('Error al obtener datos del tutor:', error);
                return null;
              })
          );
        }

        // Obtener el curso
        if (tutoringData.courseId) {
          promises.push(
            CourseService.getCourseById(tutoringData.courseId.toString())
              .then(courseData => setCourse(courseData))
              .catch(error => {
                console.error('Error al obtener datos del curso:', error);
                return null;
              })
          );
        }

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);

      } catch (error: any) {
        console.error('Error al cargar los datos:', error);
        setError(error.message || 'Error al cargar los detalles de la tutoría');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutoringId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F05C5C" />
          <Text style={styles.loadingText}>Cargando detalles de la tutoría...</Text>
        </View>
      </View>
    );
  }

  if (error || !tutoring) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'No se encontró la tutoría solicitada'}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Navbar />
      <View style={[styles.contentContainer, { paddingBottom: 80 + insets.bottom }]}>
        <TutoringDetails
          tutoring={tutoring}
          reviews={reviews}
          tutor={tutor || undefined}
          course={course || undefined}
        />
      </View>
      <BottomNavbar onToggleSidebar={toggleSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#252525',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F05C5C',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F05C5C',
    marginBottom: 16,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default TutoringDetailsPage;