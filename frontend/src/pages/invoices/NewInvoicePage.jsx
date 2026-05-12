import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Trash2, 
  Save, 
  ShoppingCart, 
  Calculator,
  AlertTriangle,
  ReceiptText,
  Truck
} from 'lucide-react';
import { createInvoice } from '../../api/invoices.api';
import CustomerSearch from '../../components/customers/CustomerSearch';
import ProductSearch from '../../components/products/ProductSearch';
import { useInvoiceCalculator } from '../../hooks/useInvoiceCalculator';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

import CustomerFormModal from '../../components/customers/CustomerFormModal';
import ProductQuantityModal from '../../components/products/ProductQuantityModal';

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]); // { product, quantity }
  const [supplyType] = useState('INTRA_STATE');
  const [remarks, setRemarks] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductQtyModalOpen, setIsProductQtyModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);

  // Calculations
  const { subtotal, totalGst, grandTotal, gstSummary: gstBreakdown } = useInvoiceCalculator(items, supplyType);

  // Mutation
  const createMutation = useMutation({
    mutationFn: (data) => createInvoice(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/invoices/${res.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to finalize and commit the invoice. Please check your inputs.');
    }
  });

  const handleAddItem = (product) => {
    if (!product) return;
    setPendingProduct(product);
    setIsProductQtyModalOpen(true);
  };

  const handleConfirmQuantity = (product, quantity) => {
    if (!product) return;
    setItems(prev => {
      const existing = prev.find(i => i.product?.id === product.id);
      if (existing) {
        return prev.map(i => i.product?.id === product.id 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId, delta) => {
    setItems(prev => prev.map(item => {
      if (item.product?.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId) => {
    setItems(prev => prev.filter(i => i.product?.id !== productId));
  };

  const handleSubmit = () => {
    if (!selectedCustomer || items.length === 0) return;

    const invoiceData = {
      customerId: selectedCustomer.id,
      invoiceDate,
      supplyType,
      items: items.map(item => ({
        productId: item.product?.id,
        quantity: item.quantity
      }))
    };

    createMutation.mutate(invoiceData);
  };

  const isFormValid = selectedCustomer && items.length > 0;

  return (
    <div className="min-h-screen bg-navy-950 pb-20">
      {/* Header */}
      <div className="bg-navy-900 border-b border-navy-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/invoices')}
              className="p-2 hover:bg-navy-800 rounded-lg text-slate-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Invoice Builder</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-navy-950 border border-navy-800 rounded px-3 py-1.5 h-10">
              <span className="text-[10px] font-mono text-navy-700 uppercase tracking-tighter">Invc Date</span>
              <input 
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-32"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || createMutation.isPending}
              className={`flex items-center gap-2 px-6 py-2 h-10 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                isFormValid 
                  ? 'bg-amber-500 text-navy-950 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'bg-navy-800 text-navy-700 cursor-not-allowed'
              }`}
            >
              {createMutation.isPending ? <Spinner size={14} color="navy" /> : <Save size={16} />}
              Finalize & Commit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Builder Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Client Selection */}
            <section className="bg-navy-900/50 border border-navy-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center">01</span>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest">Target Entity Selection</h2>
              </div>
                <div className="w-full">
                  <CustomerSearch 
                    selectedCustomer={selectedCustomer} 
                    onSelect={setSelectedCustomer} 
                    onAddNew={() => setIsCustomerModalOpen(true)}
                  />
                </div>
            </section>

            {/* Step 2: Line Item Assembly */}
            <section className="bg-navy-900/50 border border-navy-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center">02</span>
                  <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest">Inventory Manifest Assembly</h2>
                </div>
                {items.length > 0 && (
                  <Badge variant="navy" className="text-[10px]">{items.length} LINE ITEMS</Badge>
                )}
              </div>

              <ProductSearch onAdd={handleAddItem} />

              <div className="mt-8 space-y-3">
                {items.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-navy-800 rounded-xl flex flex-col items-center justify-center text-navy-700">
                    <ShoppingCart size={40} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">Awaiting Line Item Integration</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div 
                      key={item.product?.id || index}
                      className="bg-navy-900 border border-navy-800 rounded-lg p-4 flex items-center justify-between group animate-in slide-in-from-right-4 duration-300"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">{item.product?.name || 'Unknown Product'}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500">₹{(item.product?.unitPrice || item.product?.price || 0).toLocaleString()} / UNIT</span>
                          <span className="text-[10px] font-mono text-amber-500/70">{item.product?.gstRate || 0}% GST</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-navy-950 border border-navy-800 rounded-lg overflow-hidden h-9">
                          <button 
                            onClick={() => handleUpdateQuantity(item.product?.id, -1)}
                            className="w-10 h-full flex items-center justify-center text-slate-400 hover:bg-navy-800 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <div className="w-12 text-center font-mono text-xs text-white border-x border-navy-800">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => handleUpdateQuantity(item.product?.id, 1)}
                            className="w-10 h-full flex items-center justify-center text-slate-400 hover:bg-navy-800 hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="w-24 text-right">
                          <p className="text-[10px] font-mono text-navy-700 uppercase mb-1">Settlement</p>
                          <p className="text-sm font-black text-white">
                            ₹{(() => {
                              const base = (item.product?.unitPrice || item.product?.price || 0) * item.quantity;
                              const gst = base * (item.product?.gstRate || 0) / 100;
                              return (base + gst).toLocaleString(undefined, { minimumFractionDigits: 2 });
                            })()}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleRemoveItem(item.product?.id)}
                          className="p-2 text-navy-700 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sticky Summary Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calculator size={16} className="text-amber-500" />
                Summary
              </h2>

              {/* Totals Breakdown */}
              <div className="space-y-4 border-b border-navy-800 pb-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">MANIFEST SUBTOTAL</span>
                  <span className="text-xs font-bold text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {gstBreakdown.map((group) => (
                  <div key={group.rate} className="flex justify-between items-center">
                    <span className="text-xs font-mono text-amber-500/50">AGGREGATED GST ({group.rate}%)</span>
                    <span className="text-xs font-bold text-white">₹{(group.gst || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Final Settlement</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₹{grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-navy-700 italic">INC. TAXES</p>
                  </div>
                </div>
              </div>


              {items.length > 0 && !selectedCustomer && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 mb-6 animate-pulse">
                  <AlertTriangle className="text-red-500 shrink-0" size={16} />
                  <p className="text-[9px] font-bold text-red-500 uppercase leading-relaxed">
                    Transaction Blocked: A valid Client Entity record must be linked for ledger finalization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={(customer) => {
          setSelectedCustomer(customer);
          setIsCustomerModalOpen(false);
        }}
      />

      <ProductQuantityModal 
        isOpen={isProductQtyModalOpen}
        onClose={() => {
          setIsProductQtyModalOpen(false);
          setPendingProduct(null);
        }}
        product={pendingProduct}
        onConfirm={handleConfirmQuantity}
      />
    </div>
  );
};

export default NewInvoicePage;
