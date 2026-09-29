import React from 'react';

export default function MemoryControls({
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  hasMemory,
}) {
  const btnBase =
    'flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 cursor-pointer text-center';

  return (
    <div
      role="group"
      aria-label="Calculator memory controls"
      className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3"
    >
      <button
        type="button"
        onClick={onMemoryClear}
        disabled={!hasMemory}
        aria-label="Memory Clear"
        className={`${btnBase} ${
          hasMemory
            ? 'bg-slate-800/90 text-rose-300 hover:bg-slate-750 border border-slate-700'
            : 'bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed opacity-50'
        }`}
      >
        MC
      </button>

      <button
        type="button"
        onClick={onMemoryRecall}
        disabled={!hasMemory}
        aria-label="Memory Recall"
        className={`${btnBase} ${
          hasMemory
            ? 'bg-slate-800/90 text-indigo-300 hover:bg-slate-750 border border-slate-700 font-semibold'
            : 'bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed opacity-50'
        }`}
      >
        MR
      </button>

      <button
        type="button"
        onClick={onMemoryAdd}
        aria-label="Memory Add"
        className={`${btnBase} bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700`}
      >
        M+
      </button>

      <button
        type="button"
        onClick={onMemorySubtract}
        aria-label="Memory Subtract"
        className={`${btnBase} bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700`}
      >
        M−
      </button>
    </div>
  );
}
