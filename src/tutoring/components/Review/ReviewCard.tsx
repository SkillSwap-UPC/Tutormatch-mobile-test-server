import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from '../../../utils/TextFix';
import { TutoringService } from '../../services/TutoringService';
import { TutoringReview } from '../../types/Tutoring';

interface ReviewCardProps {
  review: TutoringReview;
  onReviewUpdated?: () => void;
  onReviewDeleted?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReviewUpdated, onReviewDeleted }) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedComment, setEditedComment] = useState<string>(review.comment || '');
  const [editedRating, setEditedRating] = useState<number>(review.rating);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Verificar si el usuario actual es el propietario de la reseña
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem('currentUserId');
        if (currentUserId && review.studentId) {
          setIsOwner(currentUserId === review.studentId.toString());
        }
      } catch (error) {
        console.error('Error al verificar propiedad de la reseña:', error);
      }
    };

    checkOwnership();
  }, [review.studentId]);

  const handleEditSave = async () => {
    if (editedComment.trim().length < 10) {
      Alert.alert('Error', 'El comentario debe tener al menos 10 caracteres');
      return;
    }

    if (editedRating === 0) {
      Alert.alert('Error', 'Debes seleccionar una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      await TutoringService.updateReview(review.id, {
        rating: editedRating,
        comment: editedComment.trim()
      });

      Alert.alert('Éxito', 'Tu reseña ha sido actualizada correctamente');
      setIsEditing(false);
      
      if (onReviewUpdated) {
        onReviewUpdated();
      }
    } catch (error: any) {
      console.error('Error al actualizar reseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditedComment(review.comment || '');
    setEditedRating(review.rating);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta reseña?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await TutoringService.deleteReview(review.id);
              Alert.alert('Éxito', 'Tu reseña ha sido eliminada correctamente');
              
              if (onReviewDeleted) {
                onReviewDeleted();
              }
            } catch (error: any) {
              console.error('Error al eliminar reseña:', error);
              Alert.alert('Error', 'No se pudo eliminar la reseña');
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (date?: string | Date) => {
    if (!date) return 'Fecha no disponible';
    // Convertir la cadena a un objeto Date si es necesario
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const StudentAvatar = () => (
    <>
      {review.student?.avatar ? (
        <Image 
          source={{ uri: review.student.avatar }}
          style={styles.avatar}
        />
      ) : (        
      <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {(review.student?.firstName?.charAt(0)?.toUpperCase() || '') + 
             (review.student?.lastName?.charAt(0)?.toUpperCase() || '') || 
             'U'}
          </Text>
        </View>
      )}
    </>
  );

  const RatingDisplay = () => (
    <View style={styles.ratingContainer}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (          
          <Ionicons
            key={star}
            name={star <= review.rating ? 'star' as any : 'star-outline' as any}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
      <Text style={styles.ratingText}>{review.rating}/5</Text>
    </View>
  );

  const EditableRatingDisplay = () => (
    <View style={styles.ratingContainer}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setEditedRating(star)}
            style={styles.editStarButton}
          >            
          <Ionicons
              name={star <= editedRating ? 'star' as any : 'star-outline' as any}
              size={20}
              color={star <= editedRating ? "#F05C5C" : "#9CA3AF"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>{editedRating}/5</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <StudentAvatar />        
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>
            {`${review.student?.firstName || ''} ${review.student?.lastName || ''}`.trim() || 'Usuario anónimo'}
          </Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
        
        {/* Opciones para el propietario */}
        {isOwner && !isEditing && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color="#F05C5C" />
            </TouchableOpacity>
          </View>
        )}
      </View>      
      <View style={styles.content}>
        {isEditing ? <EditableRatingDisplay /> : <RatingDisplay />}

        <View style={styles.commentContainer}>
          {isEditing ? (
            <TextInput
              value={editedComment}
              onChangeText={setEditedComment}
              placeholder="Escribe tu comentario..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.editCommentInput}
              maxLength={500}
            />
          ) : (
            <Text style={styles.comment}>{review.comment || 'Sin comentarios adicionales.'}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleEditCancel}
              style={styles.cancelEditButton}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelEditButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEditSave}
              style={[styles.saveEditButton, isSubmitting && styles.saveEditButtonDisabled]}
              disabled={isSubmitting || editedComment.trim().length < 10}
            >
              <Text style={styles.saveEditButtonText}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#252525',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    backgroundColor: '#4c5eeb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  commentContainer: {
    padding: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginBottom: 12,
  },
  comment: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  likedButton: {
    backgroundColor: '#DC2626',
  },
  heartIcon: {
    marginRight: 4,
  },
  likeButtonText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  likedButtonText: {
    color: '#FFFFFF',
  },
  likesCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  editStarButton: {
    padding: 4,
  },
  editCommentInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  cancelEditButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    backgroundColor: 'transparent',
  },
  cancelEditButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  saveEditButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#F05C5C',
    minWidth: 80,
    alignItems: 'center',
  },
  saveEditButtonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  saveEditButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReviewCard;