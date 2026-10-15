'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SpaceGlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      {/* Static Stars - CSS only for better performance */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                           radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
                           radial-gradient(2px 2px at 160px 30px, #eee, transparent),
                           radial-gradient(1px 1px at 200px 60px, rgba(255,255,255,0.7), transparent),
                           radial-gradient(1px 1px at 240px 20px, #fff, transparent),
                           radial-gradient(2px 2px at 280px 50px, rgba(255,255,255,0.5), transparent),
                           radial-gradient(1px 1px at 320px 80px, #eee, transparent),
                           radial-gradient(1px 1px at 360px 40px, rgba(255,255,255,0.8), transparent)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 100px',
          animation: 'starMove 60s linear infinite'
        }}
      />
      
      {/* Red Glow Effect - Single optimized animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 80% 20%, #E94356 0%, #8B1538 40%, transparent 70%)',
        }}
        animate={{
          background: [
            'radial-gradient(ellipse 600px 400px at 80% 20%, #E94356 0%, #8B1538 40%, transparent 70%)',
            'radial-gradient(ellipse 700px 500px at 75% 25%, #E94356 0%, #8B1538 45%, transparent 75%)',
            'radial-gradient(ellipse 500px 350px at 85% 15%, #E94356 0%, #8B1538 35%, transparent 65%)',
            'radial-gradient(ellipse 600px 400px at 80% 20%, #E94356 0%, #8B1538 40%, transparent 70%)',
          ],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* CSS Animation for Stars */}
      <style jsx>{`
        @keyframes starMove {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-100px); }
        }
      `}</style>
    </div>
  );
};

export default SpaceGlowBackground;
