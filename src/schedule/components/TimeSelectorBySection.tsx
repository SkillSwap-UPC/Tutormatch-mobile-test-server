import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../utils/TextFix';

interface TimeSlotSelectorBySectionProps {
  days: string[];
  initialSelectedSlots?: { [day: string]: { [timeSlot: string]: boolean } };
  onChange: (selectedSlots: { [day: string]: { [timeSlot: string]: boolean } }) => void;
}

const TimeSlotSelectorBySection: React.FC<TimeSlotSelectorBySectionProps> = ({
  days,
  initialSelectedSlots,
  onChange
}) => {
  // Define los rangos de horas para cada sección del día
  const morningTimeSlots = ['08-09', '09-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  
  const [selectedTab, setSelectedTab] = useState<string>('morning');
  const [selectedSlots, setSelectedSlots] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>(
    initialSelectedSlots || {}
  );

  useEffect(() => {
    if (!initialSelectedSlots) {
      const initialSlots: { [day: string]: { [timeSlot: string]: boolean } } = {};
      for (let day of days) {
        initialSlots[day] = {};
        for (let timeSlot of [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots]) {
          initialSlots[day][timeSlot] = false;
        }
      }
      setSelectedSlots(initialSlots);
    }
  }, [days, initialSelectedSlots]);

  useEffect(() => {
    onChange(selectedSlots);
  }, [selectedSlots, onChange]);

  const toggleSlot = (day: string, timeSlot: string): void => {
    setSelectedSlots(prev => {
      const newSlots = { ...prev };
      if (!newSlots[day]) newSlots[day] = {};
      newSlots[day][timeSlot] = !newSlots[day][timeSlot];
      return newSlots;
    });
  };

  const isSelected = (day: string, timeSlot: string): boolean => {
    return !!selectedSlots[day]?.[timeSlot];
  };
    const renderTimeGrid = (timeSlots: string[]) => {
    return (
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.gridContainer}>
          <View style={styles.headerRow}>
            <View style={styles.emptyCell} />
            {days.map(day => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {timeSlots.map(time => (
            <View key={`row-${time}`} style={styles.timeRow}>
              <View style={styles.timeCell}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              
              {days.map(day => {
                const selected = isSelected(day, time);
                return (
                  <View key={`${day}-${time}`} style={styles.slotCellContainer}>
                    <TouchableOpacity
                      style={[
                        styles.slotButton,
                        selected ? styles.selectedSlot : styles.unselectedSlot
                      ]}
                      onPress={() => toggleSlot(day, time)}
                    >
                      {selected && (
                        <View style={styles.checkIconContainer}>
                          <MaterialIcons name="check" size={16} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs de navegación */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'morning' && styles.selectedTabButton
          ]}
          onPress={() => setSelectedTab('morning')}
        >
          <Text 
            style={[
              styles.tabText,
              selectedTab === 'morning' && styles.selectedTabText
            ]}
          >
            Mañana (08h-12h)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'afternoon' && styles.selectedTabButton
          ]}
          onPress={() => setSelectedTab('afternoon')}
        >
          <Text 
            style={[
              styles.tabText,
              selectedTab === 'afternoon' && styles.selectedTabText
            ]}
          >
            Tarde (13h-17h)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'evening' && styles.selectedTabButton
          ]}
          onPress={() => setSelectedTab('evening')}
        >
          <Text 
            style={[
              styles.tabText,
              selectedTab === 'evening' && styles.selectedTabText
            ]}
          >
            Noche (18h-22h)
          </Text>
        </TouchableOpacity>
      </View>
    
      {/* Contenido según el tab seleccionado */}
      <View style={styles.tabContent}>
        {selectedTab === 'morning' && renderTimeGrid(morningTimeSlots)}
        {selectedTab === 'afternoon' && renderTimeGrid(afternoonTimeSlots)}
        {selectedTab === 'evening' && renderTimeGrid(eveningTimeSlots)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f1f1f',
    padding: 16,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#f05c5c',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  selectedTabText: {
    color: '#f05c5c',
  },
  tabContent: {
    marginTop: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  gridContainer: {
    flexDirection: 'column',
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  emptyCell: {
    width: 60,
    flexShrink: 0,
  },
  dayHeaderCell: {
    width: 50,
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    minHeight: 44,
    width: '100%',
  },
  timeCell: {
    width: 60,
    justifyContent: 'center',
    paddingRight: 8,
    flexShrink: 0,
    flexGrow: 0,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  slotCellContainer: {
    width: 50,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    flexShrink: 0,
    flexGrow: 0,
    minWidth: 50, // Ancho mínimo fijo
    maxWidth: 50, // Ancho máximo fijo
  },
  slotButton: {
    width: 32,
    height: 32,
    minWidth: 32, // Ancho mínimo fijo
    maxWidth: 32, // Ancho máximo fijo
    minHeight: 32, // Altura mínima fija
    maxHeight: 32, // Altura máxima fija
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Previene expansión del contenido
  },
  selectedSlot: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  unselectedSlot: {
    backgroundColor: '#1f1f1f',
    borderColor: '#4b5563',
  },
  checkIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
});

export default TimeSlotSelectorBySection;