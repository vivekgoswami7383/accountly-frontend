import { GlobalStyles } from '@mui/material';
import Routes from 'routes';
import ThemeCustomization from 'themes';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

import { JWTProvider as AuthProvider } from 'contexts/JWTContext';

const overflowGuard = (
  <GlobalStyles
    styles={{
      'html, body': { overflowX: 'hidden' },
      '#root': { overflowX: 'hidden', width: '100%' },
      'img, svg, video, canvas': { maxWidth: '100%' }
    }}
  />
);

const App = () => (
  <ThemeCustomization>
    {overflowGuard}
    <RTLLayout>
      <Locales>
        <ScrollTop>
          <AuthProvider>
            <>
              <Notistack>
                <Routes />
                <Snackbar />
              </Notistack>
            </>
          </AuthProvider>
        </ScrollTop>
      </Locales>
    </RTLLayout>
  </ThemeCustomization>
);

export default App;
