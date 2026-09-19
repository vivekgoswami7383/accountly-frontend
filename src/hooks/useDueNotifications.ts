import { useCallback, useEffect, useMemo, useState } from 'react';
import contactService from 'services/accountly/contactService';
import { Contact } from 'services/accountly/types';
import { daysBetween, dueState, todayStr, DueState } from 'utils/accountly/due';

const STORAGE_KEY = 'accountly.dueNotifications';
const WINDOW_DAYS = 3;

interface NotificationRecord {
  at: number;
  seen: boolean;
}

type Records = { [key: string]: NotificationRecord };

export interface DueNotification {
  key: string;
  contact: Contact;
  dueDate: string;
  state: DueState;
  days: number;
  at: number;
}

const readRecords = (): Records => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
};

const writeRecords = (records: Records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    return;
  }
};

const useDueNotifications = () => {
  const [items, setItems] = useState<DueNotification[]>([]);
  const [records, setRecords] = useState<Records>(readRecords);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const today = todayStr();
    contactService
      .getDueContacts(today)
      .then((res) => {
        if (!active) return;
        const contacts = contactService.transformContacts([...res.overdue, ...res.today, ...res.upcoming]);
        const stored = readRecords();
        const now = Date.now();
        const nextRecords: Records = {};
        const next = contacts
          .filter((c) => c.dueDate)
          .map((c) => {
            const dueDate = c.dueDate as string;
            const state = dueState(dueDate, today);
            const key = `${c.id}:${dueDate}:${state}`;
            return { key, contact: c, dueDate, state, days: daysBetween(today, dueDate), at: stored[key]?.at ?? now };
          })
          .filter((n) => n.days <= WINDOW_DAYS)
          .sort((a, b) => b.at - a.at || a.days - b.days);
        next.forEach((n) => {
          nextRecords[n.key] = { at: n.at, seen: stored[n.key]?.seen ?? false };
        });
        writeRecords(nextRecords);
        setRecords(nextRecords);
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

  const unseenKeys = useMemo(() => items.filter((n) => !records[n.key]?.seen).map((n) => n.key), [items, records]);

  const markAllSeen = useCallback(() => {
    const next: Records = {};
    items.forEach((n) => {
      next[n.key] = { at: n.at, seen: true };
    });
    writeRecords(next);
    setRecords(next);
  }, [items]);

  return { items, loaded, unseenKeys, markAllSeen };
};

export default useDueNotifications;
