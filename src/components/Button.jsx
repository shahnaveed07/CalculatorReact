import React from 'react';

/**
 * Calculator Button Component with tactile feedback, accessible labels,
 * and distinct visual hierarchy for numbers, operators, equals, and scientific controls.
 */
export default function Button({
  children,
  onClick,
  variant = 'number',
  ariaLabel,
  className = '',
  disabled = false,
  isActive = false,
  span = 1,
  dataKey,
}) {
  const baseClasses =
    'relative flex items-center justify-center font-medium select-none transition-all duration-150 active:scale-[0.96] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

  // Responsive sizing: comfortable touch targets on mobile (min 44px)
  const sizeClasses = 'h-13 sm:h-14 text-base sm:text-lg';

  let variantClasses = '';
  switch (variant) {
    case 'number':
      variantClasses =
        'bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-slate-100 border border-slate-700/60 shadow-sm';
      break;
    case 'operator':
      variantClasses = isActive
        ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-md shadow-amber-500/20'
        : 'bg-amber-600/90 hover:bg-amber-600 active:bg-amber-700 text-amber-50 font-semibold border border-amber-500/40 shadow-sm';
      break;
    case 'action':
      variantClasses =
        'bg-slate-700/70 hover:bg-slate-700 active:bg-slate-650 text-slate-200 border border-slate-600/50 shadow-sm text-sm sm:text-base';
      break;
    case 'equals':
      variantClasses =
        'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold border border-indigo-400/50 shadow-md shadow-indigo-600/30 text-lg sm:text-xl';
      break;
    case 'scientific':
      variantClasses =
        'bg-slate-850 hover:bg-slate-800 active:bg-slate-750 text-slate-300 hover:text-white border border-slate-800 shadow-xs text-xs sm:text-sm font-mono';
      break;
    case 'memory':
      variantClasses = isActive
        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-semibold text-xs'
        : 'bg-slate-850/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 text-xs';
      break;
    default:
      variantClasses = 'bg-slate-800 text-slate-100';
  }

  const spanClass = span === 2 ? 'col-span-2' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      data-key={dataKey}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${spanClass} ${className}`}
    >
      {children}
    </button>
  );
}
