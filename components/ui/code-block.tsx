"use client"

import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyButton } from "./copy-button"

interface CodeBlockProps {
  files: {
    title: string
    code: string
    language: string
  }[]
  defaultTitle?: string
  className?: string
}

export function CodeBlock({ files = [], defaultTitle, className }: CodeBlockProps) {
  const [activeFile, setActiveFile] = React.useState(defaultTitle || (files.length > 0 ? files[0].title : ''))
  const activeCode = files.find(f => f.title === activeFile)?.code || ""

  return (
    <div className={`relative group rounded-lg bg-black/50 overflow-hidden ${className || ''}`}>
      <div className="relative">
        <SyntaxHighlighter
          language={files.find(f => f.title === activeFile)?.language || 'text'}
          style={vscDarkPlus}
          PreTag="div"
          className="!mt-0 !mb-0 !bg-transparent prose prose-invert !rounded-lg !p-4 !text-[13px]"
          customStyle={{
            margin: 0,
            background: 'transparent',
          }}
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
        >
          {activeCode}
        </SyntaxHighlighter>
        <div className="absolute right-2 bottom-2">
          <CopyButton value={activeCode} />
        </div>
      </div>
    </div>
  )
} 