import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  LogOut 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Invoices', icon: FileText, path: '/invoices' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Products', icon: Package, path: '/products' },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(m => location.pathname.startsWith(m.path));
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/invoices/new') return 'New Invoice';
    return item ? item.label : 'InvoiceFlow';
  };

  return (
    <div className="flex bg-navy-950 min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-navy-900 border-r border-navy-800 fixed h-full z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-amber-500 tracking-tight">
            InvoiceFlow
          </h1>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors relative ${
                  isActive 
                    ? 'text-amber-500 bg-navy-800 border-l-[3px] border-amber-500' 
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          <div className="my-4 border-t border-navy-800 mx-6"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-navy-800 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-navy-900 border-b border-navy-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold">{getPageTitle()}</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.fullName}</p>
              <p className={`text-[10px] uppercase tracking-wider font-bold ${user?.role === 'ADMIN' ? 'text-amber-500' : 'text-slate-400'}`}>
                {user?.role}
              </p>
            </div>
          </div>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AppLayout;
