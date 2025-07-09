import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Course } from '../../course/types/Course';
import DeleteTutoringModal from '../../dashboard/components/DeleteTutoringModal';
import EditTutoringModal from '../../dashboard/components/EditTutoringModal';
import Avatar from '../../user/components/Avatar';
import { UserService } from '../../user/services/UserService';
import { User } from '../../user/types/User';
import { Text } from '../../utils/TextFix';
import { TutoringService } from '../services/TutoringService';
import { TutoringReview, TutoringSession } from '../types/Tutoring';
import ContactTutorModal from './ContactTutorModal';
import CreateReviewModal from './Review/CreateReviewModal';
import ReviewList from './Review/ReviewList';

interface TutoringDetailsProps {
  tutoring: TutoringSession;
  reviews: TutoringReview[];
  tutor?: User;
  course?: Course;
}

const TutoringDetails: React.FC<TutoringDetailsProps> = ({
  tutoring,
  reviews,
  tutor,
  course
}) => {
  const { title, description, price, whatTheyWillLearn, imageUrl, availableTimes, tutorId } = tutoring;
  const [averageRating, setAverageRating] = useState<number>(0);
  const navigation = useNavigation<any>();  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [contactModalVisible, setContactModalVisible] = useState<boolean>(false);
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        // Obtener el ID del usuario actual de AsyncStorage
        const currentUserId = await AsyncStorage.getItem('currentUserId');

        // Verificar si hay un ID de usuario y si coincide con el ID del tutor
        if (currentUserId) {
          const tutorIdToCheck = tutorId || (tutor?.id);
          setIsOwner(!!tutorIdToCheck && currentUserId === tutorIdToCheck);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error al verificar propiedad de la tutoría:', error);
        setIsOwner(false);
      }
    };    checkOwnership();
  }, [tutorId, tutor]);

  // Cargar usuario actual
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem('currentUserId');
        if (currentUserId) {
          const userData = await UserService.getUserById(currentUserId);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error al cargar usuario actual:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Mostrar toast
  const displayToast = (message: string, type: 'success' | 'error') => {
    setShowToast({
      visible: true,
      message,
      type
    });

    // Auto ocultar después de 3 segundos
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleDeleteTutoring = async () => {
    try {
      setLoading(true);
      await TutoringService.deleteTutoring(tutoring.id);
      
      displayToast('La tutoría ha sido eliminada correctamente', 'success');
      
      // Redirigir a la página de dashboard después de eliminar
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar la tutoría:', error);
      displayToast('No se pudo eliminar la tutoría', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateTutoring = () => {
    // En React Native no podemos recargar la página como en web
    // Una alternativa es volver a cargar los datos
    displayToast('Tutoría actualizada correctamente', 'success');
    
    // Aquí podríamos implementar una recarga de datos
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: navigation.getCurrentRoute().name, params: { refresh: true } }],
    // });
  };

  const handleReviewCreated = () => {
    // Simular recarga de datos - podrías implementar una función para recargar reviews
    displayToast('Reseña enviada correctamente', 'success');
    
    // Opcional: recargar los datos de la página
    // navigation.replace(navigation.getCurrentRoute().name, { tutoringId: tutoring.id });
  };
  const handleReviewUpdated = () => {
    // Simular recarga de datos - podrías implementar una función para recargar reviews
    displayToast('Reseña actualizada correctamente', 'success');
    
    // Recargar la página para mostrar cambios
    setTimeout(() => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      navigation.replace(currentRoute.name, currentRoute.params);
    }, 1000);
  };
  const handleReviewDeleted = () => {
    // Simular recarga de datos - podrías implementar una función para recargar reviews
    displayToast('Reseña eliminada correctamente', 'success');
    
    // Recargar la página para mostrar cambios
    setTimeout(() => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      navigation.replace(currentRoute.name, currentRoute.params);
    }, 1000);
  };

  const canLeaveReview = (): boolean => {
    if (!currentUser || isOwner) return false;
    
    // Verificar si el usuario ya dejó una reseña
    const hasReviewed = reviews.some(review => review.studentId === currentUser.id);
    return !hasReviewed;
  };

  // Calculate average rating from reviews
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(parseFloat((totalRating / reviews.length).toFixed(1)));
    }
  }, [reviews]);

  // Imagen por defecto para la tutoría
  const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

  // Define time slots based on the format in the database
  const timeSlots = [];
  // Generar slots de 8 a 22h
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour}-${hour + 1}`);
  }

  // Días de la semana en español para mejor legibilidad
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Agrupar disponibilidades por día para la visualización
  const groupedAvailabilities: { [day: string]: string[] } = {};

  // Inicializar todos los días para evitar problemas con días sin horarios
  daysOfWeek.forEach(day => {
    groupedAvailabilities[day] = [];
  });

  if (availableTimes && availableTimes.length > 0) {
    availableTimes.forEach(timeSlot => {
      try {
        // Obtener el índice del día con soporte para ambos formatos
        let dayIndex = -1;

        if (typeof timeSlot.day_of_week === 'number' && !isNaN(timeSlot.day_of_week)) {
          dayIndex = timeSlot.day_of_week;
        } else if (typeof timeSlot.dayOfWeek === 'number' && !isNaN(timeSlot.dayOfWeek)) {
          dayIndex = timeSlot.dayOfWeek;
        } else if (typeof timeSlot.day_of_week === 'string') {
          dayIndex = parseInt(timeSlot.day_of_week, 10);
        } else if (typeof timeSlot.dayOfWeek === 'string') {
          dayIndex = parseInt(timeSlot.dayOfWeek, 10);
        }

        // Verificar índice válido
        if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
          console.warn('Índice de día inválido:', dayIndex, timeSlot);
          return; // Saltar este horario
        }

        const day = daysOfWeek[dayIndex];

        // Extraer horas de inicio y fin con soporte para ambos formatos
        let startTime = timeSlot.start_time || timeSlot.startTime || '';
        let endTime = timeSlot.end_time || timeSlot.endTime || '';

        if (!startTime || !endTime) {
          console.warn('Horario sin tiempo de inicio o fin:', timeSlot);
          return; // Saltar este horario
        }

        // Limpiar el formato de los tiempos (remover segundos)
        if (startTime.includes(':')) {
          // Divide por ":" y toma solo horas y minutos
          const [startHours, startMinutes] = startTime.split(':');
          startTime = `${startHours}:${startMinutes}`;
        }

        if (endTime.includes(':')) {
          const [endHours, endMinutes] = endTime.split(':');
          endTime = `${endHours}:${endMinutes}`;
        }

        // Extraer solo las horas para el formato de los slots de tiempo
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = parseInt(endTime.split(':')[0], 10);

        // Si hay minutos en el tiempo final, redondear hacia arriba
        const endMinutes = endTime.split(':')[1] ? parseInt(endTime.split(':')[1], 10) : 0;
        const adjustedEndHour = endMinutes > 0 ? endHour + 1 : endHour;

        // Crear slots para cada hora del rango
        for (let hour = startHour; hour < adjustedEndHour; hour++) {
          const timeSlotStr = `${hour}-${hour + 1}`;
          if (!groupedAvailabilities[day].includes(timeSlotStr)) {
            groupedAvailabilities[day].push(timeSlotStr);
          }
        }
      } catch (error) {
        console.error('Error al procesar horario:', error, timeSlot);
      }
    });
  }

  // Obtener el nombre completo del tutor
  const getTutorName = () => {
    if (tutor) {
      return `${tutor.firstName} ${tutor.lastName}`;
    } else {
      return 'Tutor no disponible';
    }
  };

  // Convertir el array de "whatTheyWillLearn" a formato adecuado
  const learningPoints = Array.isArray(whatTheyWillLearn)
    ? whatTheyWillLearn
    : typeof whatTheyWillLearn === 'object' && whatTheyWillLearn !== null
      ? Object.values(whatTheyWillLearn)
      : [];

  // Componente para el toast
  const Toast = () => {
    if (!showToast.visible) return null;
    
    return (
      <View style={[
        styles.toast,
        showToast.type === 'success' ? styles.successToast : styles.errorToast
      ]}>
        <Text style={styles.toastText}>{showToast.message}</Text>
      </View>
    );
  };

  // Componente para la visualización de estrellas (rating)
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (          
          <Ionicons
            key={star}
            name={star <= Math.round(rating) ? 'star' as any : 'star-outline' as any}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Toast />
      
      <DeleteTutoringModal
        visible={deleteModalVisible}
        onHide={() => setDeleteModalVisible(false)}
        onDelete={handleDeleteTutoring}
        tutoring={tutoring}
      />
        {isOwner && (
        <EditTutoringModal
          visible={editModalVisible}
          onHide={() => setEditModalVisible(false)}
          onSave={handleUpdateTutoring}
          currentUser={tutor as User}
          tutoring={tutoring}
        />
      )}
      
      <CreateReviewModal
        visible={reviewModalVisible}
        onHide={() => setReviewModalVisible(false)}
        onReviewCreated={handleReviewCreated}
        tutoringId={tutoring.id}
        currentUser={currentUser}
        tutorName={tutor ? `${tutor.firstName} ${tutor.lastName}` : undefined}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            {course && (
              <>
                <View style={styles.semesterBadge}>
                  <Text style={styles.semesterBadgeText}>
                    {course.semesterNumber}° Semestre
                  </Text>
                </View>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>
                    {course.name}
                  </Text>
                </View>
              </>
            )}
            {!course && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>
                  Tutoría
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingNumber}>
              {averageRating.toFixed(1)}
            </Text>
            <StarRating rating={averageRating} />
            <Text style={styles.reviewCount}>
              ({reviews.length} reseñas)
            </Text>
          </View>          
          <View style={styles.tutorContainer}>
            {tutor && (
              <View style={styles.tutorInfo}>
                <Avatar user={tutor} size="sm" />
                <View style={styles.tutorDetails}>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile', { userId: tutor.id })}
                    style={styles.tutorName}                  >
                    <Text style={styles.tutorNameText}>{getTutorName()}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.mainContentWrapper}>
            <View style={styles.leftContent}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Lo que aprenderás</Text>
                <View style={styles.learningGrid}>
                  {learningPoints.map((item, index) => (
                    <View key={index} style={styles.learningItem}>
                      <View style={styles.checkIconContainer}>
                        <Ionicons name="checkmark" size={18} color="#10B981" />
                      </View>
                      <Text style={styles.learningText}>
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Horarios disponibles del tutor</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scheduleContainer}>
                  <View style={styles.scheduleTable}>
                    <View style={styles.scheduleHeader}>
                      <View style={styles.timeHeaderCell}>
                        <Text style={styles.scheduleHeaderText}></Text>
                      </View>
                      {daysOfWeek.map(day => (
                        <View key={day} style={styles.dayHeaderCell}>
                          <Text style={styles.scheduleHeaderText}>
                            {day.slice(0, 3)}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {timeSlots.map(timeSlot => (
                      <View key={timeSlot} style={styles.scheduleRow}>
                        <View style={styles.timeCell}>
                          <Text style={styles.timeCellText}>{timeSlot}h</Text>
                        </View>
                        {daysOfWeek.map(day => {
                          const isAvailable = groupedAvailabilities[day]?.includes(timeSlot);
                          return (
                            <View key={`${day}-${timeSlot}`} style={styles.dayCell}>
                              <View style={[
                                styles.dayCellContent,
                                isAvailable ? styles.availableCell : styles.unavailableCell
                              ]}>
                                {isAvailable && <Ionicons name="checkmark" size={16} color="white" />}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>              
              <View style={styles.card}>
                <View style={styles.reviewsHeaderContainer}>
                  <View style={styles.reviewsMainHeader}>
                    <View style={styles.reviewsTitleContainer}>
                      <Text style={styles.reviewsSectionTitle}>Reseñas de estudiantes</Text>
                    </View>
                    {canLeaveReview() && width > 320 && (
                      <TouchableOpacity
                        style={styles.addReviewButton}
                        onPress={() => setReviewModalVisible(true)}
                      >
                        <Ionicons name="add" size={14} color="white" />
                        <Text style={styles.addReviewButtonText}>Añadir</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {canLeaveReview() && width <= 320 && (
                    <TouchableOpacity
                      style={[styles.addReviewButton, styles.addReviewButtonFullWidth]}
                      onPress={() => setReviewModalVisible(true)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                      <Text style={styles.addReviewButtonText}>Añadir reseña</Text>
                    </TouchableOpacity>
                  )}
                </View>                
                {reviews && reviews.length > 0 ? (
                  <ReviewList 
                    reviews={reviews} 
                    onReviewUpdated={handleReviewUpdated}
                    onReviewDeleted={handleReviewDeleted}
                  />
                ) : (
                  <Text style={styles.noReviewsText}>
                    Aún no hay reseñas. ¡Sé el primero en dejar una reseña!
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.sidebarCard}>
              <Image
                source={{ uri: imageUrl || defaultImageUrl }}
                style={styles.courseImage}
                resizeMode="cover"
              />
              <Text style={styles.sidebarTitle}>{title}</Text>
              <Text style={styles.price}>S/. {price.toFixed(2)}</Text>
              
              {isOwner ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditModalVisible(true)}
                  disabled={loading}
                >
                  <Ionicons name="create-outline" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Editar Tutoría</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => setContactModalVisible(true)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Solicitar Tutoría</Text>
                </TouchableOpacity>
              )}
              
              {isOwner && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setDeleteModalVisible(true)}
                  disabled={loading}
                >
                  <Ionicons name="trash-outline" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Eliminar tutoría</Text>
                </TouchableOpacity>
              )}

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Esta tutoría incluye:</Text>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={16} color="#F05C5C" style={styles.featureIcon} />
                  <Text style={styles.featureText}>Sesiones personalizadas</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="desktop-outline" size={16} color="#F05C5C" style={styles.featureIcon} />
                  <Text style={styles.featureText}>Modalidad: 100% virtual</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <ContactTutorModal 
        visible={contactModalVisible}
        onHide={() => setContactModalVisible(false)}
        tutor={tutor}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F05C5C" />
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#252525',
    padding: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  semesterBadge: {
    backgroundColor: 'rgba(240, 92, 92, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  semesterBadgeText: {
    color: '#F05C5C',
    fontSize: 12,
    fontWeight: '500',
  },
  courseBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  courseBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  defaultBadgeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    color: 'white',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingNumber: {
    color: '#F05C5C',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    color: 'white',
    fontSize: 12,
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tutorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  tutorName: {
    marginBottom: 4,
  },
  tutorNameText: {
    color: '#F05C5C',
  },
  content: {
    backgroundColor: '#303031',
    padding: 16,
  },
  mainContentWrapper: {
    flexDirection: isTablet ? 'row' : 'column-reverse',
  },
  leftContent: {
    flex: isTablet ? 3 : 1,
    marginRight: isTablet ? 16 : 0,
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    padding: 16,
    marginBottom: 16,
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
    flex: 1,
    flexShrink: 1,
  },
  learningGrid: {
    flexDirection: 'column',
  },
  learningItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  checkIconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  learningText: {
    color: 'white',
    flex: 1,
  },
  scheduleContainer: {
    marginBottom: 8,
  },
  scheduleTable: {
    minWidth: 600,
  },
  scheduleHeader: {
    flexDirection: 'row',
  },
  timeHeaderCell: {
    width: 50,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  scheduleHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    height: 40,
  },
  timeCell: {
    width: 50,
    justifyContent: 'center',
  },
  timeCellText: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  dayCell: {
    flex: 1,
    padding: 2,
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  availableCell: {
    backgroundColor: '#10B981',
  },
  unavailableCell: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  noReviewsText: {
    color: '#9CA3AF',
  },
  sidebarCard: {
    flex: isTablet ? 1 : undefined,
    backgroundColor: '#252525',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    padding: 16,
    marginBottom: 16,
  },
  courseImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F05C5C',
    marginVertical: 12,
  },
  requestButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  toast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 6,
    zIndex: 1000,
    elevation: 10,
  },
  successToast: {
    backgroundColor: '#10B981',
  },
  errorToast: {
    backgroundColor: '#DC2626',
  },
  toastText: {
    color: 'white',
    textAlign: 'center',
  },  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewsHeaderContainer: {
    marginBottom: 16,
  },
  reviewsMainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsTitleContainer: {
    flex: 1,
    minWidth: 0, // Permite que el texto se ajuste
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 0,
  },
  addReviewButton: {
    backgroundColor: '#F05C5C',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 80,
    justifyContent: 'center',
    gap: 4,
  },
  addReviewButtonFullWidth: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  addReviewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TutoringDetails;