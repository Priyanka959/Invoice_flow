import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../api/customers.api';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => getCustomers({ q: search, page, size: 20 }),
    keepPreviousData: true,
  });

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={16} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..." 
            className="w-full bg-navy-900 border border-navy-800 rounded-lg px-10 py-2.5 text-sm font-mono text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
          />
        </div>

        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-950/50 border-b border-navy-800 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                <th className="px-6 py-5 font-bold">Client Identity</th>
                <th className="px-6 py-5 font-bold">Contact Channel</th>
                <th className="px-6 py-5 font-bold">Location Descriptor</th>
                <th className="px-6 py-5 font-bold">Registry Date</th>
                <th className="px-6 py-5 font-bold text-center">System Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/50">
              {isLoading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                     <Spinner size={32} />
                     <p className="mt-4 text-[10px] font-mono text-navy-700 uppercase tracking-widest">Accessing global customer database...</p>
                   </td>
                </tr>
              ) : data?.content?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20">
                    <EmptyState 
                      icon={Users} 
                      title="No Client Records Found" 
                      subtitle="The search parameter returned zero biological or corporate entities."
                    />
                  </td>
                </tr>
              ) : (
                data?.content?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-navy-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-800 border border-navy-700 rounded-lg flex items-center justify-center text-amber-500/50 group-hover:text-amber-500 transition-all">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{customer.name}</p>
                          <p className="text-[10px] font-mono text-navy-700 uppercase">UID-{customer.id.toString().padStart(5, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Phone size={12} className="text-navy-700" />
                          <span className="font-mono">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={12} className="text-navy-700" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-start gap-2 max-w-[200px]">
                          <MapPin size={12} className="text-navy-700 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-400 line-clamp-2">{customer.address || '—'}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar size={12} className="text-navy-700" />
                          <span>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(customer)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 rounded transition-all text-[10px] font-bold uppercase tracking-tighter"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button 
                          onClick={() => navigate(`/invoices?customerId=${customer.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-navy-950 rounded transition-all text-[10px] font-bold uppercase tracking-tighter"
                        >
                          <FileText size={12} />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
          totalElements={data?.totalElements || 0}
          size={20}
        />
      </div>

      <CustomerFormModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersPage;
