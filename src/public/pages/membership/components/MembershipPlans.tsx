import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MembershipService } from '../services/MembershipService';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const plans = [
  {
    id: 'basic',
    name: 'Plan BÁSICO',
    features: [
      'Perfil básico en la plataforma.',
      'Acceso a estudiantes interesados.',
      'Historial de tutorías.',
      'Soporte con respuesta en 48 horas.'
    ],
    price: 'S/ 5.00',
    numericPrice: 5,
  },
  {
    id: 'standard',
    name: 'Plan ESTÁNDAR',
    features: [
      'Todo lo del plan básico.',
      'Acceso a herramientas de gestión de tutorías (calendarios avanzados, recordatorios automáticos).',
      'Recomendaciones personalizadas para estudiantes.',
      'Mayor visibilidad en búsquedas.',
      'Soporte con respuesta en 24 horas.'
    ],
    price: 'S/ 10.00',
    numericPrice: 10,
  },
  {
    id: 'premium',
    name: 'Plan PREMIUM',
    features: [
      'Todo lo del plan estándar.',
      'Perfil destacado con mayor exposición en la plataforma.',
      'Acceso a estadísticas avanzadas sobre rendimiento de tutorías.',
      'Promociones y descuentos en anuncios dentro de la plataforma.',
      'Soporte prioritario con respuesta en 12 horas.',
      'Acceso a eventos exclusivos y oportunidades de desarrollo profesional.'
    ],
    price: 'S/ 15.00',
    numericPrice: 15,
  },
];

const qrImages = {
  yape: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//qr.png',
  plin: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//plin.jpg',
  yapeIcon: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//yape.png',
  plinIcon: 'https://xdqnuesrahrusfnxcwvm.supabase.co/storage/v1/object/public/qr//plin.png',
};

