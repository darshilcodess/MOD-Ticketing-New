import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Globe } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background text-foreground font-sans">
            {/* Left Side - Visuals */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-[#FF9933] via-white to-[#138808] relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-black/60 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                {/* Chakra Animation */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg" alt="Chakra" className="w-full h-full invert" />
                </motion.div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        Powering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">Public Service</span>
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md">
                        Advanced ticket management system for efficient governance and team collaboration.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-sm text-white/60">
                    <div className="h-px w-8 bg-white/40"></div>
                    © 2026 MOD-I Governance Platform
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative bg-[#020617]">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Secure access to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 group-focus-within:text-[#FF9933] transition-colors" />
                                    <Input
                                        type="email"
                                        required
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-[#FF9933]/50 focus:ring-[#FF9933]/50"
                                        placeholder="officer@gov.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 group-focus-within:text-[#138808] transition-colors" />
                                    <Input
                                        type="password"
                                        required
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-[#138808]/50 focus:ring-[#138808]/50"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-[#FF9933] to-[#FF671F] hover:from-[#FF671F] hover:to-[#e64a19] text-white font-bold tracking-wide shadow-lg shadow-orange-500/20 border-none"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
