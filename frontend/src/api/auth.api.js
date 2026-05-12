import api from '../lib/axios';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};
