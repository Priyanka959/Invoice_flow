import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { login as loginApi } from '../../api/auth.api';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginApi(data);
      setAuth(response.token, response.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-navy-950 font-sans">
      {/* Left side: Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-navy-900 border-r border-navy-800 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 to-transparent blur-3xl"></div>
        </div>
        
        <div className="z-10 text-center">
          <div className="inline-block p-4 bg-navy-800 border border-navy-700 rounded-2xl mb-6 shadow-xl">
             <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-500 tracking-tighter italic">I</span>
                <span className="text-4xl font-black text-white tracking-tighter">FLOW</span>
             </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Industrial Strength Invoicing</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Optimized for retail efficiency. Dense UI, instant data, and utilitarian design for high-velocity workflows.
          </p>
        </div>
        
        <div className="mt-12 w-full max-w-md bg-navy-950/50 border border-navy-800 rounded-lg p-1 backdrop-blur-sm self-center">
           <div className="flex gap-1 p-1">
              <div className="h-2 w-full bg-amber-500/20 rounded"></div>
              <div className="h-2 w-1/2 bg-navy-700 rounded"></div>
           </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
             <h1 className="text-3xl font-black text-amber-500 tracking-tighter italic">I-FLOW</h1>
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Authenticated Login</h2>
            <p className="text-slate-400">Enter your credentials to access the terminal.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-validation space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Username</label>
              <input
                {...register('username')}
                autoFocus
                className="w-full bg-navy-900 border border-navy-800 rounded px-4 py-3 text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                placeholder="system_admin"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                   <span className="h-1 w-1 bg-red-400 rounded-full"></span>
                   {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-navy-900 border border-navy-800 rounded px-4 py-3 text-white placeholder:text-navy-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-700 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="h-1 w-1 bg-red-400 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-navy-950 font-bold py-3.5 rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 mt-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>INITIALIZE SESSION</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-navy-900 flex justify-between items-center text-[10px] text-navy-700 font-mono tracking-widest uppercase">
            <span>SECURE TERMINAL V1.0</span>
            <span>AES-256 L1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
