'use client';

import { useEffect, useState } from 'react';
import { auditApi, docApi } from '@/lib/api';
import { ShieldCheck, AlertCircle, FileText, Download, Upload, Users, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMinistry, setUploadMinistry] = useState('General');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes, docsRes] = await Promise.all([
        auditApi.getLogs(),
        auditApi.getStats(),
        docApi.list()
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
      setDocs(docsRes.data);
    } catch (err) {
      console.error(err);
      // If error, likely unauthorized
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ministry', uploadMinistry);
    try {
      await docApi.upload(formData);
      setFile(null);
      fetchData();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return <div className="p-20 text-center">Loading Sovereign Audit Systems...</div>;

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent">
                Audit & Governance Terminal
              </h1>
            </div>
            <p className="text-muted text-sm font-medium">Monitoring BharatAI interactions across the Sovereign Network</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-primary text-black font-bold rounded-lg transition-all hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 text-sm"
          >
            Return to Workspace
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Internal Queries', val: stats.total_queries_today, icon: <Activity size={20}/>, bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Flagged Security Risks', val: stats.flagged_queries, icon: <AlertCircle size={20}/>, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
            { label: 'Active Personnel', val: stats.active_users, icon: <Users size={20}/>, bg: 'bg-success/10', border: 'border-success/20' },
            { label: 'Highest Alert Ministry', val: stats.most_active_ministry, icon: <FileText size={20}/>, bg: 'bg-primary/10', border: 'border-primary/20' },
          ].map((s, i) => (
            <div key={i} className={`bg-card/50 border ${s.border || 'border-white/10'} rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${s.bg || 'bg-white/5'} rounded-lg`}>
                   {s.icon}
                </div>
                <span className="text-[10px] text-muted uppercase font-bold tracking-[0.2em]">{s.label}</span>
              </div>
              <div className={`text-3xl font-black tracking-tight ${s.color || 'text-white'}`}>{s.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audit Table */}
          <div className="lg:col-span-2 bg-card/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="font-bold text-lg">Real-time Interaction Stream</h3>
                <p className="text-xs text-muted">Live audit feed from all active ministry sessions</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold bg-secondary hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/5">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-muted text-[10px] uppercase tracking-widest font-bold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Ministry</th>
                    <th className="p-4">Query Preview</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className={`${log.is_flagged ? 'bg-danger/5 hover:bg-danger/10' : 'hover:bg-white/5'} transition-colors cursor-default`}>
                      <td className="p-4 text-xs text-muted font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour12: true })}</td>
                      <td className="p-4 text-sm font-semibold">{log.user_email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                          {log.ministry}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted truncate max-w-xs">{log.query_preview}</td>
                      <td className="p-4 text-center">
                        {log.is_flagged ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/20 text-danger border border-danger/30 rounded-full text-[10px] font-extrabold uppercase animate-pulse">
                            <AlertCircle size={12}/> High Risk
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success border border-success/30 rounded-full text-[10px] font-extrabold uppercase">
                             Secure
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            <div className="bg-card/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Upload size={20} className="text-primary"/> Upload Knowledge
              </h3>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest block">Target Ministry</label>
                  <select 
                    className="w-full bg-secondary/50 border border-white/10 text-sm rounded-xl p-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    value={uploadMinistry}
                    onChange={(e) => setUploadMinistry(e.target.value)}
                  >
                    {["General", "Finance", "Defense", "Health", "Law"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="group border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative bg-white/5">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">{file ? file.name : 'Select PDF or Documents'}</p>
                  <p className="text-xs text-muted">Max file size: 50MB</p>
                </div>
                <button 
                  disabled={loading || !file} 
                  type="submit" 
                  className="w-full py-4 bg-primary text-black font-black uppercase tracking-tighter rounded-xl hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-xs"
                >
                  {loading ? 'Analyzing & Indexing...' : 'Ingest into Sovereign DB'}
                </button>
              </form>
            </div>

            <div className="bg-card/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Active Assets</h3>
                <span className="bg-success/20 text-success text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>
              </div>
              <div className="space-y-4">
                {docs.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted italic">No documents indexed yet.</p>
                ) : docs.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group transition-all hover:bg-white/10">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{d.filename}</p>
                      <p className="text-[10px] text-muted uppercase tracking-tighter">{d.ministry} • {d.chunk_count} chunks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
