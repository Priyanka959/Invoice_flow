import React, { useState } from 'react';
import Modal from '../ui/Modal';

const ProductQuantityModal = ({ isOpen, onClose, product, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(product, parseInt(quantity, 10));
    setQuantity(1);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Specify Asset Quantity"
    >
      <div className="space-y-4">
        <div className="bg-navy-950 p-4 rounded-lg border border-navy-800">
          <p className="text-[10px] font-mono text-navy-700 uppercase mb-1">Selected Asset</p>
          <p className="text-sm font-bold text-white">{product.name}</p>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Rate: ₹{product.unitPrice}</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Stock: {product.stockQuantity}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-1">
              Quantity to Allocate
            </label>
            <input
              type="number"
              min="1"
              max={product.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
              className="w-full bg-navy-950 border border-navy-800 rounded px-3 py-2 text-xl text-amber-500 font-mono focus:outline-none focus:border-amber-500/50 transition-all text-center"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold py-2 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10"
            >
              Add to Manifest
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProductQuantityModal;