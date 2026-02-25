'use client';

import { useState, useEffect, useRef } from 'react';
import { modelsApi, docApi } from '@/lib/api';
import { Bot, FileUp, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Loader2, Cpu, FolderOpen, Timer } from 'lucide-react';

const MINISTRIES = ["General", "Finance", "Defense", "Health", "Law", "Education", "Infrastructure"];

interface Props {
    onModelChange: (model: string) => void;
    selectedModel: string;
    currentMinistry: string;
}

type Tab = 'model' | 'ingest' | 'session';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function SettingsPanel({ onModelChange, selectedModel, currentMinistry }: Props) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('model');

    // --- Session tab state ---
    const [timeoutMin, setTimeoutMin] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const v = localStorage.getItem('session_timeout_min');
        return v !== null ? parseFloat(v) : 0;
    });

    // --- Model tab state ---
    const [models, setModels] = useState<string[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState('');

    // --- Ingest tab state ---
    const [ingestMinistry, setIngestMinistry] = useState(currentMinistry);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadResult, setUploadResult] = useState<{ chunks: number; redactions: number; note: string } | null>(null);
    const [uploadError, setUploadError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    // Sync ministry when parent changes
    useEffect(() => { setIngestMinistry(currentMinistry); }, [currentMinistry]);

    // Write session timeout to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('session_timeout_min', String(timeoutMin));
    }, [timeoutMin]);

    // Load models when panel opens and model tab is active
    useEffect(() => {
        if (!open || tab !== 'model') return;
        setModelsLoading(true);
        setModelsError('');
        modelsApi.list()
            .then(res => setModels(res.data.models))
            .catch(() => setModelsError('Could not reach Ollama server.'))
            .finally(() => setModelsLoading(false));
    }, [open, tab]);

    const handleUpload = async () => {
        if (!file) return;
        setUploadStatus('uploading');
        setUploadError('');
        setUploadResult(null);
        try {
            const res = await docApi.upload(file, ingestMinistry);
            setUploadResult({ chunks: res.data.chunks, redactions: res.data.redactions, note: res.data.redaction_note });
            setUploadStatus('success');
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
        } catch (err: any) {
            setUploadError(err.response?.data?.detail || 'Upload failed.');
            setUploadStatus('error');
        }
    };

    return (
        <div className="mx-4 mb-3">
            {/* Toggle button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-primary/70 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-white transition-colors">
                        Sovereign Settings
                    </span>
                </div>
                <div className="text-muted/50">
                    {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </button>

            {/* Panel body */}
            {open && (
                <div className="mt-2 rounded-2xl border border-white/10 bg-[#111]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                    {/* Tab bar */}
                    <div className="flex border-b border-white/10">
                        {([
                            { id: 'model' as Tab, icon: <Bot size={12} />, label: 'LLM Model' },
                            { id: 'ingest' as Tab, icon: <FileUp size={12} />, label: 'Ingest Doc' },
                            { id: 'session' as Tab, icon: <Timer size={12} />, label: 'Session' },
                        ]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${tab === t.id
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-muted hover:text-white'
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-3">
                        {/* ── MODEL TAB ── */}
                        {tab === 'model' && (
                            <>
                                <p className="text-[9px] text-muted/60 uppercase font-bold tracking-widest">
                                    Active Ollama Instance
                                </p>
                                {modelsLoading && (
                                    <div className="flex items-center gap-2 text-muted text-xs">
                                        <Loader2 size={14} className="animate-spin text-primary" />
                                        Querying sovereign node...
                                    </div>
                                )}
                                {modelsError && (
                                    <div className="flex items-center gap-2 text-danger text-[10px] font-bold bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                                        <AlertCircle size={12} /> {modelsError}
                                    </div>
                                )}
                                {!modelsLoading && !modelsError && models.length > 0 && (
                                    <>
                                        <select
                                            value={selectedModel}
                                            onChange={e => onModelChange(e.target.value)}
                                            className="w-full bg-secondary/30 border border-white/10 text-xs font-bold rounded-xl p-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                        >
                                            {models.map(m => (
                                                <option key={m} value={m} className="bg-card">{m}</option>
                                            ))}
                                        </select>
                                        <div className="flex items-center gap-1.5 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            <span className="text-[9px] text-success font-bold uppercase tracking-wider">
                                                {models.length} model{models.length > 1 ? 's' : ''} available
                                            </span>
                                        </div>
                                    </>
                                )}
                                {!modelsLoading && !modelsError && models.length === 0 && (
                                    <p className="text-[10px] text-muted/50 font-medium">No models found. Pull a model with <code className="bg-white/5 px-1 rounded">ollama pull llama3.2</code>.</p>
                                )}
                            </>
                        )}

                        {/* ── INGEST TAB ── */}
                        {tab === 'ingest' && (
                            <>
                                <p className="text-[9px] text-muted/60 uppercase font-bold tracking-widest">
                                    Ingest to Knowledge Base
                                </p>

                                {/* Ministry */}
                                <div>
                                    <label className="text-[9px] uppercase font-black tracking-widest text-muted/50 block mb-1.5">Ministry</label>
                                    <select
                                        value={ingestMinistry}
                                        onChange={e => setIngestMinistry(e.target.value)}
                                        className="w-full bg-secondary/30 border border-white/10 text-xs font-bold rounded-xl p-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        {MINISTRIES.map(m => (
                                            <option key={m} value={m} className="bg-card">{m}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* File picker */}
                                <div>
                                    <label className="text-[9px] uppercase font-black tracking-widest text-muted/50 block mb-1.5">Document (.pdf / .txt)</label>
                                    <label
                                        className="flex items-center gap-3 w-full cursor-pointer p-3 rounded-xl border border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <FolderOpen size={16} className="text-muted/40 group-hover:text-primary transition-colors shrink-0" />
                                        <span className="text-[10px] text-muted/60 group-hover:text-white transition-colors truncate font-medium">
                                            {file ? file.name : 'Click to select file…'}
                                        </span>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".pdf,.txt"
                                            className="hidden"
                                            onChange={e => {
                                                setFile(e.target.files?.[0] || null);
                                                setUploadStatus('idle');
                                                setUploadResult(null);
                                                setUploadError('');
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Upload button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploadStatus === 'uploading'}
                                    className="w-full py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                                >
                                    {uploadStatus === 'uploading'
                                        ? <><Loader2 size={12} className="animate-spin" /> Ingesting…</>
                                        : <><FileUp size={12} /> Upload & Index</>
                                    }
                                </button>

                                {/* Results */}
                                {uploadStatus === 'success' && uploadResult && (
                                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 space-y-1">
                                        <div className="flex items-center gap-2 text-success">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Indexed Successfully</span>
                                        </div>
                                        <p className="text-[10px] text-muted font-medium pl-5">
                                            {uploadResult.chunks} chunks stored · {uploadResult.redactions} PII tokens redacted
                                        </p>
                                        {uploadResult.redactions > 0 && (
                                            <p className="text-[9px] text-primary/70 pl-5 leading-relaxed">{uploadResult.note}</p>
                                        )}
                                    </div>
                                )}
                                {uploadStatus === 'error' && (
                                    <div className="flex items-center gap-2 text-danger text-[10px] font-bold bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                                        <AlertCircle size={12} /> {uploadError}
                                    </div>
                                )}
                            </>
                        )}
                        {/* ── SESSION TAB ── */}
                        {tab === 'session' && (
                            <>
                                <p className="text-[9px] text-muted/60 uppercase font-bold tracking-widest">
                                    Auto-logout Timer
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">
                                            {timeoutMin === 0 ? '∞ Never expire' : `${timeoutMin} min`}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${timeoutMin === 0
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-warning/10 text-yellow-400 border border-yellow-400/20'
                                            }`}>
                                            {timeoutMin === 0 ? 'Dev Mode' : 'Active'}
                                        </span>
                                    </div>

                                    {/* Slider: 0 = never, 5–480 min */}
                                    <input
                                        type="range"
                                        min={0}
                                        max={480}
                                        step={5}
                                        value={timeoutMin}
                                        onChange={e => setTimeoutMin(Number(e.target.value))}
                                        className="w-full accent-primary cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] text-muted/40 font-bold">
                                        <span>Never</span>
                                        <span>30m</span>
                                        <span>2h</span>
                                        <span>4h</span>
                                        <span>8h</span>
                                    </div>

                                    {/* Quick presets */}
                                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                                        {[0, 30, 60, 240].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setTimeoutMin(v)}
                                                className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${timeoutMin === v
                                                        ? 'bg-primary text-black'
                                                        : 'bg-white/5 border border-white/10 text-muted hover:border-primary/30 hover:text-white'
                                                    }`}
                                            >
                                                {v === 0 ? '∞' : v === 60 ? '1h' : v === 240 ? '4h' : `${v}m`}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-[9px] text-muted/40 leading-relaxed">
                                        Set to <strong className="text-muted/60">∞</strong> during development to stay logged in indefinitely. Changes apply on next activity.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
