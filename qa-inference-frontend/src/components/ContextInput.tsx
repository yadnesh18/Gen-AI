import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Info, X } from 'lucide-react';

interface ContextInputProps {
  context: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const ContextInput: React.FC<ContextInputProps> = ({
  context,
  onChange,
  onClear,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasContent = context.trim().length > 0;

  return (
    <div className="w-full mb-2 bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden transition-all">
      {/* Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            RAG Context / Grounding
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal hidden sm:inline">
            (upstream reference documents)
          </span>

          {hasContent && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Active ({context.trim().length} chars)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
          <span className="text-[11px] font-medium hidden sm:inline">
            {isOpen ? 'Hide context' : hasContent ? 'View/Edit context' : 'Add context'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Area */}
      {isOpen && (
        <div className="p-3 pt-1 border-t border-gray-150 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-blue-500" />
              Injected as: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-[10px]">Context: ... Question: ...</code>
            </span>
            {hasContent && (
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 flex items-center gap-0.5 transition-colors cursor-pointer"
                title="Clear context text"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <textarea
            value={context}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Paste reference text, document extracts, or vector search results here..."
            className="w-full text-xs font-mono p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-y max-h-48"
            aria-label="RAG Context"
          />
        </div>
      )}
    </div>
  );
};
