import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { store } from './app/store';
import { theme } from './app/theme';
import AppRoutes from './routes';
import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { enUS, viVN } from '@mui/material/locale';
import { useLanguage } from './i18n';
export default function App() {
  const language = useLanguage();
  const localizedTheme = useMemo(() => createTheme(theme, language === 'en' ? enUS : viVN), [language]);
  return <Provider store={store}><StyledEngineProvider enableCssLayer><ThemeProvider theme={localizedTheme}><CssBaseline/><BrowserRouter><AppRoutes/></BrowserRouter></ThemeProvider></StyledEngineProvider></Provider>;
}
