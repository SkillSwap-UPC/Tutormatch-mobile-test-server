import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  View
} from 'react-native';
import TutoringCard from '../../tutoring/components/TutoringCard';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { Text } from '../../utils/TextFix';
import DashboardLayout from '../components/DashboardLayout';
import { SemesterService } from '../services/SemesterService';

type RootStackParamList = {
  TutoringsBySemester: { semesterId: string };
  TutoringDetails: { tutoringId: string };
};

type TutoringsBySemesterScreenRouteProp = RouteProp<RootStackParamList, 'TutoringsBySemester'>;
type TutoringsBySemesterScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TutoringsBySemester: React.FC = () => {
  const route = useRoute<TutoringsBySemesterScreenRouteProp>();
  const navigation = useNavigation<TutoringsBySemesterScreenNavigationProp>();
  const { semesterId } = route.params || {};

  const [tutorings, setTutorings] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterName, setSemesterName] = useState<string>('');

  // Determinar el número de columnas según el ancho de pantalla
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth >= 768 ? 2 : 1; // 2 columnas en tablet, 1 en móvil

 useEffect(() => {
    const fetchTutorings = async () => {
      if (!semesterId) {
        setError("No se especificó un semestre");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Obtener información del semestre
        const semesterData = await SemesterService.getSemesterById(semesterId);

        // Guardar el nombre del semestre para mostrarlo en el título
        if (semesterData && semesterData.name) {
          setSemesterName(semesterData.name);
        } else {
          setSemesterName('Semestre');
        }

        // 2. Obtener todos los cursos del semestre
        const courses = semesterData.courses || [];

        // 3. Obtener todas las tutorías
        const allTutorings = await TutoringService.getAllTutoringSessions();

        // 4. Filtrar tutorías por los cursos del semestre
        const courseIds = courses.map((course: any) => course.id);
        const filteredTutorings = allTutorings.filter(tutoring =>
          tutoring.courseId && courseIds.includes(tutoring.courseId)
        );

        setTutorings(filteredTutorings);
      } catch (err) {
        console.error('Error al cargar las tutorías:', err);
        setError('Error al cargar las tutorías. Intente nuevamente más tarde.');
        setSemesterName('Semestre desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorings();
  }, [semesterId]);

  // Manejar clic en una tarjeta de tutoría
  const handleTutoringClick = (tutoringId: string) => {
    navigation.navigate('TutoringDetails', { tutoringId: tutoringId });
  };

  const renderItem = ({ item }: { item: TutoringSession }) => (
    <View style={[
      styles.cardWrapper,
      { width: numColumns > 1 ? '48%' : '100%' }
    ]}>
      <TutoringCard
        tutoring={item}
        onClick={handleTutoringClick}
      />
    </View>
  );

  return (
    <DashboardLayout>
      <View style={styles.container}>        
        <Text style={styles.title}>
          Tutorías Disponibles
        </Text>
        {semesterName && (
          <Text style={styles.subtitle}>
            {semesterName} Semester
          </Text>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Cargando tutorías...</Text>
          </View>        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {error.includes('datos de ejemplo') && (
              <Text style={styles.errorSubtext}>
                Los datos mostrados son de ejemplo. Verifica tu conexión a internet para ver contenido real.
              </Text>
            )}
          </View>
        ) : tutorings.length > 0 ? (
          <FlatList
            data={tutorings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />        ) : (          
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay tutorías disponibles en este momento.
            </Text>
            <Text style={styles.emptySubtext}>
              Intente más tarde o verifique su conexión a internet.
            </Text>
          </View>
        )}
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  errorSubtext: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default TutoringsBySemester;