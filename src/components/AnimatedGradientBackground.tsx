'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedGradientBackgroundProps {
  className?: string;
}

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base dark background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Animated gradient blob */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 30% 20%, #E94356 0%, #370031 40%, transparent 70%)',
        }}
        animate={{
          background: [
            'radial-gradient(ellipse 800px 600px at 30% 20%, #E94356 0%, #370031 40%, transparent 70%)',
            'radial-gradient(ellipse 900px 700px at 70% 80%, #E94356 0%, #370031 45%, transparent 75%)',
            'radial-gradient(ellipse 750px 500px at 50% 50%, #E94356 0%, #370031 35%, transparent 65%)',
            'radial-gradient(ellipse 800px 600px at 30% 20%, #E94356 0%, #370031 40%, transparent 70%)',
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Secondary animated blob for more organic movement */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 80% 30%, #E94356 0%, transparent 60%)',
        }}
        animate={{
          background: [
            'radial-gradient(ellipse 600px 400px at 80% 30%, #E94356 0%, transparent 60%)',
            'radial-gradient(ellipse 500px 300px at 20% 70%, #E94356 0%, transparent 50%)',
            'radial-gradient(ellipse 700px 500px at 60% 10%, #E94356 0%, transparent 70%)',
            'radial-gradient(ellipse 600px 400px at 80% 30%, #E94356 0%, transparent 60%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedGradientBackground;
