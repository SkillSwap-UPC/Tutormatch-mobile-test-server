import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Text } from '../../utils/TextFix';

import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Course } from '../../course/types/Course';
import { SemesterService } from '../../dashboard/services/SemesterService';
import TimeSlotSelectorBySection from '../../schedule/components/TimeSelectorBySection';
import { TutoringImageService } from '../../tutoring/services/TutoringImageService';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { User } from '../../user/types/User';

// Props para el componente modal
interface EditTutoringModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (tutoring: any) => void;
  currentUser: User;
  tutoring: TutoringSession;
}

const EditTutoringModal: React.FC<EditTutoringModalProps> = ({
  visible,
  onHide,
  onSave,
  currentUser,
  tutoring
}) => {
  // Estado para los semestres y cursos
  const [semesters, setSemesters] = useState<{ id: number; name: string; courses: Course[] }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);

  // Estado del formulario
  const [description, setDescription] = useState<string>(tutoring.description || '');
  const [price, setPrice] = useState<number>(tutoring.price || 0);
  const [whatTheyWillLearn, setWhatTheyWillLearn] = useState<string>('');
  const [courseImage, setCourseImage] = useState<string | undefined | null>(tutoring.imageUrl);
  const [imageInfo, setImageInfo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(true); // Por defecto true en edición
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{severity: 'success' | 'error' | 'info', summary: string, detail: string} | null>(null);

  // Franjas horarias y días de la semana
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayMapping: Record<string, number> = {
    'SUN': 0,
    'MON': 1,
    'TUE': 2,
    'WED': 3,
    'THU': 4,
    'FRI': 5,
    'SAT': 6
  };
  const dayInverseMapping: Record<number, string> = {
    0: 'SUN',
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT'
  };
  const morningTimeSlots = ['08-09', '09-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  const allTimeSlots = [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots];
  const [availableTimes, setAvailableTimes] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>({});

  // Mostrar toast
  const showToast = (severity: 'success' | 'error' | 'info', summary: string, detail: string) => {
    setToastMessage({ severity, summary, detail });
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cargar los semestres desde el servicio
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await SemesterService.getSemesters();
        setSemesters(data);
        
        // Buscar el semestre del curso actual
        if (tutoring.courseId) {
          for (const semester of data) {
            const course = semester.courses.find((c: Course) => c.id === tutoring.courseId);
            if (course) {
              setSelectedSemester(semester.name);
              setAvailableCourses(semester.courses);
              setSelectedCourse(course);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        showToast('error', 'Error', 'No se pudieron cargar los semestres.');
      }
    };

    fetchSemesters();
  }, [tutoring.courseId]);

  // Inicializar las franjas horarias con los datos existentes
  useEffect(() => {
    initializeTimeSlots();
    
    // Convertir el array whatTheyWillLearn a string para el textarea
    if (Array.isArray(tutoring.whatTheyWillLearn)) {
      setWhatTheyWillLearn(tutoring.whatTheyWillLearn.join('\n'));
    } else if (typeof tutoring.whatTheyWillLearn === 'object' && tutoring.whatTheyWillLearn !== null) {
      setWhatTheyWillLearn(Object.values(tutoring.whatTheyWillLearn).join('\n'));
    }
  }, [tutoring]);

  // Verificar validez del formulario cuando cambian los valores
  useEffect(() => {
    checkFormValidity();
  }, [selectedSemester, selectedCourse, description, price, whatTheyWillLearn, courseImage, availableTimes]);

  // Inicializar slots de tiempo con los datos de la tutoría
  const initializeTimeSlots = () => {
    const times: { [day: string]: { [timeSlot: string]: boolean } } = {};
    
    // Inicializar todos los días y slots a false
    for (let day of daysOfWeek) {
      times[day] = {};
      for (let timeSlot of allTimeSlots) {
        times[day][timeSlot] = false;
      }
    }
    
    // Marcar los slots disponibles según la tutoría existente
    if (tutoring.availableTimes && tutoring.availableTimes.length > 0) {
      tutoring.availableTimes.forEach(slot => {
        try {
          // Obtener el día y hora
          let dayIndex = -1;
          
          if (typeof slot.dayOfWeek === 'number') {
            dayIndex = slot.dayOfWeek;
          } else if (typeof slot.day_of_week === 'number') {
            dayIndex = slot.day_of_week;
          } else if (typeof slot.dayOfWeek === 'string') {
            dayIndex = parseInt(slot.dayOfWeek);
          } else if (typeof slot.day_of_week === 'string') {
            dayIndex = parseInt(slot.day_of_week);
          }
          
          if (dayIndex >= 0 && dayIndex <= 6) {
            const day = dayInverseMapping[dayIndex];
            
            // Extraer la hora de inicio y fin
            const startHour = slot.startTime ? parseInt(slot.startTime.split(':')[0]) :
                             slot.start_time ? parseInt(slot.start_time.split(':')[0]) : -1;
            
            const endHour = slot.endTime ? parseInt(slot.endTime.split(':')[0]) :
                           slot.end_time ? parseInt(slot.end_time.split(':')[0]) : -1;
            
            if (startHour >= 0 && endHour >= 0) {
              const timeSlot = `${startHour}-${endHour}`;
              
              // Si el slot existe en nuestro array de slots, marcarlo como disponible
              if (times[day] && allTimeSlots.includes(timeSlot)) {
                times[day][timeSlot] = true;
              }
            }
          }
        } catch (error) {
          console.error('Error al procesar horario disponible:', error, slot);
        }
      });
    }
    
    setAvailableTimes(times);
  };

  // Manejar selección de semestre
  const onSemesterSelected = (semesterName: string) => {
    setSelectedSemester(semesterName);
    const selectedSemesterObj = semesters.find((sem) => sem.name === semesterName);
    setAvailableCourses(selectedSemesterObj ? selectedSemesterObj.courses : []);
    if (!selectedSemesterObj?.courses.find(c => c.id === selectedCourse?.id)) {
      setSelectedCourse(null);
    }
  };

  // Validar formulario
  const checkFormValidity = () => {
    const valid =
      selectedSemester !== '' &&
      selectedCourse !== null &&
      description !== '' &&
      price > 0 &&
      whatTheyWillLearn !== '' &&
      (courseImage !== undefined || imageInfo !== null) &&
      areTimeSlotsSelected();

    setIsFormValid(valid);
  };

  // Verificar si hay slots de tiempo seleccionados
  const areTimeSlotsSelected = (): boolean => {
    for (let day of daysOfWeek) {
      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          return true;
        }
      }
    }
    return false;
  };

  // Seleccionar imagen desde la galería
  const pickImage = async () => {
    try {
      // Solicitar permisos primero
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMessage('Se necesitan permisos para acceder a la galería de imágenes');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        
        // Verificar tamaño si está disponible
        if (selectedAsset.fileSize && selectedAsset.fileSize > 5 * 1024 * 1024) {
          setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.');
          return;
        }

        setImageInfo(selectedAsset);
        setCourseImage(selectedAsset.uri);
        setImageUploaded(true);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setErrorMessage('Error al seleccionar la imagen. Intente de nuevo.');
    }
  };

  const onConfirmEditTutoring = async () => {
    if (!isFormValid || !selectedCourse) return;

    try {
      setIsSubmitting(true);

      // 1. Preparar el formato del campo whatTheyWillLearn
      const formattedWhatTheyWillLearn = whatTheyWillLearn
        .split('\n')
        .map(item => item.trim())
        .filter(item => item);

      // 2. Preparar los horarios disponibles en el formato correcto
      const availableTimeSlots = [];
      for (let day of daysOfWeek) {
        for (let timeSlot of allTimeSlots) {
          if (availableTimes[day]?.[timeSlot]) {
            const [start, end] = timeSlot.split('-');

            availableTimeSlots.push({
              dayOfWeek: dayMapping[day],
              startTime: `${start}:00`,
              endTime: `${end}:00`
            });
          }
        }
      }

      // 3. Subir la imagen si se ha cambiado
      let imageUrl = courseImage;
      if (imageInfo) {
        setUploadingImage(true);
        try {
          // Preparar la información de la imagen para subirla
          const imageInfoForUpload = {
            uri: imageInfo.uri,
            type: `image/${imageInfo.uri.split('.').pop()}`,
            name: `tutoring-${tutoring.id}-${Date.now()}.${imageInfo.uri.split('.').pop()}`
          };
          
          imageUrl = await TutoringImageService.uploadTutoringImage(tutoring.id, imageInfoForUpload);
          console.log('Imagen subida correctamente:', imageUrl);
        } catch (imageError: any) {
          console.error('Error al subir la imagen:', imageError);
          
          showToast('error', 'Error', 
            imageError.message || 'No se pudo subir la imagen. Continuando con la actualización de la tutoría.');
          
          // Mantener la imagen anterior si hay error
          imageUrl = tutoring.imageUrl;
        } finally {
          setUploadingImage(false);
        }
      }

      // 4. Crear el objeto de tutoría con todos los datos actualizados
      const updatedTutoring = {
        id: tutoring.id,
        tutorId: currentUser.id,
        courseId: selectedCourse.id,
        title: selectedCourse.name,
        description,
        price: Number(price),
        whatTheyWillLearn: formattedWhatTheyWillLearn,
        imageUrl,
        availableTimes: availableTimeSlots
      };

      console.log('Enviando datos actualizados de tutoría:', updatedTutoring);

      // 5. Actualizar la tutoría con el servicio
      const result = await TutoringService.updateTutoring(tutoring.id, updatedTutoring);

      // 6. Mostrar mensaje de éxito
      showToast('success', 'Éxito', 'Tutoría actualizada correctamente.');

      onSave(result);
      onHide();

    } catch (error: any) {
      console.error('Error al actualizar la tutoría:', error);

      // Mensaje de error más descriptivo
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo actualizar la tutoría. Por favor, revise los datos e inténtelo de nuevo.';

      showToast('error', 'Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar toast mensaje si existe
  const renderToast = () => {
    if (!toastMessage) return null;
    
    const backgroundColor = 
      toastMessage.severity === 'success' ? '#16a34a' :
      toastMessage.severity === 'error' ? '#dc2626' : '#0284c7';
    
    return (
      <View style={[styles.toast, { backgroundColor }]}>
        <Text style={styles.toastTitle}>{toastMessage.summary}</Text>
        <Text style={styles.toastMessage}>{toastMessage.detail}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onHide}
      statusBarTranslucent={true}
    >
      {renderToast()}
      
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar Tutoría</Text>
            <TouchableOpacity onPress={onHide}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.contentContainer}>
              {/* Selector de semestre */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Semestre del curso</Text>
                <View style={styles.semesterGrid}>
                  {semesters.map((semester) => (
                    <TouchableOpacity
                      key={semester.id}
                      onPress={() => onSemesterSelected(semester.name)}
                      style={[
                        styles.semesterButton,
                        selectedSemester === semester.name && styles.selectedSemesterButton
                      ]}
                    >
                      <Text style={[
                        styles.semesterButtonText,
                        selectedSemester === semester.name && styles.selectedSemesterButtonText
                      ]}>
                        {semester.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selector de curso */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nombre del curso</Text>
                <TouchableOpacity 
                  style={styles.courseDropdownButton}
                  onPress={() => setShowCourseDropdown(!showCourseDropdown)}
                >
                  <Text style={styles.courseDropdownButtonText}>
                    {selectedCourse ? selectedCourse.name : 'Seleccionar curso'}
                  </Text>
                  <Ionicons 
                    name={showCourseDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                
                {showCourseDropdown && (
                  <View style={styles.dropdownContent}>
                    <ScrollView style={styles.courseList} nestedScrollEnabled={true}>
                      {availableCourses.map((course) => (
                        <TouchableOpacity
                          key={course.id}
                          style={styles.courseItem}
                          onPress={() => {
                            setSelectedCourse(course);
                            setShowCourseDropdown(false);
                          }}
                        >
                          <Text style={styles.courseItemText}>{course.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Descripción del curso */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  placeholder="Ingresa la descripción de tu tutoría"
                  placeholderTextColor="#6B7280"
                  style={styles.textArea}
                />
              </View>

              {/* Precio del curso */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Precio</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceCurrency}>S/.</Text>
                  <TextInput
                    value={price.toString()}
                    onChangeText={(value) => {
                      const numValue = parseFloat(value);
                      setPrice(isNaN(numValue) ? 0 : numValue);
                    }}
                    keyboardType="numeric"
                    placeholder="Ingresa el precio"
                    placeholderTextColor="#6B7280"
                    style={styles.priceInput}
                  />
                </View>
              </View>

              {/* Imagen del curso */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Imagen del curso</Text>
                
                {!imageInfo && courseImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: courseImage }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageButtonsContainer}>
                      <TouchableOpacity
                        style={styles.imageButton}
                        onPress={pickImage}
                      >
                        <Text style={styles.imageButtonText}>Cambiar imagen</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.imageButton, styles.removeButton]}
                        onPress={() => {
                          setCourseImage(undefined);
                          setImageInfo(null);
                          setImageUploaded(false);
                        }}
                      >
                        <Text style={styles.imageButtonText}>Quitar imagen</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    {imageInfo ? (
                      <View style={styles.imagePreviewContainer}>
                        {uploadingImage && (
                          <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="large" color="#f05c5c" />
                          </View>
                        )}
                        <Image
                          source={{ uri: imageInfo.uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        
                        <TouchableOpacity
                          style={[styles.imageButton, styles.removeButton]}
                          onPress={() => {
                            setCourseImage(tutoring.imageUrl);
                            setImageInfo(null);
                            setImageUploaded(false);
                            setErrorMessage('');
                          }}
                          disabled={uploadingImage}
                        >
                          <Text style={styles.imageButtonText}>Cancelar cambio</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickImage}
                        disabled={uploadingImage}
                      >
                        <Ionicons name="cloud-upload" size={24} color="white" />
                        <Text style={styles.uploadButtonText}>Subir imagen</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {imageUploaded && (
                  <Text style={styles.successText}>Imagen lista para subir</Text>
                )}
                
                {errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
              </View>

              {/* Qué aprenderán */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>¿Qué aprenderán?</Text>
                <TextInput
                  value={whatTheyWillLearn}
                  onChangeText={setWhatTheyWillLearn}
                  multiline
                  numberOfLines={4}
                  placeholder="Ingresa lo que aprenderán tus estudiantes"
                  placeholderTextColor="#6B7280"
                  style={styles.textArea}
                />
                <Text style={styles.helperText}>Separa cada punto de aprendizaje con un salto de línea</Text>
              </View>

              {/* Horarios disponibles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tus horarios disponibles</Text>
                <Text style={styles.helperText}>Haz clic en las franjas horarias para marcar tu disponibilidad</Text>

                <TimeSlotSelectorBySection
                  days={daysOfWeek}
                  initialSelectedSlots={availableTimes}
                  onChange={(newSelectedSlots) => {
                    setAvailableTimes(newSelectedSlots);
                  }}
                />
              </View>

              {/* Botón para guardar cambios */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!isFormValid || isSubmitting || uploadingImage) && styles.disabledButton
                  ]}
                  onPress={onConfirmEditTutoring}
                  disabled={!isFormValid || isSubmitting || uploadingImage}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingButton}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.buttonText}>Guardando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Guardar cambios</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: '100%',
    height: '100%'
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e2e'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  scrollView: {
    flex: 1,
    width: '100%'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  semesterButton: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    alignItems: 'center'
  },
  selectedSemesterButton: {
    backgroundColor: '#f05c5c',
    borderColor: '#f05c5c'
  },
  semesterButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  selectedSemesterButtonText: {
    color: 'white'
  },
  courseDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6
  },
  courseDropdownButtonText: {
    color: 'white'
  },
  dropdownContent: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200
  },
  courseList: {
    paddingHorizontal: 4
  },
  courseItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563'
  },
  courseItemText: {
    color: 'white'
  },
  textArea: {
    backgroundColor: '#1f1f1f',
    color: 'white',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 120
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceCurrency: {
    color: 'white',
    fontSize: 16,
    marginRight: 8
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    color: 'white',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    padding: 12
  },
  imagePreviewContainer: {
    marginVertical: 12,
    position: 'relative'
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 6
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  imageButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  removeButton: {
    backgroundColor: '#f05c5c'
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  uploadButton: {
    backgroundColor: '#f05c5c',
    padding: 16,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8
  },
  successText: {
    color: '#10B981',
    marginTop: 8
  },
  errorText: {
    color: '#EF4444',
    marginTop: 8
  },
  helperText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'flex-end'
  },
  saveButton: {
    backgroundColor: '#f05c5c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6
  },
  disabledButton: {
    backgroundColor: '#6B7280',
    opacity: 0.7
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 10,
  },
  toastTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4
  },
  toastMessage: {
    color: 'white'
  }
});

export default EditTutoringModal;