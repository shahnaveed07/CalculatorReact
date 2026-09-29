import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatActiveInput } from '../utils/numberUtils.js';

export default function Display({
  formula,
  currentInput,
  angleMode,
  onToggleAngleMode,
  hasMemory,
  memoryValue,
  isError,
}) {
  const [copied, setCopied] = useState(false);

  // Format value for presentation
  const formattedValue = formatActiveInput(currentInput);

  // Dynamic text size based on character count to avoid container overflow
  const charLength = formattedValue.length;
  let textScaleClass = 'text-3xl sm:text-4xl';
  if (charLength > 18) {
    textScaleClass = 'text-lg sm:text-xl';
  } else if (charLength > 14) {
    textScaleClass = 'text-xl sm:text-2xl';
  } else if (charLength > 10) {
    textScaleClass = 'text-2xl sm:text-3xl';
  }

  const handleCopy = async () => {
    try {
      // Strip formatting commas for clean clipboard paste
      const rawText = currentInput.replace(/,/g, '');
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Calculator display"
      className="relative flex flex-col justify-end p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner overflow-hidden mb-3 min-h-[110px] sm:min-h-[120px]"
    >
      {/* Top Header Bar: Status Badges & Copy Action */}
      <div className="flex items-center justify-between gap-2 text-xs mb-1.5 select-none">
        <div className="flex items-center gap-2">
          {/* DEG / RAD Indicator */}
          <button
            type="button"
            onClick={onToggleAngleMode}
            title="Toggle between Degrees and Radians"
            className="px-2 py-0.5 rounded font-mono font-semibold tracking-wider text-[11px] bg-slate-800 hover:bg-slate-750 text-indigo-400 border border-slate-700/80 transition-colors"
          >
            {angleMode}
          </button>

          {/* Memory Active Indicator */}
          {hasMemory && (
            <span
              title={`Memory active: ${memoryValue}`}
              className="px-2 py-0.5 rounded font-mono font-semibold tracking-wider text-[11px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 flex items-center gap-1"
            >
              <span>M</span>
            </span>
          )}
        </div>

        {/* Copy to clipboard button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy current value"
          aria-label="Copy current value"
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Formula History Line */}
      <div
        className="h-5 text-right font-mono text-xs sm:text-sm text-slate-400/90 truncate tracking-wide select-all"
        title={formula}
      >
        {formula || <span className="opacity-0">0</span>}
      </div>

      {/* Main Value Display */}
      <div
        className={`text-right font-mono font-medium tracking-tight truncate select-all transition-all duration-100 ${textScaleClass} ${
          isError ? 'text-rose-400 font-semibold' : 'text-white'
        }`}
        title={formattedValue}
      >
        {formattedValue}
      </div>
    </div>
  );
}
