import { normalizeFloat, factorial } from './numberUtils.js';

/**
 * Tokens definition and Safe Mathematical Parser using Shunting-Yard Algorithm.
 * Evaluates mathematical expressions strictly without eval() or new Function().
 */

const OPERATORS = {
  '+': { precedence: 1, associativity: 'L', arity: 2 },
  '-': { precedence: 1, associativity: 'L', arity: 2 },
  '−': { precedence: 1, associativity: 'L', arity: 2 },
  '*': { precedence: 2, associativity: 'L', arity: 2 },
  '×': { precedence: 2, associativity: 'L', arity: 2 },
  '/': { precedence: 2, associativity: 'L', arity: 2 },
  '÷': { precedence: 2, associativity: 'L', arity: 2 },
  '%': { precedence: 2, associativity: 'L', arity: 2 },
  '^': { precedence: 3, associativity: 'R', arity: 2 },
  'u-': { precedence: 4, associativity: 'R', arity: 1 }, // Unary minus
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh',
  'ln', 'log',
  'sqrt', 'cbrt',
  'fact', 'recip',
  'sqr', 'cube',
  'exp', 'pow10'
]);

const CONSTANTS = {
  'π': Math.PI,
  'pi': Math.PI,
  'PI': Math.PI,
  'e': Math.E,
  'E': Math.E
};

/**
 * Converts degrees to radians
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 */
function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Tokenizes a mathematical expression string into structured tokens.
 * Handles numbers, scientific notations, operators, parentheses, functions, and constants.
 * @param {string} expr
 * @returns {Array<{type: string, value: string|number}>}
 */
export function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const cleanExpr = expr.trim();

  while (i < cleanExpr.length) {
    const char = cleanExpr[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Number parsing (including decimals and scientific notation like 1e-5)
    if (/\d/.test(char) || (char === '.' && /\d/.test(cleanExpr[i + 1]))) {
      let numStr = '';
      while (i < cleanExpr.length && (/[\d.]/.test(cleanExpr[i]))) {
        if (cleanExpr[i] === '.' && numStr.includes('.')) {
          throw new Error('Invalid number format: multiple decimals');
        }
        numStr += cleanExpr[i];
        i++;
      }

      // Check scientific notation exponent (e.g. 1.2e+5 or 1e-4)
      if (i < cleanExpr.length && (cleanExpr[i] === 'e' || cleanExpr[i] === 'E')) {
        const nextChar = cleanExpr[i + 1];
        if (nextChar === '+' || nextChar === '-' || /\d/.test(nextChar)) {
          numStr += cleanExpr[i];
          i++;
          if (cleanExpr[i] === '+' || cleanExpr[i] === '-') {
            numStr += cleanExpr[i];
            i++;
          }
          while (i < cleanExpr.length && /\d/.test(cleanExpr[i])) {
            numStr += cleanExpr[i];
            i++;
          }
        }
      }

      const numVal = Number(numStr);
      if (Number.isNaN(numVal)) {
        throw new Error(`Invalid number: ${numStr}`);
      }

      // Check for implicit multiplication: e.g. 2(3) or 2sin(30) or 2π
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
      }

      tokens.push({ type: 'NUMBER', value: numVal });
      continue;
    }

    // Constants like π or e
    if (char === 'π') {
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
      }
      tokens.push({ type: 'CONST', value: Math.PI, name: 'π' });
      i++;
      continue;
    }

    // Identifiers (functions or constant 'e')
    if (/[a-zA-Z]/.test(char)) {
      let idStr = '';
      while (i < cleanExpr.length && /[a-zA-Z0-9]/.test(cleanExpr[i])) {
        idStr += cleanExpr[i];
        i++;
      }

      const lowerId = idStr.toLowerCase();

      // Check if it's the constant e
      if (lowerId === 'e') {
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
            tokens.push({ type: 'OPERATOR', value: '*' });
          }
        }
        tokens.push({ type: 'CONST', value: Math.E, name: 'e' });
        continue;
      }

      // Check if constant pi
      if (lowerId === 'pi') {
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
            tokens.push({ type: 'OPERATOR', value: '*' });
          }
        }
        tokens.push({ type: 'CONST', value: Math.PI, name: 'π' });
        continue;
      }

      if (FUNCTIONS.has(lowerId)) {
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
            tokens.push({ type: 'OPERATOR', value: '*' });
          }
        }
        tokens.push({ type: 'FUNCTION', value: lowerId });
        continue;
      }

      throw new Error(`Unknown function: ${idStr}`);
    }

    // Parentheses
    if (char === '(') {
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
      }
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Factorial postfix symbol '!'
    if (char === '!') {
      tokens.push({ type: 'POSTFIX', value: '!' });
      i++;
      continue;
    }

    // Basic & scientific operators
    if (['+', '-', '−', '*', '×', '/', '÷', '%', '^'].includes(char)) {
      const standardOp =
        char === '−' ? '-' :
        char === '×' ? '*' :
        char === '÷' ? '/' : char;

      // Determine if '-' is unary negation
      if (standardOp === '-') {
        const prev = tokens[tokens.length - 1];
        if (!prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN' || prev.type === 'FUNCTION') {
          tokens.push({ type: 'OPERATOR', value: 'u-' });
          i++;
          continue;
        }
      }

      tokens.push({ type: 'OPERATOR', value: standardOp });
      i++;
      continue;
    }

    // Square root symbol '√'
    if (char === '√') {
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
      }
      tokens.push({ type: 'FUNCTION', value: 'sqrt' });
      i++;
      continue;
    }

    // Cube root symbol '∛'
    if (char === '∛') {
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'CONST' || prev.type === 'RPAREN') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
      }
      tokens.push({ type: 'FUNCTION', value: 'cbrt' });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${char}'`);
  }

  return tokens;
}

