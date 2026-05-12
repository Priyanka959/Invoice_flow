import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createCustomer, updateCustomer } from '../../api/customers.api';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
});

const CustomerFormModal = ({ isOpen, onClose, customer = null, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateCustomer(customer.id, data) : createCustomer(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['customers']);
      toast.success(`Customer ${isEdit ? 'updated' : 'created'} successfully`);
      if (onSuccess) onSuccess(data);
      onClose();
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} customer`);
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'Edit Customer Metadata' : 'Register New Customer'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Legal Name</label>
          <input
            {...register('name')}
            className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="e.g. Acme Corp"
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Phone Number</label>
          <input
            {...register('phone')}
            type="text"
            inputMode="numeric"
            className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="9876543210"
          />
          {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Email Address</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
            placeholder="contact@example.com"
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Billing Address</label>
          <textarea
            {...register('address')}
            rows={3}
            className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="Street, City, ZIP..."
          />
        </div>

        <div className="pt-2">
          <button
            disabled={mutation.isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-navy-950 font-bold py-2.5 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            {mutation.isLoading ? <Spinner size={16} className="text-navy-950" /> : (isEdit ? 'Update Record' : 'Commit Registration')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerFormModal;
