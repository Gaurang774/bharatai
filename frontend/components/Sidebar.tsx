'use client';

import { useEffect, useState } from 'react';
import { chatApi, authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, History, ShieldAlert } from 'lucide-react';

export default function Sidebar({ 
  selectedMinistry, 
  setSelectedMinistry,
  onConversationSelect
}: { 
  selectedMinistry: string,
  setSelectedMinistry: (m: string) => void,
  onConversationSelect: (id: number) => void
}) {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  const ministries = ["General", "Finance", "Defense", "Health", "Law", "Education", "Infrastructure"];

  useEffect(() => {
    authApi.me().then(res => setUser(res.data)).catch(() => router.push('/'));
    chatApi.getConversations().then(res => setHistory(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="w-72 bg-card border-r border-white/10 flex flex-col h-screen overflow-hidden shadow-2xl relative z-30">
      {/* Brand */}
      <div className="p-8 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-primary/20">
          🇮🇳
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">Bharat<span className="text-primary tracking-widest">AI</span></h1>
          <p className="text-[8px] text-success font-bold uppercase tracking-widest mt-0.5">Sovereign Cloud v1.0</p>
        </div>
      </div>
      {/* Offline Sovereign Badge */}
      <div className="mx-4 mt-2 px-3 py-2 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <span className="text-[8px] font-black text-success uppercase tracking-widest">Air-Gapped Sovereign Node</span>
      </div>

      {/* User info as a "Profile Card" */}
      {user && (
        <div className="p-4 mx-4 mt-6 mb-8 bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-2xl shadow-lg group hover:border-primary/30 transition-all cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 -m-4 w-12 h-12 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary text-black flex items-center justify-center font-black text-xs">
                {user.email[0].toUpperCase()}
             </div>
             <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.email.split('@')[0]}</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                   <p className="text-[9px] text-muted font-medium uppercase tracking-tighter truncate">{user.role} | {user.ministry}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Ministry selector as a "Control Point" */}
      <div className="px-6 mb-8 space-y-2">
        <label className="text-[10px] text-muted-foreground/50 uppercase tracking-[.25em] font-black block pl-1">Active Sector</label>
        <div className="relative group">
          <select 
            className="w-full bg-secondary/30 border border-white/10 text-xs font-bold rounded-xl p-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer ring-0 pr-10"
            value={selectedMinistry}
            onChange={(e) => setSelectedMinistry(e.target.value)}
          >
            {ministries.map(m => <option key={m} value={m} className="bg-card py-2">{m}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40 group-hover:text-primary transition-colors">
             <LayoutDashboard size={14}/>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] text-muted uppercase tracking-[.2em] font-black">Secure History</span>
          <button className="text-[10px] text-primary hover:underline font-bold">New Chat</button>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10 opacity-20">
             <History size={32} className="mx-auto mb-2" />
             <p className="text-[10px] uppercase font-bold">No sessions yet</p>
          </div>
        ) : history.map((h: any) => (
          <button 
            key={h.id}
            onClick={() => onConversationSelect(h.id)}
            className="w-full text-left px-4 py-3 text-xs rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-muted hover:text-white transition-all flex items-center gap-3 group"
          >
            <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary/50 transition-colors"></div>
            <span className="truncate flex-1 font-medium">{h.title || 'Ongoing Analysis...'}</span>
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 bg-black/20 space-y-3">
        {user?.role === 'admin' && (
          <button 
            onClick={() => router.push('/admin')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <ShieldAlert size={16} />
            Governance Panel
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted hover:bg-danger/10 hover:text-danger rounded-xl transition-all border border-transparent hover:border-danger/10"
        >
          <LogOut size={16} />
          Safe Termination
        </button>
      </div>
    </div>
  );
}
