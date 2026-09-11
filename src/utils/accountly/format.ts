import { useCallback } from 'react';
import useConfig from 'hooks/useConfig';
import { DEFAULT_CURRENCY, getCurrency } from 'data/currencies';

export const formatAmount = (value: number, currencyCode: string = DEFAULT_CURRENCY.code): string => {
  const currency = getCurrency(currencyCode);
  return `${currency.symbol}${Math.abs(Number(value) || 0).toLocaleString(currency.locale)}`;
};

export const formatAmountInput = (raw: string): string => {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const groupedInt = (intPart || '').replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
  return raw.includes('.') ? `${groupedInt}.${decPart ?? ''}` : groupedInt;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateString?: string): string => `${formatDate(dateString)} • ${formatTime(dateString)}`;

export const useFormatAmount = () => {
  const { currency } = useConfig();
  return useCallback((value: number) => formatAmount(value, currency), [currency]);
};
