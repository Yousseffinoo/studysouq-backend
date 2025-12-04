import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

export default function RichTextEditor({ value, onChange, placeholder = 'Write something...' }) {
  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Headers
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        
        // Font styles
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        
        // Text formatting
        ['bold', 'italic', 'underline', 'strike'],
        
        // Colors
        [{ color: [] }, { background: [] }],
        
        // Lists
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        
        // Text alignment
        [{ align: [] }],
        
        // Scripts (superscript/subscript)
        [{ script: 'sub' }, { script: 'super' }],
        
        // Math formula (LaTeX support)
        ['formula'],
        
        // Blockquote and code block
        ['blockquote', 'code-block'],
        
        // Links and media
        ['link', 'image', 'video'],
        
        // Clear formatting
        ['clean']
      ]
    },
    
    // Clipboard module for better paste handling
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'script',
    'formula',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white/5 text-white rounded-xl overflow-hidden"
        style={{
          minHeight: '300px'
        }}
      />
      
      {/* Custom Styles */}
      <style jsx global>{`
        /* Editor Container */
        .rich-text-editor .quill {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Toolbar */
        .rich-text-editor .ql-toolbar {
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px 12px 0 0;
          padding: 12px;
        }

        .rich-text-editor .ql-toolbar button {
          color: #94A3B8;
          transition: all 0.2s;
        }

        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #2F6FED;
          background: rgba(47, 111, 237, 0.1);
          border-radius: 6px;
        }

        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #94A3B8;
        }

        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2F6FED;
        }

        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #94A3B8;
        }

        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #2F6FED;
        }

        /* Editor Content Area */
        .rich-text-editor .ql-container {
          border: none;
          flex: 1;
          min-height: 300px;
          border-radius: 0 0 12px 12px;
        }

        .rich-text-editor .ql-editor {
          color: white;
          font-size: 15px;
          line-height: 1.7;
          min-height: 300px;
          padding: 16px;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #94A3B8;
          font-style: italic;
        }

        /* Headings */
        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.75em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        /* Lists */
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 2em;
          margin-bottom: 1em;
        }

        /* Links */
        .rich-text-editor .ql-editor a {
          color: #2F6FED;
          text-decoration: underline;
        }

        .rich-text-editor .ql-editor a:hover {
          color: #A9C7FF;
        }

        /* Code blocks */
        .rich-text-editor .ql-editor pre.ql-syntax {
          background: rgba(0, 0, 0, 0.3);
          color: #A9C7FF;
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          margin: 1em 0;
        }

        /* Blockquotes */
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #2F6FED;
          padding-left: 16px;
          margin: 1em 0;
          color: #94A3B8;
          font-style: italic;
        }

        /* Images */
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }

        /* Math Formulas (KaTeX) */
        .rich-text-editor .ql-editor .ql-formula {
          background: rgba(47, 111, 237, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          margin: 0 2px;
          display: inline-block;
        }

        /* Selection */
        .rich-text-editor .ql-editor ::selection {
          background: rgba(47, 111, 237, 0.3);
        }

        /* Dropdown menus */
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #94A3B8;
        }

        .rich-text-editor .ql-toolbar .ql-picker-options {
          background: #0B1D34;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 4px;
        }

        .rich-text-editor .ql-toolbar .ql-picker-item {
          color: #94A3B8;
          padding: 6px 12px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .rich-text-editor .ql-toolbar .ql-picker-item:hover {
          background: rgba(47, 111, 237, 0.1);
          color: #2F6FED;
        }

        /* Scrollbar */
        .rich-text-editor .ql-editor::-webkit-scrollbar {
          width: 8px;
        }

        .rich-text-editor .ql-editor::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .rich-text-editor .ql-editor::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .rich-text-editor .ql-editor::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

