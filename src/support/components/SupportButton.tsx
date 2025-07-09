import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type RootStackParamList = {
  Support: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Support'>;

const SupportButton: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Support');
  };

  return (
    <TouchableOpacity 
      style={styles.supportButton} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="help-circle" size={20} color="white" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>Centro de Soporte</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  supportButton: {
    backgroundColor: '#F05C5C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default SupportButton;