/**
 * Evaluates a single function call with given argument and angle mode.
 * @param {string} fnName
 * @param {number} arg
 * @param {string} angleMode - 'DEG' or 'RAD'
 * @returns {number}
 */
export function evaluateFunction(fnName, arg, angleMode = 'DEG') {
  switch (fnName) {
    case 'sin': {
      const rad = angleMode === 'DEG' ? degToRad(arg) : arg;
      // In DEG mode, check multiples of 180 to prevent small float epsilon
      if (angleMode === 'DEG' && arg % 180 === 0) return 0;
      return normalizeFloat(Math.sin(rad));
    }
    case 'cos': {
      const rad = angleMode === 'DEG' ? degToRad(arg) : arg;
      // In DEG mode, 90, 270 deg cos is exactly 0
      if (angleMode === 'DEG' && (arg - 90) % 180 === 0) return 0;
      return normalizeFloat(Math.cos(rad));
    }
    case 'tan': {
      if (angleMode === 'DEG') {
        if ((arg - 90) % 180 === 0) {
          throw new Error('Tangent undefined at 90° + k·180°');
        }
        if (arg % 180 === 0) return 0;
        return normalizeFloat(Math.tan(degToRad(arg)));
      }
      // Check for rad undefined
      const cosVal = Math.cos(arg);
      if (Math.abs(cosVal) < 1e-15) {
        throw new Error('Tangent undefined');
      }
      return normalizeFloat(Math.tan(arg));
    }
    case 'asin': {
      if (arg < -1 || arg > 1) {
        throw new Error('Invalid input: asin domain is [-1, 1]');
      }
      const resRad = Math.asin(arg);
      return angleMode === 'DEG' ? normalizeFloat(radToDeg(resRad)) : normalizeFloat(resRad);
    }
    case 'acos': {
      if (arg < -1 || arg > 1) {
        throw new Error('Invalid input: acos domain is [-1, 1]');
      }
      const resRad = Math.acos(arg);
      return angleMode === 'DEG' ? normalizeFloat(radToDeg(resRad)) : normalizeFloat(resRad);
    }
    case 'atan': {
      const resRad = Math.atan(arg);
      return angleMode === 'DEG' ? normalizeFloat(radToDeg(resRad)) : normalizeFloat(resRad);
    }
    case 'sinh':
      return normalizeFloat(Math.sinh(arg));
    case 'cosh':
      return normalizeFloat(Math.cosh(arg));
    case 'tanh':
      return normalizeFloat(Math.tanh(arg));
    case 'asinh':
      return normalizeFloat(Math.asinh(arg));
    case 'acosh':
      if (arg < 1) {
        throw new Error('Invalid input: acosh domain is [1, ∞)');
      }
      return normalizeFloat(Math.acosh(arg));
    case 'atanh':
      if (arg <= -1 || arg >= 1) {
        throw new Error('Invalid input: atanh domain is (-1, 1)');
      }
      return normalizeFloat(Math.atanh(arg));
    case 'ln':
      if (arg <= 0) {
        throw new Error('Invalid input: ln(x) requires x > 0');
      }
      return normalizeFloat(Math.log(arg));
    case 'log':
      if (arg <= 0) {
        throw new Error('Invalid input: log10(x) requires x > 0');
      }
      return normalizeFloat(Math.log10(arg));
    case 'sqrt':
      if (arg < 0) {
        throw new Error('Cannot take square root of negative number');
      }
      return normalizeFloat(Math.sqrt(arg));
    case 'cbrt':
      return normalizeFloat(Math.cbrt(arg));
    case 'fact':
      return factorial(arg);
    case 'recip':
      if (arg === 0) {
        throw new Error('Cannot divide by zero');
      }
      return normalizeFloat(1 / arg);
    case 'sqr':
      return normalizeFloat(arg * arg);
    case 'cube':
      return normalizeFloat(arg * arg * arg);
    case 'exp':
      return normalizeFloat(Math.exp(arg));
    case 'pow10':
      return normalizeFloat(Math.pow(10, arg));
    default:
      throw new Error(`Unsupported function: ${fnName}`);
  }
}

