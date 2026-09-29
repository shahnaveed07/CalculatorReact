import React from 'react';

/**
 * Scientific Calculator Panel containing trigonometry, hyperbolics,
 * powers, roots, logarithms, constants, and parentheses.
 */
export default function ScientificPanel({
  onFunction,
  onUnary,
  onOperator,
  onConstant,
  onParenthesis,
  angleMode,
  onToggleAngleMode,
}) {
  const btnBase =
    'h-10 sm:h-11 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white border border-slate-750/70 text-xs sm:text-sm font-mono transition-all duration-150 active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer shadow-xs';

  return (
    <div
      role="region"
      aria-label="Scientific functions"
      className="pt-2 pb-3 border-t border-slate-850/80 mb-2"
    >
      {/* 6-Column Scientific Grid for Desktop/Tablet, 4-Column on small Mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {/* Trigonometry */}
        <button
          type="button"
          onClick={() => onFunction('sin')}
          aria-label="Sine"
          className={btnBase}
        >
          sin
        </button>
        <button
          type="button"
          onClick={() => onFunction('cos')}
          aria-label="Cosine"
          className={btnBase}
        >
          cos
        </button>
        <button
          type="button"
          onClick={() => onFunction('tan')}
          aria-label="Tangent"
          className={btnBase}
        >
          tan
        </button>
        <button
          type="button"
          onClick={() => onFunction('asin')}
          aria-label="Arcsine"
          className={btnBase}
        >
          sin⁻¹
        </button>
        <button
          type="button"
          onClick={() => onFunction('acos')}
          aria-label="Arccosine"
          className={btnBase}
        >
          cos⁻¹
        </button>
        <button
          type="button"
          onClick={() => onFunction('atan')}
          aria-label="Arctangent"
          className={btnBase}
        >
          tan⁻¹
        </button>

        {/* Hyperbolic */}
        <button
          type="button"
          onClick={() => onFunction('sinh')}
          aria-label="Hyperbolic Sine"
          className={btnBase}
        >
          sinh
        </button>
        <button
          type="button"
          onClick={() => onFunction('cosh')}
          aria-label="Hyperbolic Cosine"
          className={btnBase}
        >
          cosh
        </button>
        <button
          type="button"
          onClick={() => onFunction('tanh')}
          aria-label="Hyperbolic Tangent"
          className={btnBase}
        >
          tanh
        </button>
        <button
          type="button"
          onClick={() => onFunction('asinh')}
          aria-label="Inverse Hyperbolic Sine"
          className={btnBase}
        >
          asinh
        </button>
        <button
          type="button"
          onClick={() => onFunction('acosh')}
          aria-label="Inverse Hyperbolic Cosine"
          className={btnBase}
        >
          acosh
        </button>
        <button
          type="button"
          onClick={() => onFunction('atanh')}
          aria-label="Inverse Hyperbolic Tangent"
          className={btnBase}
        >
          atanh
        </button>

        {/* Powers, Roots & Logs */}
        <button
          type="button"
          onClick={() => onUnary('sqr')}
          aria-label="Square"
          className={btnBase}
        >
          x²
        </button>
        <button
          type="button"
          onClick={() => onUnary('cube')}
          aria-label="Cube"
          className={btnBase}
        >
          x³
        </button>
        <button
          type="button"
          onClick={() => onOperator('^')}
          aria-label="x to the power of y"
          className={btnBase}
        >
          xʸ
        </button>
        <button
          type="button"
          onClick={() => onUnary('sqrt')}
          aria-label="Square root"
          className={btnBase}
        >
          √x
        </button>
        <button
          type="button"
          onClick={() => onUnary('cbrt')}
          aria-label="Cube root"
          className={btnBase}
        >
          ∛x
        </button>
        <button
          type="button"
          onClick={() => onUnary('fact')}
          aria-label="Factorial"
          className={btnBase}
        >
          n!
        </button>

        {/* Inverses, Exponentials & Constants */}
        <button
          type="button"
          onClick={() => onUnary('recip')}
          aria-label="Reciprocal one over x"
          className={btnBase}
        >
          1/x
        </button>
        <button
          type="button"
          onClick={() => onUnary('exp')}
          aria-label="e to the x"
          className={btnBase}
        >
          eˣ
        </button>
        <button
          type="button"
          onClick={() => onUnary('pow10')}
          aria-label="10 to the x"
          className={btnBase}
        >
          10ˣ
        </button>
        <button
          type="button"
          onClick={() => onFunction('ln')}
          aria-label="Natural Logarithm"
          className={btnBase}
        >
          ln
        </button>
        <button
          type="button"
          onClick={() => onFunction('log')}
          aria-label="Logarithm base 10"
          className={btnBase}
        >
          log
        </button>
        <button
          type="button"
          onClick={() => onConstant('π')}
          aria-label="Pi constant"
          className={`${btnBase} text-amber-200 font-serif`}
        >
          π
        </button>

        {/* Constants & Parentheses Row */}
        <button
          type="button"
          onClick={() => onConstant('e')}
          aria-label="Euler constant e"
          className={`${btnBase} text-amber-200 font-serif`}
        >
          e
        </button>
        <button
          type="button"
          onClick={() => onParenthesis('(')}
          aria-label="Open parenthesis"
          className={`${btnBase} font-bold text-indigo-300`}
        >
          (
        </button>
        <button
          type="button"
          onClick={() => onParenthesis(')')}
          aria-label="Close parenthesis"
          className={`${btnBase} font-bold text-indigo-300`}
        >
          )
        </button>

        {/* Deg / Rad Quick Toggle Button in Scientific Grid */}
        <button
          type="button"
          onClick={onToggleAngleMode}
          aria-label={`Toggle angle mode, current is ${angleMode}`}
          className={`${btnBase} sm:col-span-3 col-span-1 bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 font-semibold border-indigo-900/60`}
        >
          Mode: {angleMode}
        </button>
      </div>
    </div>
  );
}
