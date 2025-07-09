import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MembershipStats from '../components/MembershipStats';
import MembershipTable from '../components/MembershipTable';
import MembershipModal from '../components/MembershipModal';
import { API_URL } from '../../config/env';

export default function AdminDashboardPage({ navigation }: any) {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const prevMembershipsRef = useRef<any[]>([]);

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/memberships`);
        const newMemberships = response.data;
        const prevMemberships = prevMembershipsRef.current;
        const prevIds = prevMemberships.map((m: any) => m.id).join(',');
        const newIds = newMemberships.map((m: any) => m.id).join(',');
        if (prevIds !== newIds || prevMemberships.length !== newMemberships.length) {
          setMemberships(newMemberships);
          prevMembershipsRef.current = newMemberships;
        }
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/memberships`);
      setMemberships(response.data);
    } catch (err: any) {
      setError('Error al cargar membresías');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/memberships/${id}/status`, { status: 'active' });
      fetchMemberships();
    } catch {
      Alert.alert('Error', 'Error al aprobar membresía');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/memberships/${id}/status`, { status: 'rejected' });
      fetchMemberships();
    } catch {
      Alert.alert('Error', 'Error al rechazar membresía');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: 'rgba(120,53,15,0.3)', borderColor: '#78350f', borderWidth: 1 };
      case 'active':
        return { backgroundColor: 'rgba(6,78,59,0.3)', borderColor: '#064e3b', borderWidth: 1 };
      case 'rejected':
        return { backgroundColor: 'rgba(127,29,29,0.3)', borderColor: '#7f1d1d', borderWidth: 1 };
      default:
        return { backgroundColor: 'rgba(55,65,81,0.3)', borderColor: '#374151', borderWidth: 1 };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'active': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Feather name="clock" size={14} color="#FBBF24" />;
      case 'active': return <Feather name="check-circle" size={14} color="#34D399" />;
      case 'rejected': return <Feather name="x-circle" size={14} color="#F87171" />;
      default: return <Feather name="file-text" size={14} color="#fff" />;
    }
  };

  const filteredMemberships = [...memberships]
    .filter((m) => statusFilter === 'all' ? true : m.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const totalItems = filteredMemberships.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMemberships = filteredMemberships.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#a91d3a" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerBox}>
          {/* Botón de volver arriba */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation && navigation.goBack ? navigation.goBack() : null}
            >
              <Feather name="chevron-left" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
          
          {/* Título y subtítulo */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">Panel de Membresías</Text>
            <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">Gestiona las solicitudes de membresía de los usuarios</Text>
          </View>
          
          {/* Stats Row */}
          <View style={styles.headerStatsRow}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{memberships.length}</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchMemberships}>
              <Feather name="refresh-cw" size={22} color="#fff" />
              <Text style={styles.refreshText}>Refrescar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.centeredBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando membresías...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-triangle" size={36} color="#FCA5A5" style={{ marginBottom: 12 }} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMemberships}>
              <Feather name="refresh-cw" size={18} color="#fff" />
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <MembershipStats memberships={memberships} statusFilter={statusFilter} setStatusFilter={setStatusFilter as (filter: string) => void} />
            {/* Filtros móviles */}
            <View style={styles.mobileFiltersBox}>
              <Text style={styles.mobileFiltersTitle}>Filtrar por estado:</Text>
              <View style={styles.mobileFiltersGrid}>
                {([
                  { key: 'all', label: 'Todas', icon: <Feather name="users" size={16} color="#fff" /> },
                  { key: 'pending', label: 'Pendientes', icon: <Feather name="clock" size={16} color="#fff" /> },
                  { key: 'active', label: 'Aprobadas', icon: <Feather name="check-circle" size={16} color="#fff" /> },
                  { key: 'rejected', label: 'Rechazadas', icon: <Feather name="x-circle" size={16} color="#fff" /> }
                ]).map((filter, idx) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[styles.filterButton, statusFilter === filter.key && styles.filterButtonActive]}
                    onPress={() => setStatusFilter(filter.key as any)}
                  >
                    {filter.icon}
                    <Text style={styles.filterButtonText}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <MembershipTable
              paginatedMemberships={paginatedMemberships}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              handleApprove={handleApprove}
              handleReject={handleReject}
              setModalImage={setModalImage}
              setModalOpen={setModalOpen}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={currentPage}
              goToPage={goToPage}
              generatePageNumbers={generatePageNumbers}
            />
          </View>
        )}
        <MembershipModal modalOpen={modalOpen} modalImage={modalImage} setModalOpen={setModalOpen} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#a91d3a',
  },
  container: {
    flex: 1,
    backgroundColor: '#a91d3a',
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 34, // SafeArea para el botón home
  },
  headerBox: {
    marginBottom: 18,
    paddingHorizontal: 8,
    paddingTop: 50, // Aumentado para evitar la barra de notificaciones
  },
  backButtonContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerTextContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 28,
  },
  subtitle: {
    color: '#FCA5A5',
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
  totalBox: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  totalLabel: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  centeredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185,28,28,0.18)',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginVertical: 24,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  mobileFiltersBox: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginVertical: 12,
  },
  mobileFiltersTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  mobileFiltersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#374151',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});