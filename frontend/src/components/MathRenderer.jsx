import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import 'katex/dist/katex.min.css';

/**
 * MathRenderer Component
 *
 * Renders content with full LaTeX math support using KaTeX.
 * Supports both Markdown and HTML content formats.
 *
 * Features:
 * - Inline math: $x^2$
 * - Display math: $$\int_0^1 x^2 dx$$
 * - Aligned equations: \begin{aligned}...\end{aligned}
 * - Markdown features: headings, lists, code blocks, tables, images
 * - HTML content (backward compatible with existing content)
 * - XSS protection via rehype-sanitize
 *
 * @param {string} content - The content to render (markdown or HTML)
 * @param {string} className - Additional CSS classes
 */
export default function MathRenderer({ content, className = '' }) {
  // Re-render KaTeX on content updates
  useEffect(() => {
    // This ensures proper rendering on dynamic updates
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <div className={`math-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
        components={{
          // Custom component styling for dark theme
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-lg font-bold mb-2 mt-3" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-base font-bold mb-2 mt-3" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-sm font-bold mb-2 mt-2" {...props} />,

          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,

          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,

          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-white/30 pl-4 py-2 mb-4 italic text-white/80" {...props} />
          ),

          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="bg-white/10 px-2 py-1 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-white/10 p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm" {...props} />
            ),

          pre: ({ node, ...props }) => (
            <pre className="bg-white/10 p-4 rounded-lg mb-4 overflow-x-auto" {...props} />
          ),

          a: ({ node, ...props }) => (
            <a className="text-white underline hover:text-white/80 transition-colors" {...props} />
          ),

          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-lg my-4 border-2 border-white/20" {...props} />
          ),

          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-2 border-white/20" {...props} />
            </div>
          ),

          thead: ({ node, ...props }) => (
            <thead className="bg-white/10" {...props} />
          ),

          th: ({ node, ...props }) => (
            <th className="border border-white/20 px-4 py-2 text-left font-bold" {...props} />
          ),

          td: ({ node, ...props }) => (
            <td className="border border-white/20 px-4 py-2" {...props} />
          ),

          hr: ({ node, ...props }) => (
            <hr className="border-t-2 border-white/20 my-6" {...props} />
          ),

          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),

          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        /* KaTeX styling for dark theme */
        .math-content .katex {
          font-size: 1.1em;
          color: white;
        }

        .math-content .katex-display {
          margin: 1.5em 0;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
        }

        .math-content .katex-display > .katex {
          white-space: normal;
        }

        /* Inline math styling */
        .math-content .katex-html {
          color: white;
        }

        /* Matrix and aligned environments */
        .math-content .katex .vlist-t {
          color: white;
        }

        /* Ensure math renders properly on dark background */
        .math-content .katex .mord,
        .math-content .katex .mbin,
        .math-content .katex .mrel,
        .math-content .katex .mopen,
        .math-content .katex .mclose,
        .math-content .katex .mpunct,
        .math-content .katex .minner {
          color: white;
        }

        /* Fraction lines */
        .math-content .katex .frac-line {
          border-bottom-color: white;
        }

        /* Square root lines */
        .math-content .katex .sqrt > .root {
          color: white;
        }

        .math-content .katex .sqrt > .vlist-t {
          border-left-color: white;
        }

        /* Responsive math on mobile */
        @media (max-width: 640px) {
          .math-content .katex {
            font-size: 1em;
          }

          .math-content .katex-display {
            padding: 0.75rem;
            margin: 1rem 0;
          }
        }

        /* Code syntax highlighting compatibility */
        .math-content pre code {
          background: transparent;
          padding: 0;
        }

        /* Ensure images don't break layout */
        .math-content img {
          max-width: 100%;
          height: auto;
        }

        /* Table responsiveness */
        .math-content table {
          border-collapse: collapse;
        }

        /* Links */
        .math-content a {
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
