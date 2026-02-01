import React from 'react';
import { LogOut, Search, User } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-mesh text-slate-900 flex flex-col overflow-hidden">
            {/* Top Navigation */}
            <header className="h-14 border-b border-glass-border bg-white/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-ibk-navy to-ibk-blue rounded-lg flex items-center justify-center text-white font-bold shadow-glow">
                        B
                    </div>
                    <h1 className="font-bold text-lg text-ibk-navy tracking-tight">
                        IBK <span className="text-slate-500 font-medium">Franchise BaaS</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ibk-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="가맹점 검색..."
                            className="glass-input pl-9 w-64 text-sm bg-white/40"
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <button className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">관리자</span>
                    </button>

                    <button className="text-slate-400 hover:text-red-500 transition-colors p-1.5">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 overflow-hidden">
                {children}
            </main>
        </div>
    );
};
