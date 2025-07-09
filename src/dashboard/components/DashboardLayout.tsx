import React, { ReactNode, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavbar from './BottomNavbar';
import Sidebar from './SideBar';

interface DashboardLayoutProps {
  children: ReactNode;
  onCreateTutoring?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onCreateTutoring }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1e1e1e" barStyle="light-content" />
      
      <View style={[styles.mainContent, { paddingBottom: 80 + insets.bottom }]}>
        {children}
      </View>

      <BottomNavbar onToggleSidebar={toggleSidebar} />      
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        onCreateTutoring={onCreateTutoring}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
});

export default DashboardLayout;