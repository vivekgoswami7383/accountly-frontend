export const formatAmount = (value: number): string => `₹${Math.abs(Number(value) || 0).toLocaleString('en-IN')}`;

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

export const balanceLabel = (balance: number): string => (balance < 0 ? 'You Will Get' : 'You Will Give');
