import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../public/hooks/useAuth';
import { Text } from '../../utils/TextFix';

interface BottomNavbarProps {
  onToggleSidebar: () => void;
}

type RootStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Support: undefined;
  Login: undefined;
};

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onToggleSidebar }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  const NavButton = ({ 
    iconName, 
    label, 
    routeName, 
    onPress 
  }: { 
    iconName: string; 
    label: string; 
    routeName?: string; 
    onPress?: () => void;
  }) => {
    const active = routeName ? isActive(routeName) : false;
    
    return (
      <TouchableOpacity
        style={styles.navButton}
        onPress={onPress || (() => routeName && navigation.navigate(routeName as keyof RootStackParamList))}
      >
        <Ionicons 
          name={iconName as any} 
          size={24} 
          color={active ? '#F05C5C' : '#9CA3AF'} 
        />
        <Text style={[styles.navLabel, active && styles.activeNavLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.navContent}>
        <NavButton
          iconName="home"
          label="Inicio"
          routeName="Dashboard"
        />
        
        <NavButton
          iconName="apps-outline"
          label="Menú"
          onPress={onToggleSidebar}
        />
        
        <NavButton
          iconName="person"
          label="Perfil"
          routeName="Profile"
        />
        
        <NavButton
          iconName="help-circle"
          label="Ayuda"
          routeName="Support"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2C2C2C',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    paddingTop: 8,
  },
  navContent: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeNavLabel: {
    color: '#F05C5C',
    fontWeight: '600',
  },
});

export default BottomNavbar;
