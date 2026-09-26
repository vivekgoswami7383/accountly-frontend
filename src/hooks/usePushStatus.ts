import { useEffect, useState } from 'react';
import { PushStatus, getPushStatus } from 'utils/accountly/push';

const usePushStatus = () => {
  const [status, setStatus] = useState<PushStatus | null>(null);

  useEffect(() => {
    let active = true;
    getPushStatus()
      .then((next) => active && setStatus(next))
      .catch(() => active && setStatus('unsupported'));
    return () => {
      active = false;
    };
  }, []);

  return [status, setStatus] as const;
};

export default usePushStatus;
