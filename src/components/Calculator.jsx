import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, History as HistoryIcon } from 'lucide-react';
import Display from './Display.jsx';
import MemoryControls from './MemoryControls.jsx';
import ScientificPanel from './ScientificPanel.jsx';
import ButtonGrid from './ButtonGrid.jsx';
import HistoryPanel from './HistoryPanel.jsx';
import {
  INITIAL_STATE,
  handleDigit,
  handleDecimal,
  handleOperator,
  handleEquals,
  handleClear,
  handleBackspace,
  handleToggleSign,
  handlePercentage,
  handleUnaryScientific,
  handleFunctionInput,
  handleParenthesis,
  handleConstant,
} from '../utils/calculator.js';
import {
  getStoredHistory,
  saveStoredHistory,
  getStoredAngleMode,
  saveStoredAngleMode,
  getStoredScientificOpen,
  saveStoredScientificOpen,
  getStoredMemory,
  saveStoredMemory,
} from '../utils/storage.js';

export default function Calculator() {
  const [calcState, setCalcState] = useState(INITIAL_STATE);
  const [angleMode, setAngleMode] = useState(() => getStoredAngleMode());
  const [isScientificOpen, setIsScientificOpen] = useState(() => getStoredScientificOpen());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [history, setHistory] = useState(() => getStoredHistory());

  // Save changes to storage
  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  useEffect(() => {
    saveStoredAngleMode(angleMode);
  }, [angleMode]);

  useEffect(() => {
    saveStoredScientificOpen(isScientificOpen);
  }, [isScientificOpen]);

  useEffect(() => {
    saveStoredMemory(memory);
  }, [memory]);

  // History action helper
  const addHistoryItem = useCallback((item) => {
    setHistory((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleSelectHistoryItem = useCallback((item) => {
    setCalcState({
      ...INITIAL_STATE,
      currentInput: String(item.result),
      lastResult: item.result,
      isCalculated: false,
    });
    setIsHistoryOpen(false);
  }, []);

  // Angle mode toggle
  const toggleAngleMode = useCallback(() => {
    setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
  }, []);

  // Toggle Scientific Panel visibility
  const toggleScientific = useCallback(() => {
    setIsScientificOpen((prev) => !prev);
  }, []);

  // Memory Handlers
  const handleMemoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const handleMemoryRecall = useCallback(() => {
    if (memory !== 0) {
      setCalcState((prev) => ({
        ...prev,
        currentInput: String(memory),
        isCalculated: false,
      }));
    }
  }, [memory]);

  const handleMemoryAdd = useCallback(() => {
    const val = calcState.isCalculated && calcState.lastResult !== null
      ? calcState.lastResult
      : Number(calcState.currentInput || 0);

    if (Number.isFinite(val)) {
      setMemory((prev) => prev + val);
    }
  }, [calcState]);

  const handleMemorySubtract = useCallback(() => {
    const val = calcState.isCalculated && calcState.lastResult !== null
      ? calcState.lastResult
      : Number(calcState.currentInput || 0);

    if (Number.isFinite(val)) {
      setMemory((prev) => prev - val);
    }
  }, [calcState]);

  // Button handlers
  const onDigit = useCallback((d) => {
    setCalcState((prev) => handleDigit(prev, d));
  }, []);

  const onDecimal = useCallback(() => {
    setCalcState((prev) => handleDecimal(prev));
  }, []);

  const onOperator = useCallback((op) => {
    setCalcState((prev) => handleOperator(prev, op));
  }, []);

  const onEquals = useCallback(() => {
    setCalcState((prev) => handleEquals(prev, angleMode, addHistoryItem));
  }, [angleMode, addHistoryItem]);

  const onClear = useCallback(() => {
    setCalcState(handleClear());
  }, []);

  const onBackspace = useCallback(() => {
    setCalcState((prev) => handleBackspace(prev));
  }, []);

  const onToggleSign = useCallback(() => {
    setCalcState((prev) => handleToggleSign(prev));
  }, []);

  const onPercentage = useCallback(() => {
    setCalcState((prev) => handlePercentage(prev));
  }, []);

  const onUnary = useCallback((fnKey) => {
    setCalcState((prev) => handleUnaryScientific(prev, fnKey));
  }, []);

  const onFunction = useCallback((fnName) => {
    setCalcState((prev) => handleFunctionInput(prev, fnName, angleMode));
  }, [angleMode]);

  const onParenthesis = useCallback((paren) => {
    setCalcState((prev) => handleParenthesis(prev, paren));
  }, []);

  const onConstant = useCallback((constName) => {
    setCalcState((prev) => handleConstant(prev, constName));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is inside an input or editable field
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        onDigit(Number(key));
      } else if (key === '.') {
        e.preventDefault();
        onDecimal();
      } else if (key === '+') {
        e.preventDefault();
        onOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        onOperator('−');
      } else if (key === '*' || key === 'x') {
        e.preventDefault();
        onOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        onOperator('÷');
      } else if (key === '^') {
        e.preventDefault();
        onOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        onPercentage();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        onEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        onClear();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        onParenthesis(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onDigit,
    onDecimal,
    onOperator,
    onPercentage,
    onEquals,
    onBackspace,
    onClear,
    onParenthesis,
  ]);

  return (
    <div
      className={`relative w-full transition-all duration-300 mx-auto rounded-3xl p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl ${
        isScientificOpen ? 'max-w-xl' : 'max-w-sm'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-3 px-1 select-none">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span>Calculator</span>
        </h1>

        <div className="flex items-center gap-2">
          {/* Scientific Mode Toggle */}
          <button
            type="button"
            onClick={toggleScientific}
            aria-expanded={isScientificOpen}
            aria-label="Toggle scientific calculator functions"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-colors"
          >
            <span>Scientific</span>
            {isScientificOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            title="Open calculation history"
            aria-label="Open calculation history"
            className="relative p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-colors"
          >
            <HistoryIcon className="w-4 h-4" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Display */}
      <Display
        formula={calcState.formula}
        currentInput={calcState.currentInput}
        angleMode={angleMode}
        onToggleAngleMode={toggleAngleMode}
        hasMemory={memory !== 0}
        memoryValue={memory}
        isError={calcState.isError}
      />

      {/* Memory Controls Row */}
      <MemoryControls
        onMemoryClear={handleMemoryClear}
        onMemoryRecall={handleMemoryRecall}
        onMemoryAdd={handleMemoryAdd}
        onMemorySubtract={handleMemorySubtract}
        hasMemory={memory !== 0}
      />

      {/* Scientific Panel (Collapsible) */}
      {isScientificOpen && (
        <ScientificPanel
          onFunction={onFunction}
          onUnary={onUnary}
          onOperator={onOperator}
          onConstant={onConstant}
          onParenthesis={onParenthesis}
          angleMode={angleMode}
          onToggleAngleMode={toggleAngleMode}
        />
      )}

      {/* Primary Keypad Grid */}
      <ButtonGrid
        onDigit={onDigit}
        onDecimal={onDecimal}
        onOperator={onOperator}
        onEquals={onEquals}
        onClear={onClear}
        onBackspace={onBackspace}
        onToggleSign={onToggleSign}
        onPercentage={onPercentage}
      />

      {/* History Slide-Over Drawer */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={clearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />
    </div>
  );
}
