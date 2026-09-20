import { useEffect, useState } from 'react';
import { getInstallMode, runInstallPrompt, subscribeInstallPrompt } from 'utils/accountly/installPrompt';

const useInstallApp = () => {
  const [mode, setMode] = useState(getInstallMode);

  useEffect(() => {
    setMode(getInstallMode());
    return subscribeInstallPrompt(() => setMode(getInstallMode()));
  }, []);

  return { mode, install: runInstallPrompt };
};

export default useInstallApp;
