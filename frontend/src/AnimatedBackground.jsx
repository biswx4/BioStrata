import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ className = "fixed inset-0" }) => {
    return (
        <div className={`${className} z-0 overflow-hidden bg-[#020405] pointer-events-none`}>

            {/* 
        MAX VISIBILITY UPDATE:
        - Opacity increased to 0.6 - 0.8
        - Colors are sharper (narrower gradients)
        - mix-blend-mode: screen/overlay for brightness
        - will-change: transform for performance
        - repeatType: "mirror" for smooth loops
      */}

            {/* Beam 1: Emerald Flow - Strong & Sharp */}
            <motion.div
                animate={{
                    x: ['-20%', '10%'],
                    y: ['-10%', '10%'],
                    rotate: [-45, -35],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
                className="absolute top-[-50%] left-[-20%] w-[200%] h-[200%] opacity-[0.6] mix-blend-screen will-change-transform"
                style={{
                    // Brighter core, faster falloff
                    background: 'linear-gradient(transparent 45%, rgba(16, 185, 129, 0.9) 50%, transparent 55%)',
                    filter: 'blur(45px)',
                }}
            />

            {/* Beam 2: Blue Deep Flow - Intense */}
            <motion.div
                animate={{
                    x: ['20%', '-10%'],
                    y: ['0%', '-10%'],
                    rotate: [45, 35],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
                className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] opacity-[0.6] mix-blend-screen will-change-transform"
                style={{
                    background: 'linear-gradient(transparent 45%, rgba(59, 130, 246, 0.8) 50%, transparent 55%)',
                    filter: 'blur(55px)',
                }}
            />

            {/* Beam 3: Cyan Cross Flow */}
            <motion.div
                animate={{
                    y: ['10%', '-10%'],
                    rotate: [15, 0],
                    scaleX: [1, 1.3],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
                className="absolute top-[20%] left-[-20%] w-[150%] h-[150%] opacity-[0.5] mix-blend-screen will-change-transform"
                style={{
                    background: 'linear-gradient(90deg, transparent 48%, rgba(6, 182, 212, 0.7) 50%, transparent 52%)',
                    filter: 'blur(40px)',
                }}
            />

            {/* Texture - Slightly stronger to catch light */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
