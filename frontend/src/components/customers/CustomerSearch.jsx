import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserPlus, X, User } from 'lucide-react';
import { getCustomers } from '../../api/customers.api';
import Spinner from '../ui/Spinner';

const CustomerSearch = ({ selectedCustomer, onSelect, onAddNew }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers-search', query],
    queryFn: () => getCustomers({ q: query, page: 0, size: 5 }),
    enabled: isOpen && query.length >= 2,
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

  if (selectedCustomer) {
    return (
      <div className="bg-navy-900 border border-amber-500/30 rounded-lg p-4 flex justify-between items-center group animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-white">{selectedCustomer.name}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
              {selectedCustomer.phone} • UID-{selectedCustomer.id}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onSelect(null)}
          className="p-2 text-navy-700 hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={16} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="SEARCH CLIENT DATABASE (Name or Phone)..."
          className="w-full bg-navy-900 border border-navy-800 rounded-lg px-10 py-3 text-xs font-mono text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size={16} />
          </div>
        )}
      </div>

      {isOpen && (query.length >= 2 || (data?.content?.length > 0)) && (
        <div className="absolute z-30 mt-2 w-full bg-navy-900 border border-navy-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {data?.content?.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  onSelect(customer);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full text-left px-4 py-3 hover:bg-navy-800 flex items-center justify-between border-b border-navy-800/50 last:border-0 transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{customer.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{customer.phone}</p>
                </div>
                <span className="text-[10px] font-mono text-navy-700">UID-{customer.id}</span>
              </button>
            ))}
            
            {(!isLoading && data?.content?.length === 0) && (
              <div className="px-4 py-6 text-center">
                <p className="text-[10px] font-mono text-navy-700 uppercase">No entities found</p>
              </div>
            )}
          </div>
          
          {onAddNew && (
            <button 
              onClick={onAddNew}
              className="w-full px-4 py-3 bg-navy-950/50 border-t border-navy-800 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500 hover:text-navy-950 transition-all"
            >
              <UserPlus size={14} />
              Initialize New Entity Record
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
