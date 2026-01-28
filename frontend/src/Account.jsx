import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail, Key, LogOut, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import AnimatedBackground from './AnimatedBackground';

const Account = ({ user, activeTab, onTabChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        email: 'user@biostrata.ai'
    });

    const handleSecurityChange = (e) => {
        setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
                setMessage({ type: 'error', text: 'New passwords do not match.' });
            } else {
                setMessage({ type: 'success', text: 'Account settings updated successfully.' });
                setSecurityForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-white/20 pb-20">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar activeTab="account" onTabChange={onTabChange} userName={user} />

                <main className="flex-1 w-full max-w-[800px] mx-auto px-6 pt-28">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-medium mb-1">Account & Settings</h1>
                        <p className="text-white/40 text-sm">Manage your profile and security preferences.</p>
                    </motion.div>

                    <div className="space-y-6">

                        {/* 1. Account Info (Read Only) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel p-8"
                        >
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <User className="text-emerald-400" size={20} />
                                <h2 className="text-lg font-medium">Profile Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Username</label>
                                    <div className="w-full py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                                        {user || 'Guest User'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Account Type</label>
                                    <div className="w-full py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-white/80 text-sm font-medium flex items-center justify-between">
                                        Research License
                                        <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded uppercase font-bold tracking-wider">Active</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Last Login</label>
                                    <div className="w-full py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-white/50 text-sm">
                                        {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Security Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-panel p-8"
                        >
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <Shield className="text-blue-400" size={20} />
                                <h2 className="text-lg font-medium">Security Settings</h2>
                            </div>

                            <form onSubmit={handleSaveChanges} className="space-y-6">
                                {/* Email Change */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={securityForm.email}
                                            onChange={handleSecurityChange}
                                            className="modern-input w-full pl-12" // Add left padding for icon
                                        />
                                    </div>
                                </div>

                                {/* Password Change */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">New Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={securityForm.newPassword}
                                                onChange={handleSecurityChange}
                                                className="modern-input w-full pl-12"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={securityForm.confirmPassword}
                                                onChange={handleSecurityChange}
                                                className="modern-input w-full pl-12"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Message */}
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                                            }`}
                                    >
                                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                        {message.text}
                                    </motion.div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="primary-button bg-white text-black hover:bg-gray-200 px-6 py-2.5 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Disclaimer */}
                        <div className="pt-8 text-center opacity-40">
                            <p className="text-[11px] text-white/60">
                                <span className="text-emerald-400 font-bold">DISCLAIMER:</span> This platform is intended for research and clinical decision support only.
                            </p>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Account;
