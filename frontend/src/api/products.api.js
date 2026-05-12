import api from '../lib/axios';

export const getProducts = async ({ q, search, page = 0, size = 20, sort }) => {
  const queryParam = q || search;
  const { data } = await api.get('/products', {
    params: { search: queryParam, page, size, sort }
  });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
