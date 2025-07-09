import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../utils/TextFix';
import { TutoringReview } from '../../types/Tutoring';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
    reviews: TutoringReview[];
    onReviewUpdated?: () => void;
    onReviewDeleted?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onReviewUpdated, onReviewDeleted }) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay reseñas disponibles.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {reviews.map((review, index) => (
                <View key={review.id.toString()}>
                    <ReviewCard
                        review={review}
                        onReviewUpdated={onReviewUpdated}
                        onReviewDeleted={onReviewDeleted}
                    />
                    {index < reviews.length - 1 &&
                        <View style={styles.separator}
                        />}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    separator: {
        height: 12,
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    }
});

export default ReviewList;