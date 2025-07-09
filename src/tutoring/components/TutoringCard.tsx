import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { UserService } from '../../user/services/UserService';
import { User } from '../../user/types/User';
import { Text } from '../../utils/TextFix';
import { TutoringService } from '../services/TutoringService';
import { TutoringSession } from '../types/Tutoring';

interface TutoringCardProps {
  tutoring: TutoringSession;
  onClick?: (tutoringId: string) => void;
}

const TutoringCard: React.FC<TutoringCardProps> = ({ tutoring, onClick }) => {
  const [tutor, setTutor] = useState<User | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTutorAndReviews = async () => {
      try {
        // Obtener información del tutor
        if (tutoring.tutorId) {
          const tutorData = await UserService.getUserById(tutoring.tutorId.toString());
          setTutor(tutorData);
        }

        // Obtener reseñas y calcular valoración
        const reviews = await TutoringService.getReviews(tutoring.id.toString());
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setRating(parseFloat((totalRating / reviews.length).toFixed(1)));
          setReviewCount(reviews.length);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorAndReviews();
  }, [tutoring.id, tutoring.tutorId]);

  // Imagen por defecto si no hay una
  const defaultImage = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onClick?.(tutoring.id)}
      activeOpacity={0.8}
    >
      {/* Header con imagen y badge de precio */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: tutoring.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badge de precio destacado */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>S/. {tutoring.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Título del curso */}
        <Text style={styles.title} allowFontScaling={false} numberOfLines={2}>
          {tutoring.title}
        </Text>
        
        {/* Información del tutor */}
        <View style={styles.tutorSection}>
          <View style={styles.tutorInfo}>
            <Text style={styles.tutorName} numberOfLines={1}>
              {loading ? 'Cargando...' : tutor ? `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || 'Tutor desconocido' : 'Tutor desconocido'}
            </Text>
            <Text style={styles.tutorLabel}>Tutor</Text>
          </View>
        </View>

        {/* Rating y reseñas */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingValue}>{rating > 0 ? rating : '0.0'}</Text>
            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(rating) ? 'star' : 'star-outline'}
                  size={12}
                  color="#F59E0B"
                  style={{ marginHorizontal: 1 }}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>({reviewCount} reseñas)</Text>
          </View>
        </View>
        
        {/* Descripción */}
        <Text style={styles.description} numberOfLines={3}>
          {tutoring.description}
        </Text>

        {/* Footer con fecha y CTA */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.dateText}>
              {tutoring.createdAt ? new Date(tutoring.createdAt).toLocaleString('es-PE', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : 'Fecha no disponible'}
            </Text>
          </View>
          
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Ver detalles</Text>
            <Ionicons name="chevron-forward" size={16} color="#60A5FA" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2f2e2e',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  priceBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    lineHeight: 24,
  },
  tutorSection: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 12,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  tutorLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  ratingSection: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 8,
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  description: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 6,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default TutoringCard;