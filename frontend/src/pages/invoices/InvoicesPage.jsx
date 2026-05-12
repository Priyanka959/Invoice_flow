import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Plus,
  Calendar,
  User,
  CreditCard,
  FilterX
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getInvoices, downloadInvoicePdf } from '../../api/invoices.api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [isDownloading, setIsDownloading] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('customerName') || '');

  const customerName = searchParams.get('customerName') || '';
  const fromDate = searchParams.get('from') || '';
  const toDate = searchParams.get('to') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, customerName, fromDate, toDate],
    queryFn: () => getInvoices({ 
      customerName, 
      from: fromDate, 
      to: toDate, 
      page, 
      size: 20 
    }),
    keepPreviousData: true,
  });

  const handleDownload = async (e, id) => {
    e.stopPropagation();
    setIsDownloading(id);
    try {
      await downloadInvoicePdf(id);
      toast.success('Document downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF document');
    } finally {
      setIsDownloading(null);
    }
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Filtering Header */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 flex flex-wrap items-end gap-6 shadow-xl">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-2">Customer Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams({ ...Object.fromEntries(searchParams), customerName: e.target.value });
              }}
              placeholder="Search by customer name..." 
              className="w-full bg-navy-950 border border-navy-800 rounded px-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-2">From Date</label>
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), from: e.target.value })}
              className="bg-navy-950 border border-navy-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-2">To Date</label>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), to: e.target.value })}
              className="bg-navy-950 border border-navy-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          {(customerName || fromDate || toDate) && (
            <button 
              onClick={() => { clearFilters(); setSearchQuery(''); }}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
            >
              <FilterX size={14} />
              Reset
            </button>
          )}
          <button 
            onClick={() => navigate('/invoices/new')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 px-5 py-2 rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/10 transition-all active:scale-95"
          >
            <Plus size={16} />
            Initialize NEW
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-950/50 border-b border-navy-800 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                <th className="px-6 py-5 font-bold">Transaction Index</th>
                <th className="px-6 py-5 font-bold">Date</th>
                <th className="px-6 py-5 font-bold">Client Entity</th>
                <th className="px-6 py-5 font-bold text-right">Settlement Total</th>
                <th className="px-6 py-5 font-bold text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <Spinner size={32} />
                    <p className="mt-4 text-[10px] font-mono text-navy-700 uppercase tracking-widest tracking-tighter">Polling distributed ledger...</p>
                  </td>
                </tr>
              ) : (data?.content?.length || 0) === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-20">
                     <EmptyState 
                        icon={FileText} 
                        title="Manifest Empty" 
                        subtitle="No transaction records match the specified search parameters."
                     />
                   </td>
                </tr>
              ) : (
                data.content.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="hover:bg-navy-800/20 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-black font-mono text-amber-500 group-hover:underline">
                        #{invoice.invoiceNumber || invoice.id.toString().padStart(8, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} className="text-navy-700" />
                        <span>
                          {(() => {
                            const d = invoice.invoiceDate || invoice.createdAt;
                            if (!d) return '—';
                            const dateObj = Array.isArray(d) ? new Date(d[0], d[1]-1, d[2]) : new Date(d);
                            return isNaN(dateObj.getTime()) ? '—' : dateObj.toLocaleDateString('en-GB');
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-navy-700" />
                        <span className="text-xs font-bold text-white tracking-tight">{invoice.customerName || invoice.customer?.name || `UID-${invoice.customerId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-sm font-black font-mono text-white tracking-tighter">
                         ₹{(invoice.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            disabled={isDownloading === invoice.id}
                            onClick={(e) => handleDownload(e, invoice.id)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                          >
                            {isDownloading === invoice.id ? <Spinner size={16} /> : <Download size={16} />}
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
    </div>
  );
};

export default InvoicesPage;
