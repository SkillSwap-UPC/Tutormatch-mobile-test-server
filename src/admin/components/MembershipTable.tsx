import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface Props {
  paginatedMemberships: any[];
  getStatusBadge: (status: string) => object;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  setModalImage: (url: string) => void;
  setModalOpen: (open: boolean) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  generatePageNumbers: () => (number | string)[];
}

export default function MembershipTable({
  paginatedMemberships,
  getStatusBadge,
  getStatusIcon,
  getStatusText,
  handleApprove,
  handleReject,
  setModalImage,
  setModalOpen,
  sortOrder,
  setSortOrder
}: Props) {
  return (
    <ScrollView horizontal style={styles.tableContainer}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <View style={[styles.headerCell, styles.userColumn]}>
            <Feather name="user" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>USUARIO</Text>
          </View>
          <View style={[styles.headerCell, styles.typeColumn]}>
            <Feather name="file-text" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>TIPO</Text>
          </View>
          <View style={[styles.headerCell, styles.statusColumn]}>
            <Feather name="filter" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>ESTADO</Text>
          </View>
          <View style={[styles.headerCell, styles.proofColumn]}>
            <Feather name="image" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>COMPROBANTE</Text>
          </View>
          <View style={[styles.headerCell, styles.actionsColumn]}>
            <Feather name="settings" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>ACCIONES</Text>
          </View>
          <TouchableOpacity
            style={[styles.headerCell, styles.dateColumn]}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Feather name="calendar" size={16} color="#FCA5A5" />
            <Text style={styles.headerText}>FECHA</Text>
            {sortOrder === 'asc' ? (
              <Feather name="chevron-up" size={16} color="#FCA5A5" />
            ) : (
              <Feather name="chevron-down" size={16} color="#FCA5A5" />
            )}
          </TouchableOpacity>
        </View>
        {paginatedMemberships.length === 0 ? (
          <View style={styles.emptyRow}>
            <Feather name="file-text" size={48} color="#FCA5A5" />
            <Text style={styles.emptyTextTitle}>No hay membresías para mostrar</Text>
            <Text style={styles.emptyTextSubtitle}>Las nuevas solicitudes aparecerán aquí</Text>
          </View>
        ) : (
          paginatedMemberships.map((m) => (
            <View key={m.id} style={styles.dataRow}>
              <View style={[styles.cell, styles.userColumn]}>
                <View style={styles.userIdContainer}>
                  <Text style={styles.userIdText}>ID: {m.userId.slice(0, 8)}...</Text>
                </View>
              </View>
              <View style={[styles.cell, styles.typeColumn]}>
                <View style={styles.typeBadge}>
                  <Feather name="file-text" size={14} color="#BFDBFE" />
                  <Text style={styles.typeBadgeText}>{m.type}</Text>
                </View>
              </View>
              <View style={[styles.cell, styles.statusColumn]}>
                <View style={[styles.statusBadge, getStatusBadge(m.status)]}>
                  {getStatusIcon(m.status)}
                  <Text style={styles.statusBadgeText}>{getStatusText(m.status)}</Text>
                </View>
              </View>
              <View style={[styles.cell, styles.proofColumn]}>
                {m.paymentProof ? (
                  <TouchableOpacity
                    style={styles.proofButton}
                    onPress={() => {
                      setModalImage(m.paymentProof);
                      setModalOpen(true);
                    }}
                  >
                    <Feather name="eye" size={16} color="#fff" />
                    <Text style={styles.proofButtonText}>Ver comprobante</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noProofBadge}>
                    <Feather name="x" size={16} color="#D1D5DB" />
                    <Text style={styles.noProofText}>No adjunto</Text>
                  </View>
                )}
              </View>
              <View style={[styles.cell, styles.actionsColumn]}>
                {m.status === 'pending' ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApprove(m.id)}
                    >
                      <Feather name="check" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleReject(m.id)}
                    >
                      <Feather name="x" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, getStatusBadge(m.status)]}>
                    {getStatusIcon(m.status)}
                    <Text style={styles.statusBadgeText}>{getStatusText(m.status)}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.cell, styles.dateColumn]}>
                <Text style={styles.dateText}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
    minHeight: 200,
  },
  table: {
    minWidth: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  // Columnas con anchos específicos
  userColumn: {
    width: 180,
  },
  typeColumn: {
    width: 120,
  },
  statusColumn: {
    width: 130,
  },
  proofColumn: {
    width: 180,
  },
  actionsColumn: {
    width: 200,
  },
  dateColumn: {
    width: 150,
  },
  headerText: {
    color: '#FCA5A5',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
  },
  cell: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginRight: 8,
  },
  userIdText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderColor: '#1e40af',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  proofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    alignSelf: 'flex-start',
  },
  proofButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  noProofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55,65,81,0.3)',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    alignSelf: 'flex-start',
  },
  noProofText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  actionRow: {
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    justifyContent: 'center',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  dateText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyTextTitle: {
    color: '#FCA5A5',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyTextSubtitle: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
});