import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Package, X } from 'lucide-react';
import { getProducts } from '../../api/products.api';
import Spinner from '../ui/Spinner';

const ProductSearch = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products-search', query],
    queryFn: () => getProducts({ q: query, page: 0, size: 10 }),
    enabled: isOpen && query.length >= 1,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={16} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="SEARCH PRODUCTS (Name or SKU)..."
          className="w-full bg-navy-950 border border-navy-800 rounded-lg px-10 py-3 text-xs font-mono text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size={16} />
          </div>
        )}
      </div>

      {isOpen && (query.length >= 1 || data?.content?.length > 0) && (
        <div className="absolute z-30 mt-2 w-full bg-navy-950 border border-navy-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-72 overflow-y-auto">
            {data?.content?.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => handleSelect(e, product)}
                className="w-full text-left px-4 py-3 border-b border-navy-800 last:border-0 flex items-center justify-between transition-colors group hover:bg-navy-900"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center text-amber-500">
                    <Package size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-all">{product.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">₹{(product.unitPrice || product.price || 0).toLocaleString()}</p>
                  <p className="text-[9px] font-mono text-amber-500/70">{product.gstRate}% GST</p>
                </div>
              </button>
            ))}
            
            {(!isLoading && data?.content?.length === 0) && (
              <div className="px-4 py-8 text-center">
                <p className="text-[10px] font-mono text-navy-700 uppercase">Inventory query failed: 0 results</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
