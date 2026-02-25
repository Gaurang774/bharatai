'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/40 border border-white/10 p-10 w-full max-w-lg rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-3xl shadow-inner border border-primary/20">
          🇮🇳
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Bharat<span className="text-primary">AI</span></h2>
        <p className="text-xs text-muted font-medium uppercase tracking-[0.3em]">Sovereign Intelligence Portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Government Email</label>
          <input 
            type="email" 
            className="w-full bg-secondary/50 border border-white/10 text-sm rounded-xl p-4 outline-none focus:border-primary/50 transition-all placeholder:text-white/10" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="officer@nic.gov.in"
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Password</label>
          <input 
            type="password" 
            className="w-full bg-secondary/50 border border-white/10 text-sm rounded-xl p-4 outline-none focus:border-primary/50 transition-all placeholder:text-white/10" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            required 
          />
        </div>
        
        {error && (
          <div className="px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-xs font-bold animate-shake">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <button 
          disabled={loading}
          type="submit" 
          className="w-full py-4 bg-primary text-black font-black uppercase tracking-tighter rounded-xl hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] shadow-lg mt-4 text-sm"
        >
          {loading ? 'Validating Credentials...' : 'Access Sovereign Workspace'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-white/5 text-center">
        <p className="text-[9px] text-muted font-bold uppercase tracking-widest leading-relaxed">
          National Informatics Centre | Secure Government Cloud<br/>
          <span className="text-success mt-1 inline-block">● Protected by Sovereign Firewall</span>
        </p>
      </div>
    </div>
  );
}
