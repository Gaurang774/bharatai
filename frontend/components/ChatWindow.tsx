'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi } from '@/lib/api';
import { Paperclip, Send, Bot, User as UserIcon, ShieldCheck, ShieldAlert, Globe, Wifi } from 'lucide-react';

// Ministry-specific query templates
const MINISTRY_TEMPLATES: Record<string, { q: string; icon: string }[]> = {
  General: [
    { q: "Summarize Digital India Act 2024", icon: "📄" },
    { q: "Analyze local budget impact", icon: "📊" },
    { q: "Draft inter-ministry memo", icon: "✍️" },
    { q: "Verify RTI compliance", icon: "✅" },
  ],
  Finance: [
    { q: "Draft FY2025 budget allocation memo", icon: "💰" },
    { q: "Analyze GST collection trend Q1-Q3", icon: "📈" },
    { q: "Compare RBI monetary policy options", icon: "🏦" },
    { q: "Summarize FRBM Act compliance status", icon: "📋" },
  ],
  Defense: [
    { q: "Summarize DRDO annual report highlights", icon: "🛡️" },
    { q: "Draft procurement timeline for fleet modernization", icon: "⚓" },
    { q: "Analyze border infrastructure investment ROI", icon: "🏗️" },
    { q: "Generate inter-service coordination report", icon: "📡" },
  ],
  Health: [
    { q: "PMJAY scheme eligibility for rural households", icon: "🏥" },
    { q: "Summarize vaccination coverage data by state", icon: "💉" },
    { q: "Draft epidemic preparedness protocol", icon: "🦠" },
    { q: "Analyze Ayushman Bharat outcomes 2024", icon: "📊" },
  ],
  Law: [
    { q: "Analyze DPDP Act 2023 implications", icon: "⚖️" },
    { q: "Draft RTI response template", icon: "📝" },
    { q: "Summarize IT Amendment Act provisions", icon: "🖥️" },
    { q: "Compare judicial reform proposals", icon: "🏛️" },
  ],
  Education: [
    { q: "NEP 2020 implementation status", icon: "🎓" },
    { q: "Analyze Samagra Shiksha outcomes", icon: "📚" },
    { q: "Draft digital literacy initiative proposal", icon: "💻" },
    { q: "Compare state-wise education spending", icon: "📊" },
  ],
  Infrastructure: [
    { q: "Summarize Bharatmala project progress", icon: "🛣️" },
    { q: "Draft smart city mission update", icon: "🏙️" },
    { q: "Analyze rural connectivity under PMGSY", icon: "🌾" },
    { q: "Compare metro rail expansion timelines", icon: "🚇" },
  ],
};

