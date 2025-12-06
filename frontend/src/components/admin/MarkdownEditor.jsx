import { useState, useMemo, useCallback } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import { Image as ImageIcon, Eye, Upload } from 'lucide-react';
import 'easymde/dist/easymde.min.css';
import 'katex/dist/katex.min.css';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';

// Import syntax highlighting
import 'highlight.js/styles/github-dark.css';

export default function MarkdownEditor({ value, onChange, placeholder = 'Write your content in Markdown...' }) {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle image upload
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return null;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', file.name);
      formData.append('category', 'note');
      formData.append('subject', 'general');

      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to upload images');
        return null;
      }

      // Upload to backend
      const response = await fetch(`${API_BASE_URL}/admin/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }

      toast.success('Image uploaded successfully');
      return data.data.url; // Return the Cloudinary URL
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  // SimpleMDE options
  const options = useMemo(() => ({
    spellChecker: false,
    placeholder: placeholder,
    status: ['lines', 'words', 'cursor'],
    autofocus: true,
    minHeight: '400px',
    maxHeight: '600px',
    sideBySideFullscreen: false,
    toolbar: [
      'bold',
      'italic',
      'strikethrough',
      '|',
      'heading-1',
      'heading-2',
      'heading-3',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      {
        name: 'upload-image',
        action: async (editor) => {
          // Create file input
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Show uploading status
            const cm = editor.codemirror;
            const startPos = cm.getCursor();
            cm.replaceRange('![Uploading...]()', startPos);
            cm.setCursor({ line: startPos.line, ch: startPos.ch + 15 });

            // Upload image
            const url = await handleImageUpload(file);

            if (url) {
              // Replace placeholder with actual image
              const doc = cm.getDoc();
              const currentContent = doc.getValue();
              const updatedContent = currentContent.replace(
                '![Uploading...]()',
                `![${file.name}](${url})`
              );
              doc.setValue(updatedContent);
              toast.success('Image inserted successfully');
            } else {
              // Remove placeholder on failure
              const doc = cm.getDoc();
              const currentContent = doc.getValue();
              const updatedContent = currentContent.replace('![Uploading...]()', '');
              doc.setValue(updatedContent);
            }
          };
          input.click();
        },
        className: 'fa fa-image',
        title: 'Upload Image'
      },
      '|',
      {
        name: 'insert-formula',
        action: (editor) => {
          const cm = editor.codemirror;
          const formula = prompt('Enter LaTeX formula (without $ symbols):');
          if (formula) {
            const cursor = cm.getCursor();
            const isBlock = confirm('Insert as block formula? (Click OK for block, Cancel for inline)');
            const text = isBlock ? `\n$$\n${formula}\n$$\n` : `$${formula}$`;
            cm.replaceRange(text, cursor);
          }
        },
        className: 'fa fa-calculator',
        title: 'Insert Math Formula (LaTeX)'
      },
      '|',
      'code',
      'table',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide'
    ],
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true
    },
    shortcuts: {
      toggleBold: 'Cmd-B',
      toggleItalic: 'Cmd-I',
      toggleCodeBlock: 'Cmd-Alt-C',
      toggleHeadingBigger: 'Shift-Cmd-H',
      toggleHeadingSmaller: 'Cmd-H',
      toggleUnorderedList: 'Cmd-L',
      toggleOrderedList: 'Cmd-Alt-L'
    }
  }), [placeholder, handleImageUpload]);

  return (
    <div className="markdown-editor-container">
      {/* Upload status */}
      {uploading && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400 animate-pulse" />
          <span className="text-blue-400 text-sm">Uploading image...</span>
        </div>
      )}

      {/* Editor */}
      <SimpleMDE
        value={value || ''}
        onChange={onChange}
        options={options}
      />

      {/* Helper text */}
      <div className="mt-3 text-xs text-white/50 space-y-1">
        <p>💡 <strong>Quick Tips:</strong></p>
        <ul className="ml-4 space-y-1">
          <li>• Use **bold** for bold text, *italic* for italic</li>
          <li>• Insert images: Click the image icon or use: ![alt text](url)</li>
          <li>• Insert formulas: Click calculator icon or use $inline$ or $$block$$</li>
          <li>• Code blocks: Use ``` for fenced code blocks</li>
        </ul>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        /* Editor container */
        .markdown-editor-container .EasyMDEContainer {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        /* Toolbar */
        .markdown-editor-container .EasyMDEContainer .editor-toolbar {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
        }

        .markdown-editor-container .editor-toolbar button {
          color: #94A3B8 !important;
          border-radius: 6px;
        }

        .markdown-editor-container .editor-toolbar button:hover,
        .markdown-editor-container .editor-toolbar button.active {
          background: rgba(47, 111, 237, 0.1);
          color: #2F6FED !important;
        }

        .markdown-editor-container .editor-toolbar i.separator {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: none;
        }

        /* Editor area */
        .markdown-editor-container .CodeMirror {
          background: transparent;
          color: white;
          border: none;
          padding: 16px;
          font-size: 15px;
          line-height: 1.7;
          min-height: 400px;
        }

        .markdown-editor-container .CodeMirror-cursor {
          border-left: 2px solid #2F6FED;
        }

        .markdown-editor-container .CodeMirror-selected {
          background: rgba(47, 111, 237, 0.2);
        }

        /* Placeholder */
        .markdown-editor-container .CodeMirror-placeholder {
          color: #94A3B8 !important;
          font-style: italic;
        }

        /* Syntax highlighting */
        .markdown-editor-container .cm-header {
          color: #A9C7FF;
          font-weight: bold;
        }

        .markdown-editor-container .cm-strong {
          color: #F7C94C;
          font-weight: bold;
        }

        .markdown-editor-container .cm-em {
          color: #A9C7FF;
          font-style: italic;
        }

        .markdown-editor-container .cm-link {
          color: #2F6FED;
          text-decoration: underline;
        }

        .markdown-editor-container .cm-url {
          color: #94A3B8;
        }

        .markdown-editor-container .cm-quote {
          color: #94A3B8;
          font-style: italic;
        }

        .markdown-editor-container .cm-code,
        .markdown-editor-container .cm-comment {
          color: #A9C7FF;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 4px;
          border-radius: 3px;
        }

        /* Status bar */
        .markdown-editor-container .editor-statusbar {
          background: rgba(255, 255, 255, 0.03);
          color: #94A3B8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          font-size: 12px;
        }

        /* Preview mode */
        .markdown-editor-container .editor-preview,
        .markdown-editor-container .editor-preview-side {
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 16px;
        }

        /* Scrollbar */
        .markdown-editor-container .CodeMirror-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .markdown-editor-container .CodeMirror-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .markdown-editor-container .CodeMirror-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .markdown-editor-container .CodeMirror-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
