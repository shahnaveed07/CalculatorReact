import React from 'react';
import Calculator from './components/Calculator.jsx';

export default function App() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center my-auto">
        <Calculator />

        {/* Keyboard hints */}
        <div className="mt-4 text-center text-xs text-slate-500 font-mono hidden sm:flex items-center gap-2 select-none">
          <span>Keyboard: 0-9</span>
          <span>·</span>
          <span>+ − × ÷ ^ %</span>
          <span>·</span>
          <span>Enter (=)</span>
          <span>·</span>
          <span>Esc (AC)</span>
          <span>·</span>
          <span>Backspace (⌫)</span>
        </div>
      </div>
    </main>
  );
}
