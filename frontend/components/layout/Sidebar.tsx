"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  MessageSquare, 
  ShieldAlert, 
  FolderLock, 
  Settings, 
  LogOut, 
  ChevronDown,
  Clock,
  PlusSquare,
  History,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getUser, clearToken, type UserPayload } from "@/lib/auth";
import { chatApi } from "@/lib/api";

const MINISTRIES = [
  "General",
  "Finance", 
  "Defense", 
  "Health", 
  "Law", 
  "Education", 
  "Infrastructure"
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState("General");
  const [conversations, setConversations] = useState<any[]>([]);
  const [isMinistryOpen, setIsMinistryOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) {
      setSelectedMinistry(u.ministry);
      fetchConversations();
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  const navLinks = [
    { name: "Sovereign Chat", icon: MessageSquare, href: "/dashboard", active: pathname === "/dashboard" },
    { 
      name: "Governance Audit", 
      icon: ShieldAlert, 
      href: "/admin", 
      active: pathname === "/admin",
      adminOnly: true 
    },
    { name: "Document Vault", icon: FolderLock, href: "#", disabled: true, tag: "Coming Soon" },
    { name: "System Settings", icon: Settings, href: "#", disabled: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.adminOnly || user?.role === "admin");

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-[260px] flex-col border-r border-[#222] bg-[#080808]">
      {/* Brand Section */}
      <div className="flex h-16 items-center border-b border-[#222] px-6">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
          <Terminal className="h-5 w-5 text-[#f59e0b]" />
          <span className="text-[#f5f5f5]">Bharat<span className="text-[#f59e0b]">AI</span></span>
        </h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar py-6">
        {/* User Card */}
        {user && (
          <div className="mb-8 px-5">
            <div className="relative rounded-xl border border-[#222] bg-[#111] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/5 text-sm font-black text-[#f59e0b]">
                  {user.sub[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-black text-[#f5f5f5]">
                    {user.sub.split('@')[0]}
                  </span>
                  <div className="mt-1 flex gap-1">
                    <Badge variant="amber" className="h-4 px-1 text-[7px] font-black uppercase tracking-tighter">{user.role}</Badge>
                    <Badge variant="default" className="h-4 px-1 text-[7px] font-black uppercase tracking-tighter border-[#222]">{user.ministry}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ministry Selector */}
        <div className="mb-8 px-6">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#333]">
            Knowledge Domain
          </label>
          <div className="relative">
            <button
              onClick={() => setIsMinistryOpen(!isMinistryOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-[#222] bg-[#111] px-4 py-2.5 text-xs font-bold text-[#f5f5f5] hover:border-[#333] transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                {selectedMinistry}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-[#333] transition-transform", isMinistryOpen && "rotate-180")} />
            </button>
            
            {isMinistryOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-2xl">
                {MINISTRIES.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMinistry(m);
                      setIsMinistryOpen(false);
                    }}
                    className={cn(
                      "flex w-full px-4 py-2 text-xs font-medium hover:bg-[#1c1c1c] transition-colors",
                      selectedMinistry === m ? "text-[#f59e0b]" : "text-[#525252]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mb-8 px-3 space-y-1">
          {filteredLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                link.active 
                  ? "bg-[#161616] text-[#f5f5f5] border border-[#222] shadow-sm" 
                  : "text-[#525252] hover:bg-[#111] hover:text-[#a3a3a3] border border-transparent",
                link.disabled && "cursor-not-allowed opacity-40 grayscale"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon className={cn("h-4.5 w-4.5 transition-colors", link.active ? "text-[#f59e0b]" : "group-hover:text-[#a3a3a3]")} />
                {link.name}
              </div>
              {link.tag && <Badge variant="outline" className="text-[6px] h-3 px-1 border-[#222] opacity-50 uppercase">{link.tag}</Badge>}
            </Link>
          ))}
        </nav>

        {/* Improved History State */}
        <div className="px-6 flex flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#333]">
              <History className="h-3 w-3" />
              Intelligence Feed
            </span>
            <button className="text-[#333] hover:text-[#f59e0b] p-1 transition-colors">
              <PlusSquare className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left rounded-lg border border-transparent px-3 py-2 text-[11px] font-medium text-[#525252] hover:bg-[#111] hover:text-[#a3a3a3] hover:border-[#222] transition-all truncate"
                >
                  {conv.title || "Untitled Session"}
                </button>
              ))
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center text-center px-4 py-10 rounded-2xl border border-dashed border-[#222] bg-[#0c0c0c]/50">
                <div className="mb-3 rounded-full bg-[#111] p-3 border border-[#222]">
                    <MessageSquare className="h-5 w-5 text-[#222]" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#333]">Empty Feed</h4>
                <p className="mt-2 text-[9px] font-medium text-[#222] leading-relaxed uppercase">
                  Start a new terminal session<br/>to begin analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#222] p-5 bg-[#080808]">
        <div className="mb-5 flex items-center gap-2.5 px-2">
          <div className="relative flex h-2 w-2">
            <div className="absolute h-full w-full rounded-full bg-green-500 animate-ping opacity-20" />
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#333]">Sovereign Node v1.02</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-500/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/30 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out Terminal
        </button>
      </div>
    </aside>
  );
};
