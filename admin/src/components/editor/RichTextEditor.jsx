import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Image,
  Calculator,
  Eye,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const TOOLBAR_BUTTONS = [
  { icon: Bold, action: 'bold', title: 'Bold', wrap: '**', wrapEnd: '**' },
  { icon: Italic, action: 'italic', title: 'Italic', wrap: '*', wrapEnd: '*' },
  { icon: Heading1, action: 'h1', title: 'Heading 1', prefix: '# ' },
  { icon: Heading2, action: 'h2', title: 'Heading 2', prefix: '## ' },
  { icon: Heading3, action: 'h3', title: 'Heading 3', prefix: '### ' },
  { icon: List, action: 'ul', title: 'Bullet List', prefix: '- ' },
  { icon: ListOrdered, action: 'ol', title: 'Numbered List', prefix: '1. ' },
  { icon: Quote, action: 'quote', title: 'Quote', prefix: '> ' },
  { icon: Code, action: 'code', title: 'Code', wrap: '`', wrapEnd: '`' },
  { icon: Calculator, action: 'math', title: 'Math Block', wrap: '$$\n', wrapEnd: '\n$$' },
  { icon: Image, action: 'image', title: 'Image', insert: '![alt text](url)' },
]

// Render LaTeX formula to HTML
function renderLatex(formula, displayMode = false) {
  try {
    return katex.renderToString(formula.trim(), {
      displayMode,
      throwOnError: false,
      output: 'html',
    })
  } catch (e) {
    return `<span style="color:red">[Math Error: ${formula}]</span>`
  }
}

export function RichTextEditor({ value = '', onChange, placeholder, className, rows = 10 }) {
  const textareaRef = useRef(null)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef(null)

  const handleToolbarClick = (button) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newValue = value
    let newCursorPos = start

    if (button.wrap) {
      const textToWrap = selectedText || 'text'
      newValue = value.substring(0, start) + button.wrap + textToWrap + button.wrapEnd + value.substring(end)
      newCursorPos = start + button.wrap.length + textToWrap.length + button.wrapEnd.length
    } else if (button.prefix) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      newValue = value.substring(0, lineStart) + button.prefix + value.substring(lineStart)
      newCursorPos = start + button.prefix.length
    } else if (button.insert) {
      newValue = value.substring(0, start) + button.insert + value.substring(end)
      newCursorPos = start + button.insert.length
    }

    onChange(newValue)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Render preview with proper markdown and LaTeX
  const renderPreview = () => {
    if (!value) return <div className="text-neutral-400 italic">Nothing to preview</div>
    
    let html = value

    // Step 1: Replace block math $$...$$ with placeholders
    const blockMathPlaceholders = []
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      const placeholder = `__BLOCK_MATH_${blockMathPlaceholders.length}__`
      blockMathPlaceholders.push(renderLatex(formula, true))
      return placeholder
    })

    // Step 2: Replace inline math $...$ with placeholders
    const inlineMathPlaceholders = []
    html = html.replace(/\$([^$\n]+)\$/g, (match, formula) => {
      const placeholder = `__INLINE_MATH_${inlineMathPlaceholders.length}__`
      inlineMathPlaceholders.push(renderLatex(formula, false))
      return placeholder
    })

    // Step 3: Escape HTML
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Step 4: Apply markdown formatting
    html = html
      .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1em;font-weight:600;margin:1em 0 0.5em">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:1.25em;font-weight:600;margin:1em 0 0.5em">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:1.5em;font-weight:700;margin:1em 0 0.5em">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>')
      .replace(/^- (.+)$/gm, '<li style="margin-left:20px">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px">$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:4px solid #ccc;padding-left:16px;color:#666;margin:8px 0">$1</blockquote>')
      .replace(/\n/g, '<br>')

    // Step 5: Restore math placeholders with actual rendered math
    blockMathPlaceholders.forEach((rendered, i) => {
      html = html.replace(`__BLOCK_MATH_${i}__`, `<div style="margin:16px 0;text-align:center">${rendered}</div>`)
    })
    
    inlineMathPlaceholders.forEach((rendered, i) => {
      html = html.replace(`__INLINE_MATH_${i}__`, rendered)
    })

    return (
      <div 
        ref={previewRef}
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    )
  }

  return (
    <div className={cn('border border-neutral-200 rounded-lg overflow-hidden bg-white', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-neutral-50 border-b border-neutral-200 flex-wrap">
        {TOOLBAR_BUTTONS.map((button) => (
          <Button
            key={button.action}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title={button.title}
            onClick={() => handleToolbarClick(button)}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          type="button"
          variant={showPreview ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1"
        >
          {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          {renderPreview()}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Write your notes here...\n\nUse **bold**, *italic*, # Heading\n\nFor math: $x^2$ inline or $$\\frac{a}{b}$$ block"}
          rows={rows}
          className="w-full p-4 resize-none focus:outline-none font-mono text-sm"
          style={{ minHeight: `${rows * 1.5}rem` }}
        />
      )}

      {/* Help text */}
      <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
        Supports Markdown. Use <code className="bg-neutral-200 px-1 rounded">$formula$</code> for inline math, <code className="bg-neutral-200 px-1 rounded">$$formula$$</code> for block math.
      </div>
    </div>
  )
}
