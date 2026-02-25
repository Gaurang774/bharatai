'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { Clock, ShieldAlert } from 'lucide-react';

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const WARNING_BEFORE_MS = 60 * 1000; // Show warning 1 minute before

export default function DashboardPage() {
  const [selectedMinistry, setSelectedMinistry] = useState('General');
  const [currentConvId, setCurrentConvId] = useState<number | undefined>();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const resetTimer = useCallback(() => {
    setShowTimeoutWarning(false);
    setCountdown(60);
  }, []);

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const startTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
      setShowTimeoutWarning(false);
      setCountdown(60);

      // Show warning at 4 minutes
      warningTimer = setTimeout(() => {
        setShowTimeoutWarning(true);
        let remaining = 60;
        countdownInterval = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) clearInterval(countdownInterval);
        }, 1000);
      }, SESSION_TIMEOUT_MS - WARNING_BEFORE_MS);

      // Auto-logout at 5 minutes
      logoutTimer = setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      }, SESSION_TIMEOUT_MS);
    };

    startTimers();

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handleActivity = () => {
      startTimers();
    };

    activityEvents.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar 
        selectedMinistry={selectedMinistry} 
        setSelectedMinistry={setSelectedMinistry}
        onConversationSelect={(id) => setCurrentConvId(id)}
      />
      <ChatWindow 
        currentConvId={currentConvId} 
        ministry={selectedMinistry}
        onConvStart={(id) => setCurrentConvId(id)}
      />

      {/* Session Timeout Warning Overlay */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-card border border-danger/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl shadow-danger/10 text-center space-y-4">
            <div className="w-16 h-16 bg-danger/20 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={32} className="text-danger" />
            </div>
            <h3 className="text-xl font-black text-white">Security Timeout</h3>
            <p className="text-sm text-muted">
              Your sovereign session will expire in <span className="text-danger font-black text-lg">{countdown}s</span> due to inactivity.
            </p>
            <p className="text-xs text-muted/60">Move your mouse or press any key to extend the session.</p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-danger/60 uppercase font-bold tracking-widest">
              <Clock size={12} />
              Government Security Compliance Protocol
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
