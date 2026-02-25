import LoginForm from '@/components/LoginForm';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 absolute top-12 flex items-center gap-4 group cursor-default">
        <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform">
          🇮🇳
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Bharat<span className="text-primary tracking-widest">AI</span></h1>
          <p className="text-[10px] text-success font-black uppercase tracking-[0.4em] mt-1 pl-1">Sovereign Intelligence</p>
        </div>
      </div>
      
      <div className="z-10 mb-12 text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-4 tracking-tight">
          Secure, Generative Intelligence Platform for the Government of India
        </h2>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-muted text-sm md:text-base leading-relaxed font-medium">
          A localized, sovereign-compliant environment for policy analysis, administrative automation, and multi-ministry secure collaboration.
        </p>
      </div>

      <div className="z-10 w-full flex justify-center animate-in zoom-in-95 duration-500 delay-100">
        <LoginForm />
      </div>

      <footer className="z-10 absolute bottom-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/5 rounded-full shadow-lg">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">NIC Cloud Infrastructure Verified</span>
        </div>
        <p className="text-muted/40 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">
          &copy; 2024 National Informatics Centre (NIC) | Secure Sovereign Mode 🟢
        </p>
      </footer>
    </main>
  );
}
