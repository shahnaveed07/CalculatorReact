import React from 'react';
import Button from './Button.jsx';
import { Delete } from 'lucide-react';

export default function ButtonGrid({
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onToggleSign,
  onPercentage,
}) {
  return (
    <div
      role="group"
      aria-label="Calculator primary keypad"
      className="grid grid-cols-4 gap-2 sm:gap-2.5"
    >
      {/* Row 1 */}
      <Button
        variant="action"
        onClick={onClear}
        ariaLabel="All Clear"
        className="text-rose-300 font-semibold"
      >
        AC
      </Button>
      <Button
        variant="action"
        onClick={onToggleSign}
        ariaLabel="Change sign positive or negative"
      >
        ±
      </Button>
      <Button
        variant="action"
        onClick={onPercentage}
        ariaLabel="Percentage"
      >
        %
      </Button>
      <Button
        variant="operator"
        onClick={() => onOperator('÷')}
        ariaLabel="Divide"
      >
        ÷
      </Button>

      {/* Row 2 */}
      <Button variant="number" onClick={() => onDigit(7)}>
        7
      </Button>
      <Button variant="number" onClick={() => onDigit(8)}>
        8
      </Button>
      <Button variant="number" onClick={() => onDigit(9)}>
        9
      </Button>
      <Button
        variant="operator"
        onClick={() => onOperator('×')}
        ariaLabel="Multiply"
      >
        ×
      </Button>

      {/* Row 3 */}
      <Button variant="number" onClick={() => onDigit(4)}>
        4
      </Button>
      <Button variant="number" onClick={() => onDigit(5)}>
        5
      </Button>
      <Button variant="number" onClick={() => onDigit(6)}>
        6
      </Button>
      <Button
        variant="operator"
        onClick={() => onOperator('−')}
        ariaLabel="Subtract"
      >
        −
      </Button>

      {/* Row 4 */}
      <Button variant="number" onClick={() => onDigit(1)}>
        1
      </Button>
      <Button variant="number" onClick={() => onDigit(2)}>
        2
      </Button>
      <Button variant="number" onClick={() => onDigit(3)}>
        3
      </Button>
      <Button
        variant="operator"
        onClick={() => onOperator('+')}
        ariaLabel="Add"
      >
        +
      </Button>

      {/* Row 5 */}
      <Button variant="number" onClick={() => onDigit(0)}>
        0
      </Button>
      <Button
        variant="number"
        onClick={onDecimal}
        ariaLabel="Decimal point"
      >
        .
      </Button>
      <Button
        variant="action"
        onClick={onBackspace}
        ariaLabel="Backspace"
      >
        <Delete className="w-5 h-5 text-slate-300" />
      </Button>
      <Button
        variant="equals"
        onClick={onEquals}
        ariaLabel="Equals calculate"
      >
        =
      </Button>
    </div>
  );
}
