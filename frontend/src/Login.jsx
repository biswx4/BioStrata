import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Lock, User } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const ACCOUNTS = {
        "Merey": "18082009",
        "Amina": "aminaloh"
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (ACCOUNTS[username] === password) {
                onLogin(username);
            } else {
                setError('Invalid credentials');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-['Outfit']">

            {/* Background for overall depth - Full Visibility */}
            <div className="absolute inset-0 z-0">
                <AnimatedBackground />
            </div>

            {/* Main Split Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[900px] h-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-row relative z-10 mx-4"
            >

                {/* LEFT SIDE - FORM (White) */}
                <div className="w-full md:w-[40%] bg-white p-10 flex flex-col justify-center relative">

                    {/* Logo Small */}
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                            <Activity size={16} />
                        </div>
                        <span className="text-black font-semibold tracking-tight text-sm">BioStrata</span>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-black mb-1">Welcome Back</h2>
                        <p className="text-gray-400 text-xs mb-8">Clinical Decision Support System</p>

                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 text-black text-sm rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 font-medium placeholder:text-gray-400"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 text-black text-sm rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 font-medium placeholder:text-gray-400"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-500 text-[11px] font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="w-full bg-black text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-black/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-[10px] text-gray-300 mt-8">
                            Strictly for research use only.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE - VISUAL (Aurora) */}
                <div className="hidden md:flex w-[60%] relative overflow-hidden bg-black items-center justify-center p-12">

                    {/* Localized Aurora Background */}
                    <div className="absolute inset-0 z-0 opacity-80">
                        <AnimatedBackground className="absolute inset-0" />
                    </div>

                    {/* Glass Overlay for Text Readability */}
                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <h1 className="text-5xl font-light text-white leading-tight mb-6 tracking-tight">
                                Tumor <br />
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                                    Microenvironment
                                </span> <br />
                                Analysis
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-white/60 text-sm font-light max-w-xs mx-auto leading-relaxed"
                        >
                            Advanced AI-driven insights for clinical research and precision oncology.
                        </motion.p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-6 right-6 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                        <div className="w-2 h-2 rounded-full bg-white/60" />
                    </div>

                </div>

            </motion.div>
        </div>
    );
};

export default LoginPage;