/**
 * Converts infix tokens into Reverse Polish Notation (RPN) using Dijkstra's Shunting-Yard algorithm.
 * @param {Array} tokens
 * @returns {Array}
 */
export function shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'NUMBER' || token.type === 'CONST') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'POSTFIX' && token.value === '!') {
      // Postfix factorial binds immediately to the preceding operand
      outputQueue.push({ type: 'FUNCTION', value: 'fact' });
    } else if (token.type === 'OPERATOR') {
      const op1 = token.value;
      const op1Info = OPERATORS[op1];

      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];

        if (top.type === 'FUNCTION') {
          outputQueue.push(operatorStack.pop());
          continue;
        }

        if (top.type === 'OPERATOR') {
          const op2 = top.value;
          const op2Info = OPERATORS[op2];

          if (
            (op1Info.associativity === 'L' && op1Info.precedence <= op2Info.precedence) ||
            (op1Info.associativity === 'R' && op1Info.precedence < op2Info.precedence)
          ) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        } else {
          break;
        }
      }

      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === 'LPAREN') {
          foundLparen = true;
          break;
        }
        outputQueue.push(top);
      }

      if (!foundLparen) {
        throw new Error('Mismatched parentheses: unexpected )');
      }

      // If top of stack is a function, pop it to output
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        outputQueue.push(operatorStack.pop());
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses: unclosed (');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluates an RPN queue to compute final numerical result.
 * @param {Array} rpn
 * @param {string} angleMode - 'DEG' or 'RAD'
 * @returns {number}
 */
export function evaluateRPN(rpn, angleMode = 'DEG') {
  const stack = [];

  for (let i = 0; i < rpn.length; i++) {
    const token = rpn[i];

    if (token.type === 'NUMBER' || token.type === 'CONST') {
      stack.push(token.value);
    } else if (token.type === 'FUNCTION') {
      if (stack.length < 1) {
        throw new Error(`Insufficient arguments for function ${token.value}`);
      }
      const arg = stack.pop();
      const res = evaluateFunction(token.value, arg, angleMode);
      stack.push(res);
    } else if (token.type === 'OPERATOR') {
      if (token.value === 'u-') {
        if (stack.length < 1) {
          throw new Error('Invalid expression for unary minus');
        }
        const operand = stack.pop();
        stack.push(-operand);
      } else {
        if (stack.length < 2) {
          throw new Error(`Insufficient operands for operator ${token.value}`);
        }
        const b = stack.pop();
        const a = stack.pop();

        let res;
        switch (token.value) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) {
              throw new Error('Cannot divide by zero');
            }
            res = a / b;
            break;
          case '%':
            if (b === 0) {
              throw new Error('Cannot modulo by zero');
            }
            res = a % b;
            break;
          case '^':
            if (a < 0 && !Number.isInteger(b)) {
              throw new Error('Negative base with non-integer exponent');
            }
            res = Math.pow(a, b);
            break;
          default:
            throw new Error(`Unknown operator ${token.value}`);
        }
        stack.push(normalizeFloat(res));
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid mathematical expression');
  }

  return normalizeFloat(stack[0]);
}

/**
 * Safely parses and calculates the value of an arbitrary mathematical expression string.
 * @param {string} expression
 * @param {string} angleMode - 'DEG' or 'RAD'
 * @returns {{ success: boolean, result?: number, error?: string }}
 */
export function calculateExpression(expression, angleMode = 'DEG') {
  if (!expression || !expression.trim()) {
    return { success: true, result: 0 };
  }

  try {
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // Auto-close any unclosed opening parentheses
    let openCount = 0;
    for (const ch of sanitized) {
      if (ch === '(') openCount++;
      if (ch === ')') openCount--;
    }
    if (openCount > 0) {
      sanitized += ')'.repeat(openCount);
    }

    const tokens = tokenize(sanitized);
    if (tokens.length === 0) {
      return { success: true, result: 0 };
    }

    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn, angleMode);

    if (Number.isNaN(result) || !Number.isFinite(result)) {
      return { success: false, error: 'Math Error' };
    }

    return { success: true, result };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Error'
    };
  }
}
