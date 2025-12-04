import { motion } from 'motion/react';
export default function LoadingScreen() {
  return <div className="fixed inset-0 bg-[#0B1D34] flex items-center justify-center z-50">
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.5
    }} className="relative">
        {/* Mathematical line drawing animation */}
        <svg width="300" height="100" viewBox="0 0 300 100" className="mb-8">
          <motion.path d="M 10 50 Q 40 10, 70 50 T 130 50" stroke="#2F6FED" strokeWidth="2" fill="none" initial={{
          pathLength: 0
        }} animate={{
          pathLength: 1
        }} transition={{
          duration: 1.5,
          ease: "easeInOut"
        }} />
          <motion.circle cx="150" cy="50" r="20" stroke="#F7C94C" strokeWidth="2" fill="none" initial={{
          pathLength: 0,
          opacity: 0
        }} animate={{
          pathLength: 1,
          opacity: 1
        }} transition={{
          duration: 1,
          delay: 0.5
        }} />
          <motion.line x1="180" y1="30" x2="220" y2="70" stroke="#A9C7FF" strokeWidth="2" initial={{
          pathLength: 0
        }} animate={{
          pathLength: 1
        }} transition={{
          duration: 0.8,
          delay: 1
        }} />
          <motion.line x1="220" y1="30" x2="180" y2="70" stroke="#A9C7FF" strokeWidth="2" initial={{
          pathLength: 0
        }} animate={{
          pathLength: 1
        }} transition={{
          duration: 0.8,
          delay: 1.2
        }} />
          <motion.path d="M 240 50 L 260 30 L 280 50 L 260 70 Z" stroke="#2F6FED" strokeWidth="2" fill="none" initial={{
          pathLength: 0
        }} animate={{
          pathLength: 1
        }} transition={{
          duration: 1,
          delay: 1.5
        }} />
        </svg>

        <motion.h1 initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 1.8
      }} className="text-center tracking-wider">
          StudySouq
        </motion.h1>
      </motion.div>
    </div>;
}