export default function MembershipPlans() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'yape' | 'plin'>('yape');
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigation = useNavigation<any>();

  const handleBuy = (idx: number) => {
    setSelectedPlan(idx);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!file || selectedPlan === null) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Subir comprobante
      const paymentProofUrl = await MembershipService.uploadPaymentProof(file);
      // 2. Crear membresía
      const planType = ['BASIC', 'STANDARD', 'PREMIUM'][selectedPlan] as 'BASIC' | 'STANDARD' | 'PREMIUM';
      await MembershipService.createMembership(planType, paymentProofUrl);
      setSuccess('¡Comprobante enviado y membresía registrada! Un administrador revisará tu pago.');
      setShowModal(false);
      setFile(null);
      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el comprobante.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      setError('Error al seleccionar el archivo');
    }
  };

  const getPlanColors = (idx: number) => {
    switch (idx) {
      case 0: // BASIC
        return {
          border: 'border-blue-500',
          badge: 'bg-blue-500 text-white',
          accent: 'text-blue-300'
        };
      case 1: // STANDARD
        return {
          border: 'border-purple-500',
          badge: 'bg-purple-500 text-white',
          accent: 'text-purple-300'
        };
      case 2: // PREMIUM
        return {
          border: 'border-yellow-500',
          badge: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
          accent: 'text-yellow-300'
        };
      default:
        return {
          border: 'border-gray-500',
          badge: 'bg-gray-500 text-white',
          accent: 'text-gray-300'
        };
    }
  };

  // Función para obtener el plan seleccionado de forma segura
  const getSelectedPlan = () => {
    if (selectedPlan === null || selectedPlan < 0 || selectedPlan >= plans.length) {
      return null;
    }
    return plans[selectedPlan];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Conviértete en tutor y guía el éxito académico de otros.</Text>
      <Text style={styles.subtitle}>Ofrece tu conocimiento y ayuda a otros a alcanzar el éxito académico, ¡comienza a ofrecer tus tutorías hoy!</Text>
      <View style={styles.plansRow}>
        {plans.filter(plan => plan && plan.name).map((plan, idx) => {
          const isPopular = idx === 1;
          return (
            <View key={plan.id || `plan-${idx}`} style={[styles.planCard, isPopular && styles.planCardPopular]}>
              {isPopular && (
                <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>🔥 Más Popular</Text></View>
              )}
              <View style={styles.planNameWrap}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={[styles.planBadge, idx === 0 ? styles.badgeBasic : idx === 1 ? styles.badgeStandard : styles.badgePremium]}>
                  <Text style={styles.planBadgeText}>{idx === 0 ? 'Básico' : idx === 1 ? 'Estándar' : 'Premium'}</Text>
                </View>
              </View>
              <View style={styles.planPriceWrap}>
                <Text style={styles.planPriceCurrency}>S/</Text>
                <Text style={styles.planPrice}>{plan.numericPrice}</Text>
              </View>
              <Text style={styles.planPriceNote}>Único Pago</Text>
              <View style={styles.featuresWrap}>
                {plan.features && plan.features.map((feature, i) => (
                  <View key={`feature-${idx}-${i}`} style={styles.featureRow}>
                    <Text style={[styles.featureCheck, idx === 0 ? styles.accentBasic : idx === 1 ? styles.accentStandard : styles.accentPremium]}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.ctaButton} onPress={() => handleBuy(idx)}>
                <Text style={styles.ctaButtonText}>Elegir Plan {idx === 0 ? 'Básico' : idx === 1 ? 'Estándar' : 'Premium'}</Text>
                <Text style={styles.ctaButtonSub}>Comenzar ahora</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <View style={styles.valuePropWrap}>
        <Text style={styles.valuePropTitle}>🎓 Únete a cientos de tutores que ya están generando ingresos compartiendo su conocimiento</Text>
        <View style={styles.valuePropRow}>
          <Text style={styles.valuePropItem}>✓ Sin comisiones ocultas</Text>
          <Text style={styles.valuePropItem}>✓ Activación inmediata</Text>
          <Text style={styles.valuePropItem}>✓ Soporte 24/7</Text>
        </View>
      </View>

      {/* Modal para pago y comprobante */}
      <Modal visible={showModal && selectedPlan !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Completar Pago</Text>
                <Text style={styles.modalSubtitle}>Finaliza tu suscripción en pocos pasos</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton} accessibilityLabel="Cerrar">
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#fef08a', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#facc15' }}>
              <Text style={{ color: '#a91d3a', fontWeight: 'bold', textAlign: 'center', fontSize: 13 }}>
                TutorMatch <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>NO gestiona los pagos de manera interna.</Text> Realiza tu pago solo a través de los métodos y cuentas oficiales mostrados aquí. No uses intermediarios ni terceros para realizar tu pago.
              </Text>
            </View>
            {/* Content */}
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Plan Summary */}
              {getSelectedPlan() && (
                <View style={styles.planSummaryBox}>
                  <Text style={styles.planSummaryName}>{getSelectedPlan()!.name}</Text>
                  <Text style={styles.planSummaryPrice}>{getSelectedPlan()!.price}</Text>
                </View>
              )}
              {/* Payment Method Selection */}
              <Text style={styles.modalStepTitle}><Text style={styles.modalStepNumber}>1</Text> Método de pago</Text>
              <View style={styles.paymentTabsRow}>
                <TouchableOpacity style={[styles.paymentTab, tab === 'yape' && styles.paymentTabActive]} onPress={() => setTab('yape')}>
                  <Image source={{ uri: qrImages.yapeIcon }} style={styles.paymentTabIcon} />
                  <Text style={styles.paymentTabText}>Yape</Text>
                  {tab === 'yape' && <View style={styles.paymentTabCheck}><Feather name="check" size={14} color="#fff" /></View>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentTab, tab === 'plin' && styles.paymentTabActive]} onPress={() => setTab('plin')}>
                  <Image source={{ uri: qrImages.plinIcon }} style={styles.paymentTabIcon} />
                  <Text style={styles.paymentTabText}>Plin</Text>
                  {tab === 'plin' && <View style={styles.paymentTabCheck}><Feather name="check" size={14} color="#fff" /></View>}
                </TouchableOpacity>
              </View>
              {/* QR Code */}
              <Text style={styles.modalStepTitle}><Text style={styles.modalStepNumber}>2</Text> Escanea y paga</Text>
              <View style={styles.qrBox}>
                <Image source={{ uri: qrImages[tab] }} style={styles.qrImage} />
                <Text style={styles.qrText}>📱 Abre {tab === 'yape' ? 'Yape' : 'Plin'}</Text>
                <Text style={styles.qrTextSmall}>Escanea el QR y paga exactamente</Text>
                <Text style={styles.qrTextSmall}>Nombre: {tab === 'yape' ? 'Rodrigo A. Lopez H.' : 'Rodrigo Lopez'}</Text>
                {getSelectedPlan() && (
                  <View style={styles.qrPriceBox}><Text style={styles.qrPriceText}>{getSelectedPlan()!.price}</Text></View>
                )}
              </View>
              {/* Upload Section */}
              <Text style={styles.modalStepTitle}><Text style={styles.modalStepNumber}>3</Text> Comprobante de pago</Text>
              <TouchableOpacity style={[styles.uploadBox, file && styles.uploadBoxSelected]} onPress={handlePickFile}>
                {file ? (
                  <View style={{ alignItems: 'center' }}>
                    <Feather name="check-circle" size={28} color="#22c55e" style={{ marginBottom: 4 }} />
                    <Text style={styles.uploadFileName}>{file.fileName || file.uri.split('/').pop()}</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Feather name="upload" size={28} color="#fff" style={{ marginBottom: 4 }} />
                    <Text style={styles.uploadText}>Subir archivo</Text>
                    <Text style={styles.uploadTextSmall}>JPG, PNG, PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Error/Success Messages */}
              {error && <Text style={styles.errorBox}>{error}</Text>}
              {success && <Text style={styles.successBox}>{success}</Text>}
              {/* Footer ÚNICO */}
              <TouchableOpacity
                style={[styles.submitButton, (!file || loading) && styles.submitButtonDisabled]}
                disabled={!file || loading}
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Confirmar y Enviar Comprobante</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.submitButtonNote}>🔒 Tu información está segura y protegida</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIcon}><Feather name="check" size={36} color="#fff" /></View>
            <Text style={styles.confirmTitle}>¡Comprobante enviado!</Text>
            <Text style={styles.confirmText}>Tu comprobante fue enviado correctamente y está en revisión. {'\n'}<Text style={{ color: '#d1d5db' }}>Recibirás una notificación cuando tu membresía sea activada.</Text></Text>
            <TouchableOpacity style={styles.confirmButton} onPress={() => {
              setShowConfirmation(false);
              navigation.navigate('MembershipWaitingPage');
            }}>
              <Text style={styles.confirmButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
              </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4a0c2e',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#4a0c2e',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  plansRow: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 18,
  },
  planCard: {
    backgroundColor: '#2d010e',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 2,
    borderColor: '#a91d3a',
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#a855f7',
  },
  popularBadge: {
    position: 'absolute',
    top: -18,
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 2,
  },
  popularBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planNameWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  badgeBasic: {
    backgroundColor: '#3b82f6',
  },
  badgeStandard: {
    backgroundColor: '#a855f7',
  },
  badgePremium: {
    backgroundColor: '#fde047',
  },
  planBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  planPriceWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 2,
  },
  planPriceCurrency: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  planPriceNote: {
    color: '#d1d5db',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  featuresWrap: {
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  featureCheck: {
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
  },
  accentBasic: { color: '#60a5fa' },
  accentStandard: { color: '#a78bfa' },
  accentPremium: { color: '#fde047' },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#a91d3a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ctaButtonSub: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
  valuePropWrap: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  valuePropTitle: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  valuePropRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  valuePropItem: {
    color: '#4ade80',
    fontSize: 14,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 20,
    width: 340,
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: '#a91d3a',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  modalSubtitle: {
    color: '#d1d5db',
    fontSize: 13,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalContent: {
    paddingBottom: 24,
  },
  planSummaryBox: {
    backgroundColor: '#a91d3a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planSummaryName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  planSummaryPrice: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalStepTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 6,
  },
  modalStepNumber: {
    backgroundColor: '#a91d3a',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 13,
  },
  paymentTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  paymentTab: {
    flex: 1,
    backgroundColor: '#27272a',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#27272a',
    marginHorizontal: 2,
    position: 'relative',
  },
  paymentTabActive: {
    borderColor: '#a91d3a',
    backgroundColor: '#a91d3a',
  },
  paymentTabIcon: {
    width: 36,
    height: 36,
    marginBottom: 4,
    borderRadius: 8,
  },
  paymentTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentTabCheck: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: '#a91d3a',
    borderRadius: 10,
    padding: 2,
  },
  qrBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#a91d3a',
  },
  qrImage: {
    width: 160,
    height: 160,
    marginBottom: 8,
    borderRadius: 12,
  },
  qrText: {
    color: '#a91d3a',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  qrTextSmall: {
    color: '#18181b',
    fontSize: 13,
    marginBottom: 2,
  },
  qrPriceBox: {
    backgroundColor: '#a91d3a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 6,
  },
  qrPriceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  uploadBoxSelected: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  uploadText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  uploadTextSmall: {
    color: '#d1d5db',
    fontSize: 12,
  },
  uploadFileName: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#b91c1c',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  successBox: {
    backgroundColor: '#22c55e',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#a91d3a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#52525b',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonNote: {
    color: '#d1d5db',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  confirmBox: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 28,
    width: 320,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a91d3a',
  },
  confirmIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    color: '#a91d3a',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  confirmButton: {
    backgroundColor: '#a91d3a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});