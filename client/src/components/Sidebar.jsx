import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ];

    return (
        <motion.aside
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="hidden w-64 flex-col bg-background/80 border-r border-[#FF9933]/20 backdrop-blur-xl md:flex h-screen sticky top-0"
        >
            <div className="p-6 relative overflow-hidden">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

                <h1 className="text-2xl font-bold text-center">
                    <span className="text-[#FF9933]">MOD</span>
                    <span className="text-white">-</span>
                    <span className="text-[#138808]">I</span>
                </h1>
                <p className="text-xs text-center text-muted-foreground mt-1 tracking-widest uppercase">Governance</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-[#FF9933]/10 text-[#FF9933]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF9933]"
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-[#FF9933]" : "")} />
                                <span className="font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
