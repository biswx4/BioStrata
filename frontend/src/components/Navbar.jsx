import React from 'react';
import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, FileText, UserCircle } from 'lucide-react';

const Navbar = ({ activeTab, onTabChange, userName }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analysis', label: 'Analysis', icon: Activity },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'account', label: 'Account', icon: UserCircle },
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-panel px-2 py-2 flex items-center gap-2 pointer-events-auto"
            >

                {/* Logo Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 mr-2">
                    <Activity className="w-5 h-5 text-white" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                    relative px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300
                    ${isActive ? 'text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-xl shadow-lg shadow-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={16} strokeWidth={2} />
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sep */}
                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* User Info */}
                <div className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>

            </motion.nav>
        </div>
    );
};

export default Navbar;
