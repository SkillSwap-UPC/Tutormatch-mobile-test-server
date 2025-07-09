import axios from 'axios';
import { API_URL } from '../../config/env';


const authApi = {
  login: async (email: string, password: string) => {
    return axios.post(`${API_URL}/auth/login`, { email, password });
  },
  
  register: async (registerData: any) => {
    return axios.post(`${API_URL}/auth/register`, registerData);
  },
  
  logout: async () => {
    return axios.post(`${API_URL}/auth/logout`);
  }
};

export default authApi;