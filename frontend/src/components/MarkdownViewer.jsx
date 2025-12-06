import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

export default function MarkdownViewer({ content, className = '' }) {
  if (!content) {
    return <div className={`text-white/50 italic ${className}`}>No content available</div>;
  }

  return (
    <div className={`markdown-content prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          rehypeHighlight
        ]}
        components={{
          // Custom component renderers
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold text-white mb-2 mt-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-white/90 mb-4 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside text-white/90 mb-4 space-y-2 ml-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside text-white/90 mb-4 space-y-2 ml-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-white/90" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-white/5 italic text-white/80"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return inline ? (
              <code
                className="bg-white/10 text-blue-300 px-2 py-1 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={`block bg-black/50 p-4 rounded-lg overflow-x-auto text-sm ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto mb-4 border border-white/10" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img
              className="max-w-full h-auto rounded-lg my-4 border-2 border-white/20"
              loading="lazy"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-white/20 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-white/10" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-white/10" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-white/5 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-white font-semibold border border-white/20" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-white/90 border border-white/20" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-white/20" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-white/90" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        /* KaTeX math styling */
        .markdown-content .katex {
          color: white;
          font-size: 1.1em;
        }

        .markdown-content .katex-display {
          margin: 1.5em 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        /* Syntax highlighting adjustments for dark theme */
        .markdown-content .hljs {
          background: rgba(0, 0, 0, 0.5) !important;
          color: #e6edf3;
        }

        /* Tables */
        .markdown-content table {
          border-collapse: collapse;
        }

        /* Responsive images */
        .markdown-content img {
          max-width: 100%;
          height: auto;
        }

        /* Lists */
        .markdown-content ul ul,
        .markdown-content ol ul,
        .markdown-content ul ol,
        .markdown-content ol ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        /* Nested list indentation */
        .markdown-content ul ul,
        .markdown-content ol ol {
          margin-left: 1.5em;
        }

        /* Task lists (GFM) */
        .markdown-content input[type="checkbox"] {
          margin-right: 0.5em;
        }

        /* Strikethrough (GFM) */
        .markdown-content del {
          text-decoration: line-through;
          opacity: 0.7;
        }

        /* Footnotes */
        .markdown-content .footnotes {
          margin-top: 2em;
          padding-top: 1em;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.9em;
        }

        /* Code block scrollbar */
        .markdown-content pre::-webkit-scrollbar {
          height: 8px;
        }

        .markdown-content pre::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .markdown-content pre::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .markdown-content pre::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
