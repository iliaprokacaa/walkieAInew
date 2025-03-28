declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react'
  
  interface SyntaxHighlighterProps {
    language?: string
    style?: any
    children?: string
    PreTag?: keyof JSX.IntrinsicElements
    [key: string]: any
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any
} 