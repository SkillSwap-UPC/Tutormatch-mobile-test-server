import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../utils/TextFix';

export default function NavbarAuth() {
  return (
    <View style={styles.navbar}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>TutorMatch</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});