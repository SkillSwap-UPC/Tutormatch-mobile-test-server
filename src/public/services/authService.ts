import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config/env';
import { supabase } from "../../lib/supabase/client";
import { User } from "../../user/types/User";

export class AuthService {
    /**
     * Guarda el ID del usuario actual en AsyncStorage
     */
    static async setCurrentUser(userId: string): Promise<void> {
        try {
            await AsyncStorage.setItem('currentUserId', userId);
        } catch (error) {
            console.error('Error al guardar userId en AsyncStorage:', error);
        }
    }

    /**
     * Obtiene el ID del usuario actual desde AsyncStorage
     */
    static async getCurrentUserId(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('currentUserId');
        } catch (error) {
            console.error('Error al obtener userId de AsyncStorage:', error);
            return null;
        }
    }

    /**
     * Guarda el rol del usuario actual en el almacenamiento local
     */
    static async setCurrentUserRole(role: string): Promise<void> {
        try {
            await AsyncStorage.setItem('currentUserRole', role);
        } catch (error) {
            console.error('Error al obtener userId de AsyncStorage:', error);
        }
    }

    /**
     * Obtiene el rol del usuario actual desde el almacenamiento local
     */
    static async getCurrentUserRole(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('currentUserRole');
        } catch (error) {
            console.error('Error al obtener userId de AsyncStorage:', error);
            return null;
        }    }


    /**
     * Elimina el ID del usuario actual de AsyncStorage
     */
    static async clearCurrentUser(): Promise<void> {
        try {
            const keysToRemove = ['currentUserId', 'pendingRegistration', 'auth_token'];
            await AsyncStorage.multiRemove(keysToRemove);
        } catch (error) {
            console.error('Error al limpiar datos de usuario de AsyncStorage:', error);
        }
    }

    /**
     * Obtiene el perfil completo del usuario actual
     */
    static async getCurrentUserProfile(): Promise<User | null> {
        const userId = await this.getCurrentUserId();
        if (!userId) return null;

        try {
            // Primero intentamos obtener el perfil desde la API
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/profiles`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data) {
                        return new User({
                            id: response.data.id,
                            email: response.data.email,
                            firstName: response.data.firstName,
                            lastName: response.data.lastName,
                            role: response.data.role,
                            avatar: response.data.avatar,
                            status: response.data.status,
                            semesterNumber: response.data.semesterNumber,
                            academicYear: response.data.academicYear,
                            bio: response.data.bio,
                            tutorId: response.data.tutorId,
                            phone: response.data.phone,
                            createdAt: new Date(response.data.createdAt),
                            updatedAt: new Date(response.data.updatedAt)
                        });
                    }
                } catch (error) {
                    console.error('Error al obtener perfil desde API:', error);
                    // Si falla, caemos back al método de Supabase
                }
            }

            // Si no hay token o falló la petición, usamos Supabase como fallback
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !data) return null;

            return new User({
                id: data.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                role: data.role,
                avatar: data.avatar,
                status: data.status,
                semesterNumber: data.semester_number,
                academicYear: data.academic_year,
                bio: data.bio,
                tutorId: data.tutor_id,
                phone: data.phone,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            return null;
        }
    }

    /**
     * Actualiza el perfil del usuario
     */
    static async updateProfile(userId: string, profileData: Partial<User>): Promise<{ success: boolean, message: string }> {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                try {
                    // Intentar actualizar usando la API
                    await axios.patch(`${API_URL}/profile`, profileData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    return {
                        success: true,
                        message: 'Perfil actualizado correctamente'
                    };
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        await AsyncStorage.removeItem('auth_token');
                    }
                    throw error;
                }
            }

            const dbProfileData = {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                avatar: profileData.avatar,
                semester_number: profileData.semesterNumber,
                academic_year: profileData.academicYear,
                bio: profileData.bio,
                phone: profileData.phone,
                tutor_id: profileData.tutorId,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update(dbProfileData)
                .eq('id', userId);

            if (error) {
                return {
                    success: false,
                    message: error.message || 'Error al actualizar el perfil'
                };
            }

            return {
                success: true,
                message: 'Perfil actualizado correctamente'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Error inesperado al actualizar el perfil'
            };
        }
    }

    /**
     * Comprueba si un correo electrónico ha sido verificado 
     * (Modificado para supabase-js@1.35.7 que no incluye admin.listUsers)
     */
    static async isEmailVerified(email: string): Promise<boolean> {
        try {
            // En v1.35.7 no existe admin.listUsers, verificamos intentando iniciar sesión
            // Este método no es tan fiable pero es la mejor aproximación con esta versión
            const session = supabase.auth.session();

            if (session?.user?.email === email) {
                return true; // Si ya hay sesión con ese email, está verificado
            }

            // Como fallback, podemos verificar si el usuario existe en la tabla profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (data && !error) {
                return true; // Si existe en profiles, consideramos que está verificado
            }

            return false;
        } catch (error) {
            console.error('Error al verificar estado del correo:', error);
            return false;
        }
    }

    /**
     * Obtiene el token JWT almacenado
     */
    static async getAuthToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            console.error('Error al obtener auth_token de AsyncStorage:', error);
            return null;
        }
    }

    /**
     * Establece la sesión del usuario
     */
    static async setUserSession(userId: string, token: string): Promise<void> {
        try {
            await AsyncStorage.setItem('currentUserId', userId);
            await AsyncStorage.setItem('auth_token', token);
        } catch (error) {
            console.error('Error al establecer sesión en AsyncStorage:', error);
        }
    }

    /**
     * Verifica si hay una sesión activa comprobando token y userId
     */
    static async hasActiveSession(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userId = await AsyncStorage.getItem('currentUserId');

            // También verificamos con Supabase directamente (compatible con v1.35.7)
            const supabaseSession = supabase.auth.session();

            return !!(token && userId) || !!supabaseSession;
        } catch (error) {
            console.error('Error al verificar sesión activa:', error);
            return false;
        }
    }
}