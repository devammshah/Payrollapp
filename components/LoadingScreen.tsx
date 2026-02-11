
import React from 'react';
import { Wallet } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-teal-500 blur-3xl opacity-20 animate-pulse" />
        <div className="relative bg-teal-500 p-4 rounded-3xl shadow-2xl shadow-teal-500/40 animate-bounce">
          <Wallet className="w-12 h-12 text-white" />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <h1 className="text-white text-2xl font-black tracking-tighter">ProPay</h1>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 animate-progress" />
        </div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Securing Session</p>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
