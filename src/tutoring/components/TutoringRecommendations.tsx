import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { TutoringSession } from '../types/Tutoring';
import TutoringCard from './TutoringCard';

interface TutoringRecommendationsProps {
  title?: string;
  tutorings: TutoringSession[];
  onTutoringClick: (tutoringId: string) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}


const TutoringRecommendations: React.FC<TutoringRecommendationsProps> = ({ 
  tutorings, 
  onTutoringClick,
  ListHeaderComponent 
}) => {
  if (!tutorings || tutorings.length === 0) {
    return null;
  }
  
  // Determinar el número de columnas según el ancho de pantalla
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth >= 768 ? 2 : 1; // 2 columnas en tablet, 1 en móvil
  
  const renderItem = ({ item }: { item: TutoringSession }) => (
    <View style={[
      styles.cardWrapper, 
      { width: numColumns > 1 ? '48%' : '100%' }
    ]}>
      <TutoringCard 
        tutoring={item} 
        onClick={onTutoringClick} 
      />
    </View>
  );
  
  return (
    <View style={styles.container}>      
    <FlatList
        data={tutorings}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 32,
  },  listContent: {
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: 16,
  }
});

export default TutoringRecommendations;