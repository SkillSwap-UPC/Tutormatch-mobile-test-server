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

  const handlePress = () => {
    if (onClick) {
      onClick(tutoring.id);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onClick?.(tutoring.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: tutoring.imageUrl || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title} allowFontScaling={false} numberOfLines={1}>
        {tutoring.title}
      </Text>
      
      <View style={styles.tutorContainer}>
        <Text style={styles.tutorName}>
         {loading ? 'Cargando...' : tutor ? `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || 'Tutor desconocido' : 'Tutor desconocido'}
        </Text>
      </View>
      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingValue}>{rating > 0 ? rating : '0.0'}</Text>
        <View style={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(rating) ? 'star' : 'star-outline'}
              size={16}
              color="#F05C5C"
              style={{ marginHorizontal: 1 }}
            />
          ))}
        </View>
        <Text style={styles.reviewCount}>({reviewCount} reseñas)</Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{tutoring.description}</Text>
      <Text style={styles.price}>S/. {tutoring.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tutorName: {
    color: '#c92020',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 8,
  },
  description: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  price: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
});

export default TutoringCard;