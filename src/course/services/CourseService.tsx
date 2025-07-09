import axios from 'axios';
import { API_URL } from '../../config/env';
import { Course } from '../types/Course';

export const CourseService = {
  // Obtener un curso por ID
  getCourseById: async (id: string): Promise<Course> => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      return new Course(response.data);
    } catch (error) {
      console.error('Error al obtener curso:', error);
      throw error;
    }
  },

  // Obtener todos los cursos
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      return response.data.map((course: any) => new Course(course));
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      throw error;
    }
  },

  // Obtener cursos por semestre
  getCoursesBySemester: async (semesterNumber: number): Promise<Course[]> => {
    try {
      const response = await axios.get(`${API_URL}/courses`, {
        params: { semesterNumber }
      });
      return response.data.map((course: any) => new Course(course));
    } catch (error) {
      console.error('Error al obtener cursos por semestre:', error);
      throw error;
    }
  }
};