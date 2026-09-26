import axios from 'utils/axios';
import { isIOS, isStandalone } from './installPrompt';

export type PushStatus = 'unsupported' | 'install' | 'denied' | 'off' | 'on';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

const toKeyBytes = (base64: string) => {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const hasPushApis = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const registration = async () => {
  if (!('serviceWorker' in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) || null;
};

const saveSubscription = async (subscription: PushSubscription) => {
  await axios.post('/api/push/subscription', subscription.toJSON());
};

export const getPushStatus = async (): Promise<PushStatus> => {
  if (!hasPushApis()) return isIOS() && !isStandalone() ? 'install' : 'unsupported';
  const reg = await registration();
  if (!reg) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  if (Notification.permission !== 'granted') return 'off';
  return (await reg.pushManager.getSubscription()) ? 'on' : 'off';
};

export const enablePush = async (): Promise<PushStatus> => {
  if (!hasPushApis()) return getPushStatus();
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';

  const reg = await registration();
  if (!reg) return 'unsupported';

  const config = unwrap(await axios.get('/api/push/public-key'));
  if (!config?.enabled || !config.public_key) return 'unsupported';

  const subscription =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKeyBytes(config.public_key) }));
  await saveSubscription(subscription);
  return 'on';
};

const forgetOnServer = async (subscription: PushSubscription, token: string | null) => {
  await axios
    .delete('/api/push/subscription', {
      data: { endpoint: subscription.endpoint },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
    .catch(() => undefined);
};

export const disablePush = async () => {
  const token = localStorage.getItem('serviceToken');
  const reg = await registration();
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;
  await forgetOnServer(subscription, token);
  await subscription.unsubscribe().catch(() => undefined);
};

export const forgetPushOnLogout = async () => {
  const token = localStorage.getItem('serviceToken');
  const reg = await registration().catch(() => null);
  const subscription = await reg?.pushManager.getSubscription();
  if (subscription) await forgetOnServer(subscription, token);
};

export const syncPushSubscription = async () => {
  if (!hasPushApis() || Notification.permission !== 'granted') return;
  const reg = await registration();
  const subscription = await reg?.pushManager.getSubscription();
  if (subscription) await saveSubscription(subscription).catch(() => undefined);
};
