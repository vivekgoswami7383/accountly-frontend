import { useCallback, useEffect, useMemo, useState } from 'react';
import contactService from 'services/accountly/contactService';
import { Contact } from 'services/accountly/types';
import { daysBetween, dueState, todayStr, DueState } from 'utils/accountly/due';

const STORAGE_KEY = 'accountly.seenDueNotifications';
const WINDOW_DAYS = 3;

export interface DueNotification {
  key: string;
  contact: Contact;
  dueDate: string;
  state: DueState;
  days: number;
}

const readSeen = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const writeSeen = (keys: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (e) {
    return;
  }
};

const useDueNotifications = () => {
  const [items, setItems] = useState<DueNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<string[]>(readSeen);

  useEffect(() => {
    let active = true;
    const today = todayStr();
    contactService
      .getDueContacts(today)
      .then((res) => {
        if (!active) return;
        const contacts = contactService.transformContacts([...res.overdue, ...res.today, ...res.upcoming]);
        const next = contacts
          .filter((c) => c.dueDate)
          .map((c) => {
            const dueDate = c.dueDate as string;
            const state = dueState(dueDate, today);
            return { key: `${c.id}:${dueDate}:${state}`, contact: c, dueDate, state, days: daysBetween(today, dueDate) };
          })
          .filter((n) => n.days <= WINDOW_DAYS)
          .sort((a, b) => a.days - b.days);
        setItems(next);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const unseenKeys = useMemo(() => items.filter((n) => !seen.includes(n.key)).map((n) => n.key), [items, seen]);

  const markAllSeen = useCallback(() => {
    const keys = items.map((n) => n.key);
    writeSeen(keys);
    setSeen(keys);
  }, [items]);

  return { items, loaded, unseenKeys, markAllSeen };
};

export default useDueNotifications;
