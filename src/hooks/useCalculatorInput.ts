import { useCallback, useMemo, useState } from 'react';
import { evaluateExpression, formatExpression, OPERATORS } from 'utils/accountly/calculator';

export default function useCalculatorInput() {
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [memory, setMemory] = useState(0);

  const amount = useMemo(() => evaluateExpression(expression), [expression]);
  const display = useMemo(() => formatExpression(expression), [expression]);
  const hasOperator = useMemo(() => OPERATORS.some((op) => expression.includes(op)), [expression]);

  const setFromAmount = useCallback((value: number) => {
    setExpression(value ? String(value) : '');
    setJustEvaluated(false);
  }, []);

  const pressDigit = useCallback((d: string) => {
    setExpression((e) => (justEvaluated ? d : e + d));
    setJustEvaluated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justEvaluated]);

  const pressDot = useCallback(() => {
    if (justEvaluated) {
      setExpression('0.');
      setJustEvaluated(false);
      return;
    }
    setExpression((e) => {
      const lastNumber = e.split(/[+\-×÷%]/).pop() || '';
      if (lastNumber.includes('.')) return e;
      return e + (lastNumber ? '.' : '0.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justEvaluated]);

  const pressOperator = useCallback(
    (op: string) => {
      setJustEvaluated(false);
      setExpression((e) => {
        if (!e) return e;
        if (OPERATORS.includes(e.slice(-1))) return e.slice(0, -1) + op;
        return e + op;
      });
    },
    []
  );

  const pressClear = useCallback(() => {
    setExpression('');
    setJustEvaluated(false);
  }, []);

  const pressBackspace = useCallback(() => {
    if (justEvaluated) {
      setExpression('');
      setJustEvaluated(false);
      return;
    }
    setExpression((e) => e.slice(0, -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justEvaluated]);

  const pressEquals = useCallback(() => {
    setExpression((e) => {
      if (!e || !OPERATORS.some((op) => e.includes(op))) return e;
      return String(evaluateExpression(e));
    });
    setJustEvaluated(true);
  }, []);

  const pressMemoryAdd = useCallback(() => {
    setMemory((m) => m + evaluateExpression(expression));
  }, [expression]);

  const pressMemorySubtract = useCallback(() => {
    setMemory((m) => m - evaluateExpression(expression));
  }, [expression]);

  const recallMemory = useCallback(() => {
    setExpression(memory ? String(memory) : '0');
    setJustEvaluated(false);
  }, [memory]);

  return {
    expression,
    display,
    amount,
    memory,
    hasOperator,
    setFromAmount,
    pressDigit,
    pressDot,
    pressOperator,
    pressClear,
    pressBackspace,
    pressEquals,
    pressMemoryAdd,
    pressMemorySubtract,
    recallMemory
  };
}
