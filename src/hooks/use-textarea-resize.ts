"use client";

import { useEffect, useRef } from "react";

export function useTextareaResize(value: string, rows: number = 1) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, rows * 24), // Assuming line height is 24px
        400 // Max height
      );
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();

    // Adjust on window resize
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [value, rows]);

  return textareaRef;
} 