import { calculateExpression, evaluateFunction } from './expressionParser.js';
import { formatDisplayNumber, normalizeFloat, factorial } from './numberUtils.js';

let historyCounter = 0;

/**
 * Generates a unique ID for history entries to prevent React key collisions
 */
export function generateHistoryId() {
  historyCounter++;
  return `${Date.now()}-${historyCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

export const INITIAL_STATE = {
  currentInput: '0',
  formula: '',
  lastResult: null,
  lastOperator: null,
  lastOperand: null,
  isCalculated: false,
  isError: false,
  errorMessage: '',
};

/**
 * Handles digit button clicks (0-9)
 */
export function handleDigit(state, digit) {
  if (state.isError) {
    return {
      ...state,
      currentInput: String(digit),
      formula: '',
      isError: false,
      errorMessage: '',
      isCalculated: false,
    };
  }

  if (state.isCalculated) {
    return {
      ...state,
      currentInput: String(digit),
      formula: '',
      lastResult: null,
      lastOperator: null,
      lastOperand: null,
      isCalculated: false,
    };
  }

  // Prevent multiple leading zeros: '0' followed by '0' remains '0'
  if (state.currentInput === '0') {
    return {
      ...state,
      currentInput: String(digit),
    };
  }

  if (state.currentInput === '-0') {
    return {
      ...state,
      currentInput: `-${digit}`,
    };
  }

  // Max input length protection
  if (state.currentInput.replace(/[.,-]/g, '').length >= 18) {
    return state;
  }

  return {
    ...state,
    currentInput: state.currentInput + String(digit),
  };
}

/**
 * Handles decimal point (.)
 */
export function handleDecimal(state) {
  if (state.isError || state.isCalculated) {
    return {
      ...state,
      currentInput: '0.',
      formula: state.isCalculated ? '' : state.formula,
      isError: false,
      errorMessage: '',
      isCalculated: false,
    };
  }

  if (state.currentInput.includes('.')) {
    return state; // Prevent multiple decimals like 12..5 or 12.3.4
  }

  if (!state.currentInput || state.currentInput === '0') {
    return {
      ...state,
      currentInput: '0.',
    };
  }

  if (state.currentInput === '-') {
    return {
      ...state,
      currentInput: '-0.',
    };
  }

  return {
    ...state,
    currentInput: state.currentInput + '.',
  };
}

/**
 * Handles binary operators (+, −, ×, ÷, ^)
 */
export function handleOperator(state, operator) {
  const displayOp =
    operator === '*' || operator === '×' ? '×' :
    operator === '/' || operator === '÷' ? '÷' :
    operator === '-' || operator === '−' ? '−' : operator;

  if (state.isError) {
    return state;
  }

  // If calculation just completed, start chaining from the result
  if (state.isCalculated && state.lastResult !== null) {
    return {
      ...state,
      formula: `${state.lastResult} ${displayOp} `,
      currentInput: '',
      isCalculated: false,
    };
  }

  // If user hasn't typed an operand yet, check if formula ends with an operator
  if (state.currentInput === '' || state.currentInput === '-') {
    if (state.formula) {
      // Replace existing trailing operator
      const trailingOpRegex = /(\s[+\-−×*÷/\\^]\s*)$/;
      if (trailingOpRegex.test(state.formula)) {
        return {
          ...state,
          formula: state.formula.replace(trailingOpRegex, ` ${displayOp} `),
          currentInput: '',
        };
      }
    } else {
      return {
        ...state,
        formula: `0 ${displayOp} `,
        currentInput: '',
      };
    }
  }

  // Standard case: append currentInput and operator to formula
  const operand = state.currentInput || '0';
  return {
    ...state,
    formula: `${state.formula}${operand} ${displayOp} `,
    currentInput: '',
    isCalculated: false,
  };
}

/**
 * Handles equals (=) evaluation including repeated equals execution
 */
export function handleEquals(state, angleMode = 'DEG', addHistoryItem = null) {
  if (state.isError) {
    return state;
  }

  // Repeated equals case: e.g. 5 + 2 = 7, then = gives 9, then = gives 11
  if (state.isCalculated && state.lastResult !== null && state.lastOperator && state.lastOperand !== null) {
    const repeatExpr = `${state.lastResult} ${state.lastOperator} ${state.lastOperand}`;
    const evalRes = calculateExpression(repeatExpr, angleMode);

    if (!evalRes.success) {
      return {
        ...state,
        isError: true,
        errorMessage: evalRes.error,
        currentInput: evalRes.error,
      };
    }

    if (addHistoryItem) {
      addHistoryItem({
        id: generateHistoryId(),
        expression: repeatExpr,
        result: evalRes.result,
        timestamp: Date.now(),
      });
    }

    return {
      ...state,
      currentInput: String(evalRes.result),
      formula: `${repeatExpr} =`,
      lastResult: evalRes.result,
      isCalculated: true,
      isError: false,
      errorMessage: '',
    };
  }

  let fullExpression = state.formula;

  if (state.currentInput) {
    fullExpression += state.currentInput;
  } else if (!state.formula) {
    return state;
  } else {
    // If ends with trailing operator, e.g. "5 + ", strip operator or duplicate operand
    const match = state.formula.trim().match(/^(.*?)\s*([+\-−×*÷/^])\s*$/);
    if (match) {
      const leftPart = match[1];
      const op = match[2];
      // Repeated binary with left operand, e.g. "5 + " => "5 + 5"
      fullExpression = `${leftPart} ${op} ${leftPart}`;
    }
  }

  if (!fullExpression.trim()) {
    return state;
  }

  // Extract last operator and operand for repeated equals capability
  let extractedOp = null;
  let extractedOperand = null;
  const binaryMatch = fullExpression.trim().match(/([+\-−×*÷/^])\s*([0-9.eE+-]+)\s*$/);
  if (binaryMatch) {
    extractedOp = binaryMatch[1];
    extractedOperand = Number(binaryMatch[2]);
  }

  const evalRes = calculateExpression(fullExpression, angleMode);

  if (!evalRes.success) {
    return {
      ...state,
      isError: true,
      errorMessage: evalRes.error,
      currentInput: evalRes.error,
      formula: fullExpression + ' =',
    };
  }

  const result = evalRes.result;

  if (addHistoryItem) {
    addHistoryItem({
      id: generateHistoryId(),
      expression: fullExpression,
      result: result,
      timestamp: Date.now(),
    });
  }

  return {
    ...state,
    currentInput: String(result),
    formula: `${fullExpression} =`,
    lastResult: result,
    lastOperator: extractedOp,
    lastOperand: extractedOperand,
    isCalculated: true,
    isError: false,
    errorMessage: '',
  };
}

/**
 * Handles All Clear (AC)
 */
export function handleClear() {
  return { ...INITIAL_STATE };
}

/**
 * Handles Backspace (⌫)
 */
export function handleBackspace(state) {
  if (state.isError || state.isCalculated) {
    return {
      ...state,
      currentInput: '0',
      formula: '',
      isError: false,
      errorMessage: '',
      isCalculated: false,
    };
  }

  if (state.currentInput.length > 1) {
    const nextVal = state.currentInput.slice(0, -1);
    // If left with alone '-' or '.', normalize to '0'
    if (nextVal === '-' || nextVal === '') {
      return { ...state, currentInput: '0' };
    }
    return { ...state, currentInput: nextVal };
  }

  // If 1 character left, reset to '0'
  return {
    ...state,
    currentInput: '0',
  };
}

/**
 * Handles Positive/Negative Toggle (±)
 */
export function handleToggleSign(state) {
  if (state.isError) {
    return state;
  }

  if (state.isCalculated && state.lastResult !== null) {
    const negated = -state.lastResult;
    return {
      ...state,
      currentInput: String(negated),
      lastResult: negated,
      formula: '',
      isCalculated: false,
    };
  }

  if (!state.currentInput || state.currentInput === '0') {
    return state;
  }

  if (state.currentInput.startsWith('-')) {
    return {
      ...state,
      currentInput: state.currentInput.slice(1),
    };
  }

  return {
    ...state,
    currentInput: `-${state.currentInput}`,
  };
}

/**
 * Handles Percentage (%)
 */
export function handlePercentage(state) {
  if (state.isError) {
    return state;
  }

  const currentNum = Number(state.currentInput || '0');

  // Check if we are in the middle of a binary addition or subtraction in the formula
  // E.g. "100 + 10%" => 10% of 100 is 10
  const match = state.formula.trim().match(/^([0-9.eE+-]+)\s*([+\-−])\s*$/);
  if (match) {
    const base = Number(match[1]);
    const percentValue = normalizeFloat(base * (currentNum / 100));
    return {
      ...state,
      currentInput: String(percentValue),
    };
  }

  // Standalone percentage: divide by 100
  const divided = normalizeFloat(currentNum / 100);
  return {
    ...state,
    currentInput: String(divided),
    isCalculated: false,
  };
}

/**
 * Handles immediate Unary Scientific Transformations:
 * e.g. x², x³, 1/x, √x, ∛x, n!, 10ˣ, eˣ
 */
export function handleUnaryScientific(state, fnKey) {
  if (state.isError) {
    return state;
  }

  let baseVal = 0;
  if (state.isCalculated && state.lastResult !== null) {
    baseVal = state.lastResult;
  } else {
    baseVal = Number(state.currentInput || '0');
  }

  try {
    let result;
    switch (fnKey) {
      case 'sqr':
        result = evaluateFunction('sqr', baseVal);
        break;
      case 'cube':
        result = evaluateFunction('cube', baseVal);
        break;
      case 'recip':
        result = evaluateFunction('recip', baseVal);
        break;
      case 'sqrt':
        result = evaluateFunction('sqrt', baseVal);
        break;
      case 'cbrt':
        result = evaluateFunction('cbrt', baseVal);
        break;
      case 'fact':
        result = evaluateFunction('fact', baseVal);
        break;
      case 'pow10':
        result = evaluateFunction('pow10', baseVal);
        break;
      case 'exp':
        result = evaluateFunction('exp', baseVal);
        break;
      default:
        throw new Error('Unknown operation');
    }

    return {
      ...state,
      currentInput: String(result),
      lastResult: result,
      isCalculated: false,
      isError: false,
      errorMessage: '',
    };
  } catch (err) {
    return {
      ...state,
      isError: true,
      errorMessage: err.message || 'Error',
      currentInput: err.message || 'Error',
    };
  }
}

/**
 * Handles Scientific Function (sin, cos, tan, ln, log, etc.)
 * If current input has a number, calculates directly; otherwise appends fn( to formula
 */
export function handleFunctionInput(state, fnName, angleMode = 'DEG') {
  if (state.isError) {
    return state;
  }

  // If user currently has an operand typed (or just calculated) and clicks a trig/log fn,
  // evaluate fn(operand) directly for fast scientific interaction!
  const hasTypedNumber = state.currentInput !== '' && state.currentInput !== '0';

  if (hasTypedNumber || (state.isCalculated && state.lastResult !== null)) {
    const operand = state.isCalculated && state.lastResult !== null
      ? state.lastResult
      : Number(state.currentInput);

    try {
      const res = evaluateFunction(fnName, operand, angleMode);
      return {
        ...state,
        currentInput: String(res),
        lastResult: res,
        isCalculated: false,
        isError: false,
        errorMessage: '',
      };
    } catch (err) {
      return {
        ...state,
        isError: true,
        errorMessage: err.message || 'Error',
        currentInput: err.message || 'Error',
      };
    }
  }

  // Otherwise, user is composing expression: append fn( to formula
  return {
    ...state,
    formula: `${state.formula}${fnName}(`,
    currentInput: '',
    isCalculated: false,
  };
}

/**
 * Handles Parentheses ( and )
 */
export function handleParenthesis(state, paren) {
  if (state.isError) {
    return state;
  }

  if (paren === '(') {
    // If currentInput has a number, insert implicit multiplication: e.g. "5(" => "5 * ("
    let prefix = state.formula;
    if (state.currentInput && state.currentInput !== '0') {
      prefix += `${state.currentInput} × `;
    } else if (state.isCalculated && state.lastResult !== null) {
      prefix = `${state.lastResult} × `;
    }

    return {
      ...state,
      formula: `${prefix}(`,
      currentInput: '',
      isCalculated: false,
    };
  }

  if (paren === ')') {
    // Only allow closing parenthesis if there is an unclosed '(' in formula
    let openCount = 0;
    for (const ch of state.formula) {
      if (ch === '(') openCount++;
      if (ch === ')') openCount--;
    }

    if (openCount <= 0) {
      return state; // No matching open parenthesis
    }

    const operand = state.currentInput || '';
    return {
      ...state,
      formula: `${state.formula}${operand})`,
      currentInput: '',
      isCalculated: false,
    };
  }

  return state;
}

/**
 * Handles inserting mathematical constants (π, e)
 */
export function handleConstant(state, constName) {
  if (state.isError || state.isCalculated) {
    return {
      ...state,
      currentInput: constName === 'π' ? String(Math.PI) : String(Math.E),
      formula: state.isCalculated ? '' : state.formula,
      isCalculated: false,
      isError: false,
      errorMessage: '',
    };
  }

  const valStr = constName === 'π' ? String(Math.PI) : String(Math.E);
  return {
    ...state,
    currentInput: valStr,
  };
}