export default function ChatWindow({
  currentConvId,
  ministry,
  onConvStart,
  model,
}: {
  currentConvId?: number,
  ministry: string,
  onConvStart: (id: number) => void,
  model?: string,
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [language, setLanguage] = useState('English');
  const [ragMeta, setRagMeta] = useState<{ docs: number; confidence: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConvId) {
      chatApi.getMessages(currentConvId).then(res => setMessages(res.data));
    } else {
      setMessages([]);
    }
  }, [currentConvId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (confirmSensitive = false) => {
    if (!input.trim()) return;

    const messageToSend = input;
    setInput('');
    setLoading(true);
    setRagMeta(null);

    // Initial message display
    const userMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatApi.sendMessage(messageToSend, currentConvId, ministry, language, model);

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(prev => prev + chunk);
      }

      // Parse RAG_META token if present
      let cleanText = fullText;
      const ragMatch = fullText.match(/\n?\[RAG_META:(\d+):([\d.]+)\]/);
      if (ragMatch) {
        cleanText = fullText.replace(ragMatch[0], '');
        setRagMeta({ docs: parseInt(ragMatch[1]), confidence: parseFloat(ragMatch[2]) });
      }

      // Once done, add to final messages and clear stream
      setMessages(prev => [...prev, { role: 'assistant', content: cleanText, ragMeta: ragMatch ? { docs: parseInt(ragMatch[1]), confidence: parseFloat(ragMatch[2]) } : null }]);
      setStreamingText('');

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Unable to reach sovereign cloud." }]);
    } finally {
      setLoading(false);
    }
  };

  const templates = MINISTRY_TEMPLATES[ministry] || MINISTRY_TEMPLATES['General'];

  return (
    <div className="flex-1 flex flex-col bg-background relative h-screen font-sans">
      {/* Top Bar Status */}
      <div className="h-16 bg-card/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-success" />
            <span className="text-xs font-black uppercase tracking-widest text-success/80">Sovereign Mode — No Internet Required</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(l => l === 'English' ? 'Hindi' : 'English')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${language === 'Hindi'
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                : 'bg-white/5 border-white/10 text-muted hover:border-primary/30'
              }`}
          >
            <Globe size={12} />
            {language === 'Hindi' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
          </button>
          <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{ministry} Workspace</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-36 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center min-h-full text-center space-y-6">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-bounce-slow">
              🏛️
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">BharatAI Sentinel</h2>
              <p className="text-muted text-sm max-w-sm font-medium">
                {language === 'Hindi' ? 'राष्ट्रीय सुरक्षा स्तर बुद्धिमत्ता कार्यक्षेत्र' : 'National Security Level Intelligence Workspace'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mt-10">
              {templates.map(p => (
                <button
                  key={p.q}
                  onClick={() => setInput(p.q)}
                  className="group text-left text-xs p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3"
                >
                  <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{p.icon}</span>
                  <span className="font-semibold text-white/80 group-hover:text-white truncate">{p.q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-5 max-w-5xl mx-auto w-full group ${m.role === 'assistant' ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'assistant' ? 'bg-primary text-black' : 'bg-secondary border border-white/10'}`}>
              {m.role === 'assistant' ? <Bot size={22} className="font-bold" /> : <UserIcon size={22} />}
            </div>
            <div className="space-y-2 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-black uppercase tracking-widest ${m.role === 'assistant' ? 'text-primary' : 'text-muted'}`}>
                  {m.role === 'assistant' ? 'BharatAI Core' : 'Sovereign ID: NIC-001'}
                </p>
                {m.role === 'assistant' && (
                  <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black tracking-tighter">SECURE</span>
                )}
              </div>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'text-white/90 font-medium' : 'text-white/70'}`}>
                {m.content}
              </div>
              {/* RAG Confidence Badge */}
              {m.role === 'assistant' && m.ragMeta && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold mt-2">
                  📎 Based on {m.ragMeta.docs} ministry document{m.ragMeta.docs > 1 ? 's' : ''} — {m.ragMeta.confidence}% confidence
                </div>
              )}
              {m.is_flagged && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-md text-[10px] font-bold mt-2">
                  <ShieldAlert size={12} /> PROMPT FIREWALL: SENSITIVE DATA DETECTED
                </div>
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex gap-5 max-w-5xl mx-auto w-full animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Bot size={22} />
            </div>
            <div className="space-y-2 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Generating Insight...</p>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/90 font-medium border-l-2 border-primary/30 pl-4">
                {streamingText.replace(/\n?\[RAG_META:\d+:[\d.]+\]/, '')}
                <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-amber-200/50 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-2 flex flex-col gap-2 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-2 pt-1">
              <span className="text-[8px] font-black text-muted uppercase tracking-[0.3em] flex-1">Mission Control Input</span>
              {language === 'Hindi' && (
                <span className="text-[8px] font-black text-orange-400 uppercase tracking-wider">🇮🇳 हिंदी मोड सक्रिय</span>
              )}
            </div>
            <div className="flex items-end gap-2 pr-2">
              <button className="mb-2 p-2.5 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                <Paperclip size={20} />
              </button>
              <textarea
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-sm p-3 resize-none max-h-48 scrollbar-hide focus:ring-0 placeholder:text-white/20"
                placeholder={language === 'Hindi' ? `${ministry} डेटासेट के बारे में कुछ भी पूछें...` : `Ask anything about ${ministry} datasets...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="mb-2 p-3 bg-primary text-black rounded-xl hover:bg-amber-500 hover:shadow-lg disabled:opacity-20 disabled:grayscale transition-all active:scale-95"
              >
                <Send size={20} className="font-black" />
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <p className="inline-flex items-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
              <ShieldCheck size={12} className="text-success" />
              Sovereign Instance Encrypted | End-to-End Governance Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
