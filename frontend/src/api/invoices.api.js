import api from '../lib/axios';

export const getInvoices = async (params) => {
  const { data } = await api.get('/invoices', { params });
  return data;
};

export const createInvoice = async (invoiceData) => {
  const { data } = await api.post('/invoices', invoiceData);
  return data;
};

export const getInvoiceById = async (id) => {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
};

export const downloadInvoicePdf = async (id) => {
  const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `INV-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};
