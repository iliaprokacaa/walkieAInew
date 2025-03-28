"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TextRotateProps {
  texts: string[]
  interval?: number
  className?: string
  mainClassName?: string
  staggerFrom?: "first" | "last"
  initial?: { y: string | number }
  animate?: { y: number }
  exit?: { y: string | number }
  staggerDuration?: number
  splitLevelClassName?: string
  transition?: {
    type: string
    damping: number
    stiffness: number
  }
}

export function TextRotate({
  texts,
  interval = 2000,
  className = "",
  mainClassName = "",
  staggerFrom = "first",
  initial = { y: 20 },
  animate = { y: 0 },
  exit = { y: -20 },
  staggerDuration = 0.025,
  splitLevelClassName = "",
  transition = { type: "spring", damping: 30, stiffness: 400 }
}: TextRotateProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsVisible(true)
      }, 200) // Wait for exit animation
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className={`relative h-[1.2em] ${className}`}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentIndex}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            className={`absolute inset-0 flex items-center justify-center ${mainClassName}`}
          >
            <div className={`flex items-center justify-center ${splitLevelClassName}`}>
              {texts[currentIndex]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 