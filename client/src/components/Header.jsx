import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell } from 'lucide-react';
import { Button } from './ui/Button';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 px-8 flex items-center justify-between border-b border-[#FF9933]/10 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground/80">
                    Jai Hind, <span className="text-[#FF9933]">{user?.email?.split('@')[0]}</span>
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#138808]/10 text-[#138808] border border-[#138808]/20">
                    {user?.role}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#000080] to-[#1E3A8A] flex items-center justify-center ring-2 ring-white/10">
                    <User className="w-5 h-5 text-white" />
                </div>
            </div>
        </header>
    );
};

export default Header;
