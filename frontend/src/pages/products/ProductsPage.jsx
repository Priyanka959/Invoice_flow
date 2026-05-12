import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import ProductFormModal from '../../components/products/ProductFormModal';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { page, size: 10, search }
      });
      return data;
    }
  });

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product removed from manifest');
    },
    onError: () => toast.error('Failed to purge item record')
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={16} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Name or Description..." 
              className="w-full bg-navy-900 border border-navy-800 rounded px-10 py-2.5 text-sm font-mono text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
            />
          </div>
          <button className="flex items-center gap-2 bg-navy-900 border border-navy-800 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-navy-700 transition-all">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>

        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 px-6 py-2.5 rounded text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-950/50 border-b border-navy-800 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                <th className="px-6 py-4 font-semibold">Product Identity</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">List Price</th>
                <th className="px-6 py-4 font-semibold text-right">In Stock</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {isLoading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-mono text-xs">
                     <Loader2 className="animate-spin mx-auto mb-2 text-amber-500" size={20} />
                     SYNCHRONIZING REPOSITORY CONTENT...
                   </td>
                </tr>
              ) : data?.content?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-mono text-xs italic">
                    NO MATCHING RECORDS FOUND IN DATABANK
                  </td>
                </tr>
              ) : (
                data?.content?.map((product) => (
                  <tr key={product.id} className="hover:bg-navy-800/20 transition-colors group border-b border-navy-800/50 last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-800 border border-navy-700 rounded flex items-center justify-center text-amber-500/70 group-hover:text-amber-500 group-hover:bg-navy-750 transition-all">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">{product.name}</p>
                          <p className="text-[10px] font-mono text-navy-700 uppercase group-hover:text-slate-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono bg-navy-800 border border-navy-700 px-2.5 py-1 rounded text-slate-300 uppercase tracking-tighter">
                        GST: {product.gstRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-black text-amber-500">
                      ₹{(product.unitPrice || product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-bold ${product.stockQuantity > 10 ? 'text-green-500' : 'text-amber-500'}`}>
                            {product.stockQuantity || 0} Units
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('IRREVERSIBLE ACTION: Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Pagination */}
        <div className="px-6 py-4 bg-navy-950/50 border-t border-navy-800 flex items-center justify-between">
          <p className="text-[10px] font-mono text-navy-700 uppercase">
            Showing records {page * 10 + 1}-{Math.min((page + 1) * 10, data?.totalElements || 0)} of {data?.totalElements || 0}
          </p>
          <div className="flex items-center gap-1">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 bg-navy-900 border border-navy-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1 px-3">
               {[...Array(data?.totalPages || 0)].map((_, i) => (
                 <button 
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all ${
                      page === i ? 'bg-amber-500 text-navy-950 font-black' : 'text-slate-500 hover:text-slate-300'
                    }`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
            <button 
              disabled={page >= (data?.totalPages || 1) - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 bg-navy-900 border border-navy-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsPage;
