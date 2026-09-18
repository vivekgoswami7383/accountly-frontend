import { useEffect, useState } from 'react';
import linkService from 'services/accountly/linkService';

const useIncomingLinkCount = (enabled = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    linkService
      .incoming()
      .then((requests) => {
        if (!cancelled) setCount(requests.length);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return count;
};

export default useIncomingLinkCount;
