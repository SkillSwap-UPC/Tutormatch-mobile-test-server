import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from '../../../user/types/User';
import { Text } from '../../../utils/TextFix';
import { TutoringService } from '../../services/TutoringService';

interface CreateReviewModalProps {
  visible: boolean;
  onHide: () => void;
  onReviewCreated: () => void;
  tutoringId: string;
  currentUser: User | null;
  tutorName?: string;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  visible,
  onHide,
  onReviewCreated,
  tutoringId,
  currentUser,
  tutorName
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert(
        'Error',
        'Debes estar autenticado para dejar una reseña'
      );
      return;
    }

    if (rating === 0) {
      Alert.alert(
        'Atención',
        'Por favor, selecciona una calificación'
      );
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert(
        'Atención',
        'El comentario debe tener al menos 10 caracteres'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        studentId: currentUser.id,
        rating: rating,
        comment: comment.trim()
      };      await TutoringService.addReview(tutoringId, reviewData);

      Alert.alert(
        'Éxito',
        'Tu reseña ha sido enviada correctamente'
      );

      // Resetear el formulario
      setRating(0);
      setComment('');
      
      // Notificar al componente padre
      onReviewCreated();
      
      // Cerrar el modal
      onHide();

      // Recargar la página con un pequeño delay para que se cierre el modal
      setTimeout(() => {
        const currentRoute = navigation.getState().routes[navigation.getState().index];
        navigation.replace(currentRoute.name, currentRoute.params);
      }, 500);

    } catch (error: any) {
      console.error('Error al crear reseña:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Error al enviar la reseña. Inténtalo de nuevo.';

      Alert.alert(
        'Error',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setRating(0);
    setComment('');
    onHide();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >          
        <Ionicons
            name={i <= rating ? "star" as any : "star-outline" as any}
            size={24}
            color={i <= rating ? "#F05C5C" : "#9CA3AF"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>        
        <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {`Evaluar tutoría${tutorName ? ` de ${tutorName}` : ''}`}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {currentUser && (
              <View style={styles.userInfoContainer}>
                {currentUser.avatar ? (
                  <Image 
                    source={{ uri: currentUser.avatar }} 
                    style={styles.avatar}
                  />
                ) : (                  
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {(currentUser.firstName?.charAt(0)?.toUpperCase() || '') + 
                       (currentUser.lastName?.charAt(0)?.toUpperCase() || '') || 
                       'U'}
                    </Text>
                  </View>
                )}                
                <View style={styles.userTextInfo}>
                  <Text style={styles.userName}>
                    {`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Usuario'}
                  </Text>
                  <Text style={styles.userRole}>Escribiendo como estudiante</Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Calificación *</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars()}
                </View>
                <Text style={styles.ratingText}>
                  {rating > 0 ? `${rating}/5` : 'Selecciona una calificación'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Comentario *</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Comparte tu experiencia con esta tutoría. ¿Qué te gustó? ¿Qué aprendiste? ¿Recomendarías al tutor?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                style={styles.textInput}
                textAlignVertical="top"
              />
              <View style={styles.textInputFooter}>
                <Text style={styles.minCharsText}>Mínimo 10 caracteres</Text>
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>
            </View>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Consejos para una buena reseña:</Text>
              <Text style={styles.tipText}>• Sé específico sobre lo que aprendiste</Text>
              <Text style={styles.tipText}>• Menciona la calidad de la explicación del tutor</Text>
              <Text style={styles.tipText}>• Comenta sobre la puntualidad y preparación</Text>
              <Text style={styles.tipText}>• Mantén un tono constructivo y respetuoso</Text>            
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || comment.trim().length < 10 || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Enviando..." : "Enviar Reseña"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },  
  modalContainer: {
    backgroundColor: '#252525',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e1e1e',
    marginTop: 16,
    borderRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  userRole: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    paddingVertical: 16,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 12,
    marginBottom: 8,
  },
  starButton: {
    padding: 6,
  },
  ratingText: {
    color: '#D1D5DB',
    fontSize: 14,
  },  
  textInput: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    maxHeight: 150,
  },
  textInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minCharsText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  charCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    marginBottom: 20,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#4a4a4a',
    backgroundColor: '#252525',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#F05C5C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateReviewModal;
