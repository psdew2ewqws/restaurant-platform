import { useState } from 'react'
import { motion } from 'framer-motion'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  clickScale?: number
  delay?: number
}

export function InteractiveCard({ 
  children, 
  className = '', 
  hoverScale = 1.02, 
  clickScale = 0.98,
  delay = 0 
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: clickScale,
        transition: { duration: 0.1 }
      }}
      onTapStart={() => setIsPressed(true)}
      onTapCancel={() => setIsPressed(false)}
      onTap={() => setIsPressed(false)}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 0.3 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}