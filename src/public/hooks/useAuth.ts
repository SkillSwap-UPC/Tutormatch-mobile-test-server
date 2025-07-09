import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../../config/env';
import { supabase } from '../../lib/supabase/client';
import { User, UserRole, UserStatus } from '../../user/types/User';
import { AuthService } from '../services/authService';

class TokenStorage {
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Cargar el token al iniciar
  useEffect(() => {
    async function loadToken() {
      const storedToken = await TokenStorage.getToken();
      setToken(storedToken);
    }
    loadToken();
  }, []);

  // Configurar axios para incluir el token en las solicitudes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    // En v1.35.7, onAuthStateChange devuelve un objeto con método unsubscribe
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          // Almacenamos el token para futuras solicitudes
          await TokenStorage.setToken(currentSession.access_token);
          setToken(currentSession.access_token);
          await fetchUserProfile(currentSession.user?.id);
        } else {
          setSession(null);
          setUser(null);
          await TokenStorage.removeToken();
          setToken(null);
        }
        setLoading(false);
      }
    );

    // En el useEffect de verificación de sesión
    const checkCurrentSession = async () => {
      try {
        // En v1.35.7 para React Native, verificamos la sesión de esta forma:
        const session = supabase.auth.session();

        if (session && session.access_token) {
          setSession(session);
          await TokenStorage.setToken(session.access_token);
          setToken(session.access_token);

          if (session.user?.id) {
            await AuthService.setCurrentUser(session.user.id);
            await fetchUserProfile(session.user.id);
          }
        } else {
          // No hay sesión válida
          setSession(null);
          setUser(null);
          await TokenStorage.removeToken();
          setToken(null);
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        // Limpiar estado en caso de error
        setSession(null);
        setUser(null);
        await TokenStorage.removeToken();
        setToken(null);
      }

      setLoading(false);
    };

    checkCurrentSession();

    return () => {
      // En v1.35.7, la suscripción se cancela de manera diferente
      authListener?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId?: string): Promise<User | null> => {
    if (!userId) return null;

    try {
      console.log('Obteniendo perfil para usuario ID:', userId);
      AsyncStorage.setItem('currentUserId', userId);
      
      try {
        // Consulta segura que no debería usar localStorage directamente
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        console.log('Respuesta de consulta de perfil:', { 
          tieneError: !!error, 
          tieneDatos: !!data 
        });

        if (error) {
          console.error('Error al obtener el perfil:', error);
          return null;
        }

        if (data) {
          console.log('Datos de perfil encontrados, construyendo objeto User');
          
          const userProfile = new User({
            id: userId,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role as UserRole,
            avatar: data.avatar,
            status: data.status as UserStatus,
            semesterNumber: data.semester_number,
            academicYear: data.academic_year || '',
            bio: data.bio || '',
            phone: data.phone,
            tutorId: data.tutor_id || '',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });

          console.log('Objeto User construido correctamente');
          setUser(userProfile);
          await AuthService.setCurrentUser(userId);
          return userProfile;
        } else {
          console.log('No se encontraron datos de perfil para el usuario');
          return null;
        }
      } catch (queryError) {
        console.error('Error específico en la consulta:', queryError);
        return null;
      }
    } catch (error) {
      console.error('Error en fetchUserProfile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean, message: string, user?: User }> => {
    try {
      console.log('Intentando iniciar sesión con:', email);
      console.log('URL de la API:', `${API_URL}/auth/login`);

      // Añadir diagnóstico adicional
      try {
        // Verificar que la API está accesible
        const testResponse = await axios.get(`${API_URL}/health`, { timeout: 10000 });
        console.log('API health check:', testResponse.status);
      } catch (healthError) {
        console.warn('No se pudo verificar el estado de la API:', healthError);
      }

      // Modificar la solicitud para incluir opciones adicionales
      const response = await axios.post(`${API_URL}/auth/login`,
        { email, password },
        {
          timeout: 15000, // Aumentar el timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Respuesta recibida del servidor:', {
        status: response.status,
        headers: response.headers,
        dataStructure: response.data ? Object.keys(response.data) : 'No data'
      });

      if (response.data && response.data.session) {
        // Guardar el token JWT
        const newToken = response.data.session.access_token;
        await TokenStorage.setToken(newToken);
        setToken(newToken);

        if (response.data.user && response.data.user.id) {
          await AuthService.setCurrentUser(response.data.user.id);
        }

        try {
          const { error: signInError } = await supabase.auth.signIn({
            email,
            password
          });

          if (signInError) {
            console.warn('Error al establecer la sesión en Supabase:', signInError);
          }
        } catch (supabaseError) {
          console.warn('Error al establecer sesión en Supabase:', supabaseError);
        }

        let userProfile: User | null = null;

        if (response.data.user && response.data.user.id) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', response.data.user.id)
              .single();
            // Usar el rol de la tabla profiles, no del objeto user de auth
            if (data && !error) {
              AuthService.setCurrentUserRole(data.role);
              console.log('Rol del usuario establecido LOGIN:', data.role);
              userProfile = new User({
                id: response.data.user.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                role: data.role as UserRole,
                avatar: data.avatar,
                status: data.status as UserStatus,
                semesterNumber: data.semester_number,
                academicYear: data.academic_year || '',
                bio: data.bio || '',
                phone: data.phone,
                tutorId: data.tutor_id || '',
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
              });
              setUser(userProfile);
            }
          } catch (profileError) {
            console.error('Error al cargar el perfil:', profileError);
            // Continuamos aunque falle la obtención del perfil
          }
        }

        return {
          success: true,
          message: 'Inicio de sesión exitoso',
          user: userProfile || undefined
        };
      } else {
        console.log('Estructura de respuesta inválida:', JSON.stringify(response.data, null, 2));
        return {
          success: false,
          message: 'Error al iniciar sesión. Respuesta inválida del servidor.'
        };
      }
    } catch (error: any) {
      // Mejora el diagnóstico de errores
      if (error.response) {
        // La petición fue realizada y el servidor respondió con un código de estado
        // que no está en el rango 2xx
        console.error('Error HTTP:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        return {
          success: false,
          message: error.response?.data?.message ||
            `Error del servidor (${error.response.status}): Verifica tus credenciales`
        };
      } else if (error.request) {
        // La petición fue realizada pero no se recibió respuesta
        console.error('No se recibió respuesta:', error.request);
        return {
          success: false,
          message: 'No se pudo contactar con el servidor. Verifica tu conexión a internet.'
        };
      } else {
        // Algo ocurrió durante la configuración de la petición que disparó un error
        console.error('Error de configuración:', error.message);
        return {
          success: false,
          message: 'Error al configurar la solicitud: ' + error.message
        };
      }
    }
  };

  const signInDirectWithSupabase = async (email: string, password: string): Promise<{ success: boolean, message: string, user?: User }> => {
    try {
      console.log('Intentando inicio de sesión directo con Supabase...');

      // En v1.35.7, la sintaxis es así
      const { user: supabaseUser, error } = await supabase.auth.signIn({
        email,
        password
      });

      if (error) {
        console.error('Error de Supabase:', error);
        return {
          success: false,
          message: error.message || 'Error de autenticación'
        };
      }

      if (supabaseUser) {
        console.log('Usuario autenticado con Supabase:', supabaseUser.id);

        // Obtener el token de la sesión
        try {
          const session = supabase.auth.session();
          if (session && session.access_token) {
            await TokenStorage.setToken(session.access_token);
            setToken(session.access_token);
          }
        } catch (sessionError) {
          console.error('Error al obtener sesión:', sessionError);
        }

        // Obtener el perfil de forma segura
        try {
          console.log('Intentando obtener perfil para ID:', supabaseUser.id);
          
          // Consulta directa a la base de datos
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
      
          if (error) {
            console.error('Error al obtener perfil desde Supabase:', error);
            return {
              success: true,
              message: 'Autenticado, pero no se pudo obtener perfil completo'
            };
          }
          
          if (data) {
            AuthService.setCurrentUserRole(data.role as UserRole);
            const userProfile = new User({
              id: supabaseUser.id,
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              role: data.role as UserRole,
              avatar: data.avatar,
              status: data.status as UserStatus,
              semesterNumber: data.semester_number,
              academicYear: data.academic_year || '',
              bio: data.bio || '',
              phone: data.phone,
              tutorId: data.tutor_id || '',
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at),
            });
            
            setUser(userProfile);
            await AuthService.setCurrentUser(supabaseUser.id);
            
            return {
              success: true,
              message: 'Inicio de sesión exitoso',
              user: userProfile
            };
          }
        } catch (profileError) {
          console.error('Error crítico al obtener perfil:', profileError);
        }
        
        // Si llegamos aquí, la autenticación fue exitosa pero no pudimos obtener el perfil
        return {
          success: true,
          message: 'Autenticado, pero no se pudo obtener perfil completo'
        };
      }

      return {
        success: false,
        message: 'Error desconocido en la autenticación'
      };
    } catch (error: any) {
      console.error('Error en signInDirectWithSupabase:', error);
      return {
        success: false,
        message: error.message || 'Error inesperado al iniciar sesión con Supabase'
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{ success: boolean, message: string }> => {
    try {
      const registerData = {
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        semesterNumber: Number(userData.semesterNumber),
        role: userData.role
      };
      AuthService.setCurrentUserRole(userData.role as UserRole);
      console.log('Rol del usuario establecido SIGNUP:', userData.role);

      console.log('Enviando datos de registro (ajustados):', JSON.stringify(registerData));

      try {
        const response = await axios.post(`${API_URL}/auth/register`, registerData);

        if (response.data) {
          if (response.data.user && response.data.session) {
            const newToken = response.data.session.access_token;
            await TokenStorage.setToken(newToken);
            setToken(newToken);

            if (response.data.user.id) {
              await AuthService.setCurrentUser(response.data.user.id);
            }
          }

          return {
            success: true,
            message: 'Registro exitoso. Por favor verifica tu correo electrónico.'
          };
        }

        return {
          success: true,
          message: 'Registro enviado correctamente. Por favor verifica tu correo electrónico.'
        };
      } catch (apiError: any) {
        console.log('Respuesta de error completa:', apiError.response);
        throw apiError;
      }
    } catch (error: any) {
      console.error('Error detallado:', error.response?.data);

      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message;
        if (Array.isArray(errorMessage)) {
          return {
            success: false,
            message: errorMessage.join('. ')
          };
        }
        return {
          success: false,
          message: errorMessage || 'Datos de registro inválidos'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Error inesperado al registrar usuario'
      };
    }
  };

  const signOut = async (): Promise<{ success: boolean, message: string }> => {
    try {
      if (!token) {
        return {
          success: false,
          message: 'No hay sesión activa'
        };
      }

      try {
        // Intentar llamar al endpoint de logout del backend
        await axios.post(`${API_URL}/auth/logout`);
      } catch (logoutError) {
        // Si falla el endpoint de logout, continuamos con el proceso de cierre de sesión local
        console.warn('Error al comunicarse con el endpoint de logout:', logoutError);
      }

      await supabase.auth.signOut();
      // Limpiar AsyncStorage
      await TokenStorage.removeToken();
      setToken(null);
      setUser(null);
      setSession(null);

      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      console.error('Error durante el cierre de sesión:', error);

      try {
        await TokenStorage.removeToken();
        await AuthService.clearCurrentUser();
        setToken(null);
        setUser(null);
        setSession(null);
      } catch (clearError) {
        console.error('Error al limpiar AsyncStorage:', clearError);
      }

      return {
        success: true,
        message: 'Se ha cerrado la sesión localmente'
      };
    }
  };

  const verifyEmail = async (email: string): Promise<{ success: boolean, message: string, isVerified: boolean }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return {
          success: false,
          isVerified: false,
          message: 'No se pudo verificar el estado del correo electrónico'
        };
      }

      return {
        success: true,
        isVerified: true,
        message: 'Correo electrónico verificado'
      };
    } catch (error: any) {
      return {
        success: false,
        isVerified: false,
        message: error.message || 'Error al verificar el correo electrónico'
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean, message: string }> => {
    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          message: error.message || 'Error al solicitar cambio de contraseña'
        };
      }

      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer la contraseña'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al solicitar cambio de contraseña'
      };
    }
  };

  return {
    user,
    session,
    loading,
    token,
    signIn,
    signInDirectWithSupabase,
    signUp,
    signOut,
    verifyEmail,
    resetPassword
  };
}