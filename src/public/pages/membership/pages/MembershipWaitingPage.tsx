import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { supabase } from '../../../../lib/supabase/client';

export default function MembershipWaitingPage({ navigation }: any) {
  const [dots, setDots] = useState('');
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [polling, setPolling] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Valores animados para efectos visuales
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Animación de pulso para el indicador de estado
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Animación de rotación para el ícono de revisión
  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => rotateAnimation.stop();
  }, []);

  // Animación de flotación para elementos de fondo
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    return () => floatAnimation.stop();
  }, []);

  // Animación de puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Polling para verificar el estado de la membresía
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let isMounted = true;
    
    async function checkMembershipStatus() {
      try {
        // Obtener el usuario actual
        const userId = await AsyncStorage.getItem('currentUserId');
        if (!userId) return;

        const { data: memberships, error } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error || !memberships || memberships.length === 0) return;
        
        const membership = memberships[0];
        if (!isMounted) return;
        
        if (membership.status === 'active') {
          setPolling(false);
          setShowApprovedModal(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            navigation.navigate('Dashboard');
          }, 3500);
        } else if (membership.status === 'rejected') {
          setPolling(false);
          setShowRejectedModal(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            navigation.navigate('MembershipPlansPage');
          }, 3500);
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }
    
    if (polling && !showApprovedModal && !showRejectedModal) {
      interval = setInterval(checkMembershipStatus, 2000);
      checkMembershipStatus(); // Primer chequeo inmediato
    }
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigation, polling, showApprovedModal, showRejectedModal]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Elementos de fondo animados */}
      <View style={styles.backgroundContainer}>
        <Animated.View 
          style={[
            styles.floatingCircle1,
            { transform: [{ translateY: floatY }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingCircle2,
            { transform: [{ translateY: floatY }, { scale: pulseAnim }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingCircle3,
            { transform: [{ translateY: floatY }] }
          ]} 
        />
      </View>

      {/* Modal de aprobado */}
      <Modal visible={showApprovedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderColor: '#059669' }]}> 
            <Feather name="check-circle" size={48} color="#34D399" style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitle}>¡Membresía aprobada!</Text>
            <Text style={[styles.modalText, { color: '#6ee7b7' }]}>
              Tu comprobante ha sido aprobado.{'\n'}Ya puedes acceder a la plataforma.
            </Text>
            <Text style={styles.modalSubText}>Serás redirigido automáticamente al panel.</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#059669' }]}
              onPress={() => {
                setShowApprovedModal(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                navigation.navigate('Dashboard');
              }}
            >
              <Text style={styles.modalButtonText}>Ir al panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de rechazo */}
      <Modal visible={showRejectedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderColor: '#dc2626' }]}> 
            <Feather name="x-circle" size={48} color="#F87171" style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Pago rechazado</Text>
            <Text style={[styles.modalText, { color: '#fca5a5' }]}>
              Tu comprobante ha sido rechazado.{'\n'}Se procederá a la devolución del monto que has cancelado.
            </Text>
            <Text style={styles.modalSubText}>
              Puedes volver a intentar el pago desde la página de membresías.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#dc2626' }]}
              onPress={() => {
                setShowRejectedModal(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                navigation.navigate('MembershipPlansPage');
              }}
            >
              <Text style={styles.modalButtonText}>Ir a membresías</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Patrón de fondo sutil */}
          <View style={styles.backgroundPattern}>
            <View style={styles.patternCircle1} />
            <View style={styles.patternCircle2} />
            <View style={styles.patternCircle3} />
          </View>

          {/* Status Icon */}
          <View style={styles.statusIconBox}>
            <View style={styles.statusIconCircle}>
              <Feather name="clock" size={40} color="#fff" />
            </View>
            <Animated.View 
              style={[
                styles.statusPulse,
                { transform: [{ scale: pulseAnim }] }
              ]} 
            />
          </View>

          <Text style={styles.title}>¡Solicitud Enviada!</Text>
          <Text style={styles.subtitle}>Procesando tu membresía{dots}</Text>

          {/* Status Steps */}
          <View style={styles.stepsRow}>
            <View style={styles.stepCol}>
              <View style={[styles.stepCircle, { backgroundColor: '#22c55e' }]}> 
                <Feather name="check-circle" size={20} color="#fff" />
              </View>
              <Text style={[styles.stepLabel, { color: '#6ee7b7' }]}>Enviado</Text>
            </View>
            
            <View style={styles.stepLineActive} />
            
            <View style={styles.stepCol}>
              <View style={[styles.stepCircle, { backgroundColor: '#f59e42' }]}> 
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Feather name="refresh-cw" size={16} color="#fff" />
                </Animated.View>
              </View>
              <Text style={[styles.stepLabel, { color: '#fbbf24' }]}>Revisión</Text>
            </View>
            
            <View style={styles.stepLineInactive} />
            
            <View style={styles.stepCol}>
              <View style={[styles.stepCircle, { backgroundColor: '#52525b' }]}> 
                <Feather name="check-circle" size={20} color="#a1a1aa" />
              </View>
              <Text style={[styles.stepLabel, { color: '#a1a1aa' }]}>Aprobado</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Feather name="bell" size={24} color="#60a5fa" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>¿Qué sigue ahora?</Text>
                <View style={styles.infoList}>
                  <View style={styles.infoListItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>Nuestro equipo revisará tu comprobante de pago</Text>
                  </View>
                  <View style={styles.infoListItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>Te notificaremos vía email cuando sea aprobado</Text>
                  </View>
                  <View style={styles.infoListItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>Tiempo estimado: 1-2 horas hábiles</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Expected Time */}
          <View style={styles.timeBox}>
            <Feather name="clock" size={20} color="#fca5a5" style={{ marginRight: 8 }} />
            <Text style={styles.timeText}>Tiempo estimado: 1-2 horas</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a91d3a',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  floatingCircle1: {
    position: 'absolute',
    top: 50,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  floatingCircle2: {
    position: 'absolute',
    top: '25%',
    right: 50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: 100,
    left: '25%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  patternCircle1: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  patternCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -80,
    marginLeft: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIconBox: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e42',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusPulse: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fca5a5',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepLineActive: {
    height: 4,
    flex: 1,
    backgroundColor: '#fbbf24',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepLineInactive: {
    height: 4,
    flex: 1,
    backgroundColor: '#52525b',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    width: '100%',
  },
  infoTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f87171',
    marginTop: 7,
  },
  infoText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185,28,28,0.18)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    width: '100%',
    justifyContent: 'center',
  },
  timeText: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 28,
    maxWidth: 340,
    width: '90%',
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalSubText: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});