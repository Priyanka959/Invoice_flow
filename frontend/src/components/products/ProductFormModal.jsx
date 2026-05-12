import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  hsnCode: z.string().min(1, 'HSN Code is required'),
  unitPrice: z.preprocess((val) => (val === '' ? undefined : parseFloat(val)), z.number({ required_error: 'Unit price is required' }).positive('Price must be positive')),
  gstRate: z.preprocess((val) => (val === '' ? undefined : parseFloat(val)), z.number({ required_error: 'GST Rate is required' }).min(0, 'GST Rate cannot be negative')),
  stockQuantity: z.preprocess((val) => (val === '' ? 0 : parseInt(val, 10)), z.number().int().nonnegative('Stock cannot be negative')),
  description: z.string().optional(),
});

const ProductFormModal = ({ isOpen, onClose, product = null }) => {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    values: product ? {
      name: product.name,
      sku: product.sku,
      hsnCode: product.hsnCode,
      unitPrice: product.unitPrice || product.price,
      gstRate: product.gstRate,
      stockQuantity: product.stockQuantity || 0,
      description: product.description || '',
    } : {
      name: '',
      sku: '',
      hsnCode: '',
      unitPrice: '',
      gstRate: 18,
      stockQuantity: 0,
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit 
      ? api.put(`/products/${product.id}`, data) 
      : api.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success(`Product ${isEdit ? 'updated' : 'cataloged'} successfully`);
      onClose();
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'Edit Asset Parameters' : 'Catalog New Inventory Asset'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Asset Name</label>
            <input
              {...register('name')}
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
              placeholder="e.g. Industrial Valve X1"
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">SKU (Unique)</label>
            <input
              {...register('sku')}
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
              placeholder="SKU-001"
            />
            {errors.sku && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.sku.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">HSN Code</label>
            <input
              {...register('hsnCode')}
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
              placeholder="8481"
            />
            {errors.hsnCode && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.hsnCode.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Functional Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-sans"
            placeholder="Technical specifications..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Unit Price ($)</label>
            <input
              {...register('unitPrice')}
              type="number"
              step="0.01"
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50 transition-all"
            />
            {errors.unitPrice && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.unitPrice.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">Stock Quantity</label>
            <input
              {...register('stockQuantity')}
              type="number"
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="0"
            />
            {errors.stockQuantity && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.stockQuantity.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">GST Rate (%)</label>
            <select
              {...register('gstRate')}
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50 transition-all"
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
            {errors.gstRate && <p className="text-red-500 text-[10px] mt-1 font-mono">{errors.gstRate.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <button
            disabled={mutation.isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-navy-950 font-bold py-2.5 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            {mutation.isLoading ? <Spinner size={16} className="text-navy-950" /> : (isEdit ? 'Update Asset' : 'Commit to Catalog')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
