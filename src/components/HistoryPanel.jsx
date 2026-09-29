import React from 'react';
import { X, Trash2, History as HistoryIcon, CornerDownLeft } from 'lucide-react';
import { formatDisplayNumber } from '../utils/numberUtils.js';

export default function HistoryPanel({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
}) {
  if (!isOpen) return null;

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calculation history"
      className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 flex flex-col border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <HistoryIcon className="w-4 h-4 text-indigo-400" />
          <span>Calculation History</span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear all history"
              aria-label="Clear all history"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close history"
            aria-label="Close history"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <HistoryIcon className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No calculation history</p>
            <p className="text-xs text-slate-600 mt-1">Calculations will appear here as you work</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={item.id ? `${item.id}-${index}` : `hist-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectHistoryItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectHistoryItem(item);
                }
              }}
              title="Click to insert result into calculation"
              className="group w-full text-left p-3 rounded-xl bg-slate-850/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span className="truncate pr-2">{item.expression}</span>
                <span className="text-slate-600 shrink-0">{formatTime(item.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-mono font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  = {formatDisplayNumber(item.result)}
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
        Click any calculation to reuse its result
      </div>
    </div>
  );
}
