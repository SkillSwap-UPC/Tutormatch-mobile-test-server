import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from '../../utils/TextFix';
import { User } from '../types/User';

interface UserProfileProps {
  user: Pick<User, 'firstName' | 'lastName' | 'semesterNumber' | 'academicYear' | 'avatar'>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  // Using destructuring with the properties from our User type
  const { firstName, lastName, semesterNumber, academicYear, avatar } = user;
  
  // Get first letter of name for avatar placeholder
  const avatarInitial = firstName?.charAt(0) || 'U' + lastName?.charAt(0) || 'U';
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>Hello, {firstName} {lastName}!</Text>
            <View style={styles.academicInfo}>
              <Text style={styles.academicText}>
                {semesterNumber}° Semestre · {academicYear}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#252525', // Equivalente a bg-dark-card
    borderRadius: 8,
    padding: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#DC2626', // Equivalente a bg-red-600
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    borderRadius: 32,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  academicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academicText: {
    color: '#9CA3AF', // Equivalente a text-light-gray
  },
});

export default UserProfile;