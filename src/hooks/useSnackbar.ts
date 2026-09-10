import { useCallback } from 'react';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface ShowSnackbarArgs {
  message: string;
  type?: SnackbarType;
  duration?: number;
}

const colorMap: Record<SnackbarType, 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info'
};

const useSnackbar = () => {
  const showSnackbar = useCallback(({ message, type = 'error' }: ShowSnackbarArgs) => {
    dispatch(
      openSnackbar({
        open: true,
        message,
        variant: 'alert',
        alert: { color: colorMap[type], variant: 'filled' },
        close: true
      })
    );
  }, []);

  return { showSnackbar };
};

export default useSnackbar;
