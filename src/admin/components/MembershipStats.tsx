import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface Props {
  memberships: any[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

const statsConfig = [
  {
    label: 'Todas',
    filter: 'all',
    icon: <Feather name="users" size={24} color="#fff" />,
    bgColor: '#37415199',
    borderColor: '#374151',
  },
  {
    label: 'Pendientes',
    filter: 'pending',
    icon: <Feather name="clock" size={24} color="#fff" />,
    bgColor: '#78350f99',
    borderColor: '#78350f',
  },
  {
    label: 'Aprobadas',
    filter: 'active',
    icon: <Feather name="check-circle" size={24} color="#fff" />,
    bgColor: '#064e3b99',
    borderColor: '#064e3b',
  },
  {
    label: 'Rechazadas',
    filter: 'rejected',
    icon: <Feather name="x-circle" size={24} color="#fff" />,
    bgColor: '#7f1d1d99',
    borderColor: '#7f1d1d',
  },
];

export default function MembershipStats({ memberships, statusFilter, setStatusFilter }: Props) {
  return (
    <View style={styles.grid}>
      {statsConfig.map((stat) => {
        const value =
          stat.filter === 'all'
            ? memberships.length
            : memberships.filter((m) => m.status === stat.filter).length;
        const isActive = statusFilter === stat.filter;
        return (
          <TouchableOpacity
            key={stat.filter}
            style={[
              styles.card,
              isActive && { borderColor: '#fff', borderWidth: 2, backgroundColor: stat.bgColor },
              !isActive && { borderColor: 'rgba(255,255,255,0.12)' },
            ]}
            activeOpacity={0.8}
            onPress={() => setStatusFilter(stat.filter)}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.label}>{stat.label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
              <View style={styles.iconContainer}>{stat.icon}</View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    flexBasis: '48%',
    marginBottom: 12,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginLeft: 8,
    opacity: 0.8,
  },
});
