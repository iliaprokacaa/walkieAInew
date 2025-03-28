"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PatternCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

interface PatternCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function PatternCard({ children, className, ...props }: PatternCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-background p-6",
        "before:absolute before:inset-0 before:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] before:bg-[size:24px_24px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PatternCardBody({ children, className, ...props }: PatternCardBodyProps) {
  return (
    <div className={cn("relative z-10", className)} {...props}>
      {children}
    </div>
  )
} 