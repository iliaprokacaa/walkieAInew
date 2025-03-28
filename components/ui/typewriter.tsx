"use client"

import React, { useEffect, useState } from "react"

interface TypewriterProps {
  text: string[]
  speed?: number
  className?: string
  waitTime?: number
  deleteSpeed?: number
  cursorChar?: string
}

export function Typewriter({
  text,
  speed = 70,
  className = "",
  waitTime = 1500,
  deleteSpeed = 40,
  cursorChar = "|"
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!text.length) return

    let timeout: NodeJS.Timeout

    const currentFullText = text[currentIndex]
    
    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false)
        setCurrentIndex((prev) => (prev + 1) % text.length)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
          setShowCursor(true)
        }, deleteSpeed)
      }
    } else {
      if (currentText === currentFullText) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
          setShowCursor(true)
        }, waitTime)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, currentText.length + 1))
          setShowCursor(true)
        }, speed)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, text, speed, deleteSpeed, waitTime])

  return (
    <span className={className}>
      {currentText}
      <span 
        className={`transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        {cursorChar}
      </span>
    </span>
  )
} 