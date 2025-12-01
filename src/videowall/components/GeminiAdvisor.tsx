import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, Check } from 'lucide-react';

interface GeminiAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  response: string | null;
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ isOpen, onClose, loading, response }) => {
  const [copied, setCopied] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
        ref={contentRef}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">✨</span> AI Installation Assistant
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
             <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
             </div>
          ) : response ? (
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">
              No content generated. Please try again.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex justify-end gap-3">
          {response && (
            <button 
              onClick={handleCopy}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
