import { ReactNode } from 'react';
import { Bell, CalendarClock, CheckCircle2 } from 'lucide-react';
import { ApiNotification } from 'services/accountly/types';
import { formatDueShort } from 'utils/accountly/due';

export type NotificationTone = 'ok' | 'late' | 'due' | 'info';

export interface NotificationView {
  title: string;
  sub: string;
  tone: NotificationTone;
  icon: ReactNode;
}

export interface DescribeContext {
  t: (key: string, vars?: Record<string, string | number>) => string;
  fmt: (value: number) => string;
}

type Describe = (n: ApiNotification, ctx: DescribeContext) => NotificationView;

const dueTitle = (n: ApiNotification, { t, fmt }: DescribeContext) =>
  t(n.data.direction === 'receivable' ? 'notifications.owes' : 'notifications.youOwe', {
    name: n.data.contact_name,
    amount: fmt(n.data.amount)
  });

const registry: Record<string, Describe> = {
  due_tomorrow: (n, ctx) => ({ title: dueTitle(n, ctx), sub: ctx.t('notifications.dueTomorrow'), tone: 'due', icon: <CalendarClock /> }),
  due_today: (n, ctx) => ({ title: dueTitle(n, ctx), sub: ctx.t('notifications.dueToday'), tone: 'due', icon: <CalendarClock /> }),
  overdue: (n, ctx) => ({
    title: dueTitle(n, ctx),
    sub: ctx.t('notifications.overdueSince', { date: formatDueShort(n.data.due_date) }),
    tone: 'late',
    icon: <CalendarClock />
  }),
  due_settled: (n, ctx) => ({
    title: ctx.t('notifications.settledTitle', { name: n.data.contact_name }),
    sub: ctx.t('notifications.settledSub', { amount: ctx.fmt(n.data.amount) }),
    tone: 'ok',
    icon: <CheckCircle2 />
  })
};

const fallback: Describe = (n) => ({ title: n.title || n.type, sub: n.body, tone: 'info', icon: <Bell /> });

export const describeNotification = (n: ApiNotification, ctx: DescribeContext): NotificationView => (registry[n.type] || fallback)(n, ctx);

export const notificationPath = (n: ApiNotification): string | null => {
  if (!n.target || !n.target.id) return null;
  if (n.target.kind === 'contact') return `/contact/${n.target.id}`;
  if (n.target.kind === 'transaction') return `/transaction/${n.target.id}`;
  return null;
};
