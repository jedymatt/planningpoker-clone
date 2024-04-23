'use client';

import { motion } from 'framer-motion';

export function LoadingGameScreen() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="relative flex justify-center items-center h-32 w-32">
        <motion.div
          className="h-14 w-14 bg-blue-100 rounded-full absolute"
          animate={{ scale: [1, 2.5, 1], repeatCount: Infinity }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        ></motion.div>
        <div className="rounded-full h-14 w-14 bg-blue-300 absolute"></div>
      </div>
      <div className="mt-12 text-lg text-gray-500">Loading game...</div>
    </div>
  );
}
