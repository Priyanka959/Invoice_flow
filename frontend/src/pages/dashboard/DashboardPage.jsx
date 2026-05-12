import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  Receipt, 
  TrendingUp, 
  ShoppingBag,
  ArrowUpRight,
  Clock,
  Plus,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../../api/invoices.api';
import { getProducts } from '../../api/products.api';
import { getCustomers } from '../../api/customers.api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const DashboardPage = () => {
  // Fetch stats for the dashboard
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices({ size: 5 })
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ size: 1 })
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ size: 1 })
  });

  const totalRevenue = invoices?.content?.reduce((sum, inv) => sum + (inv.totalAmount || inv.grandTotal || 0), 0) || 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Invoices', value: (invoices?.page?.totalElements ?? invoices?.totalElements ?? 0), icon: Receipt, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Active Inventory', value: (products?.page?.totalElements ?? products?.totalElements ?? 0), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Client Base', value: (customers?.page?.totalElements ?? customers?.totalElements ?? 0), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  if (isLoadingInvoices) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Terminal Control</h1>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">Operational Overview & Transactional Metrics</p>
        </div>
        <Link 
          to="/invoices/new"
          className="bg-amber-500 hover:bg-amber-400 text-navy-950 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
        >
          <Plus size={16} />
          New Transaction
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-amber-500/30 transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter group-hover:text-amber-500 transition-colors">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Recent Ledger Entries
            </h2>
            <Link to="/invoices" className="text-[10px] font-mono text-slate-500 hover:text-amber-500 uppercase tracking-tighter transition-colors">
              View Full History →
            </Link>
          </div>
          
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-navy-950 border-b border-navy-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Invc ID</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Entity</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {invoices?.content?.length > 0 ? (
                    invoices.content.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-navy-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-white group-hover:text-amber-500">#{invoice.invoiceNumber || invoice.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-slate-400">
                            {(() => {
                              const d = invoice.invoiceDate || invoice.createdAt;
                              if (!d) return '—';
                              const dateObj = Array.isArray(d) ? new Date(d[0], d[1]-1, d[2]) : new Date(d);
                              return isNaN(dateObj.getTime()) ? '—' : dateObj.toLocaleDateString('en-GB');
                            })()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white">{invoice.customerName || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-white">₹{(invoice.totalAmount || invoice.grandTotal || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/invoices/${invoice.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-slate-300 rounded hover:bg-amber-500 hover:text-navy-950 transition-all shadow-sm group-hover:bg-navy-800"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Examine</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-[10px] font-mono text-navy-700 uppercase">Data stream inactive: 0 entries found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag size={16} className="text-amber-500" />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { to: '/products', label: 'Manage Inventory', icon: Package, desc: 'Update levels & pricing' },
              { to: '/customers', label: 'Client Database', icon: Users, desc: 'View acquisition data' },
              { to: '/invoices/new', label: 'Generate Receipt', icon: Receipt, desc: 'Fast terminal billing' },
            ].map((action, i) => (
              <Link 
                key={i}
                to={action.to}
                className="bg-navy-900 border border-navy-800 p-4 rounded-xl hover:border-amber-500/50 hover:bg-navy-800 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-navy-950 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
                    <action.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase group-hover:text-amber-400 transition-colors">{action.label}</p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

