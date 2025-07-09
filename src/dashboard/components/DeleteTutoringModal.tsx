import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener expo/vector-icons instalado
import React, { useState } from 'react';
import { Text } from '../../utils/TextFix';

import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TutoringSession } from '../../tutoring/types/Tutoring';

interface DeleteTutoringModalProps {
    visible: boolean;
    onHide: () => void;
    onDelete: () => Promise<void>;
    tutoring: TutoringSession | null;
}

const DeleteTutoringModal: React.FC<DeleteTutoringModalProps> = ({
    visible,
    onHide,
    onDelete,
    tutoring
}) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDeleteConfirm = async () => {
        if (!tutoring) return;

        setIsDeleting(true);
        try {
            await onDelete();
            // El manejo del éxito ocurre en el componente padre
        } catch (error) {
            console.error('Error al eliminar tutoría:', error);
            // El manejo del error ocurre en el componente padre
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onHide}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Eliminar Tutoría</Text>
                        <TouchableOpacity onPress={onHide}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentContainer}>
                        {/* Título con ícono */}
                        <View style={styles.titleContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="warning" size={28} color="#F05C5C" />
                            </View>
                            <Text style={styles.title}>¿Eliminar esta tutoría?</Text>
                        </View>

                        {/* Información de la tutoría */}
                        {tutoring && (
                            <View style={styles.tutoringInfo}>
                                <Text style={styles.tutoringTitle}>{tutoring.title}</Text>
                            </View>
                        )}

                        <Text style={styles.description}>
                            Esta acción eliminará permanentemente la tutoría, incluyendo:
                        </Text>

                        {/* Elementos que se eliminarán */}
                        <View style={styles.itemsGrid}>
                            <View style={styles.gridItem}>
                                <Ionicons name="calendar" size={18} color="#9CA3AF" style={styles.itemIcon} />
                                <Text style={styles.itemText}>Horarios disponibles</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Ionicons name="star" size={18} color="#9CA3AF" style={styles.itemIcon} />
                                <Text style={styles.itemText}>Reseñas asociadas</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Ionicons name="book" size={18} color="#9CA3AF" style={styles.itemIcon} />
                                <Text style={styles.itemText}>Materiales de estudio</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Ionicons name="image" size={18} color="#9CA3AF" style={styles.itemIcon} />
                                <Text style={styles.itemText}>Imagen de la tutoría</Text>
                            </View>
                        </View>

                        {/* Advertencia */}
                        <View style={styles.warningContainer}>
                            <Ionicons name="information-circle" size={18} color="#F05C5C" style={styles.itemIcon} />
                            <Text style={styles.warningText}>Esta acción no se puede deshacer.</Text>
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                                ) : (
                                    <Ionicons name="trash" size={18} color="white" style={styles.buttonIcon} />
                                )}
                                <Text style={styles.buttonText}>
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        width: '90%',
        maxWidth: 450,
        backgroundColor: '#1e1f1e',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#121212',
        borderBottomWidth: 1,
        borderBottomColor: '#2e2e2e'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white'
    },
    contentContainer: {
        padding: 20
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    iconContainer: {
        backgroundColor: 'rgba(240, 92, 92, 0.1)',
        padding: 12,
        borderRadius: 25,
        marginRight: 12
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    tutoringInfo: {
        backgroundColor: '#121212',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2e2e2e'
    },
    tutoringTitle: {
        color: 'white',
        fontWeight: '500'
    },
    description: {
        color: '#9CA3AF',
        marginBottom: 16
    },
    itemsGrid: {
        marginBottom: 20
    },
    gridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8
    },
    itemIcon: {
        marginRight: 8
    },
    itemText: {
        color: '#9CA3AF'
    },
    warningContainer: {
        backgroundColor: '#121212',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(240, 92, 92, 0.3)',
        flexDirection: 'row',
        alignItems: 'center'
    },
    warningText: {
        color: '#9CA3AF',
        fontSize: 14
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    deleteButton: {
        backgroundColor: '#F05C5C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6
    },
    buttonIcon: {
        marginRight: 8
    },
    buttonText: {
        color: 'white',
        fontWeight: '500'
    }
});

export default DeleteTutoringModal;