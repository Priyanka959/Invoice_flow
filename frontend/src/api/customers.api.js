import api from '../lib/axios';

export const getCustomers = async ({ q, page = 0, size = 20 }) => {
  const { data } = await api.get('/customers', {
    params: { q, page, size }
  });
  return data;
};

export const getCustomerById = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const createCustomer = async (customerData) => {
  const { data } = await api.post('/customers', customerData);
  return data;
};

export const updateCustomer = async (id, customerData) => {
  const { data } = await api.put(`/customers/${id}`, customerData);
  return data;
};
