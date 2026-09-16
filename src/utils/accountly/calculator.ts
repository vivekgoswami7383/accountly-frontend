import { formatAmountInput } from './format';

export const MAX_AMOUNT = 999999999999;

export const OPERATORS = ['+', '-', '×', '÷', '%'];
const OPERATOR_REGEX = /[+\-×÷%]/;

const tokenize = (expr: string): string[] => expr.match(/(\d+\.?\d*)|[+\-×÷%]/g) || [];

export const evaluateExpression = (expr: string): number => {
  const trimmed = expr.replace(/[+\-×÷%]+$/, '');
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return 0;

  const pass1: string[] = [tokens[0]];
  let i = 1;
  while (i < tokens.length) {
    const op = tokens[i];
    const nextNum = parseFloat(tokens[i + 1]);
    if (op === '×' || op === '÷' || op === '%') {
      const prev = parseFloat(pass1.pop() as string);
      let result: number;
      if (op === '×') result = prev * nextNum;
      else if (op === '÷') result = nextNum === 0 ? 0 : prev / nextNum;
      else result = (prev * nextNum) / 100;
      pass1.push(String(result));
    } else {
      pass1.push(op, tokens[i + 1]);
    }
    i += 2;
  }

  let total = parseFloat(pass1[0]);
  for (let j = 1; j < pass1.length; j += 2) {
    const op = pass1[j];
    const num = parseFloat(pass1[j + 1]);
    if (op === '+') total += num;
    else if (op === '-') total -= num;
  }

  return Math.round(total * 100) / 100;
};

export const formatExpression = (expr: string): string => {
  if (!expr) return '';
  const parts = expr.split(/([+\-×÷%])/).filter((p) => p !== '');
  return parts
    .map((p) => (p.length === 1 && OPERATOR_REGEX.test(p) ? ` ${p} ` : formatAmountInput(p)))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};
