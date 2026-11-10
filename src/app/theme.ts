import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: { primary: { main: '#087e8b', dark: '#075e67' }, secondary: { main: '#e7a96b' }, background: { default: '#f7f9fa', paper: '#ffffff' }, text: { primary: '#17343e', secondary: '#627780' } },
  typography: {
    fontFamily: '"Noto Sans", "Segoe UI", Arial, sans-serif', fontSize: 15,
    body1: { fontSize: '1rem', lineHeight: 1.75 }, body2: { fontSize: '0.9375rem', lineHeight: 1.7 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 9, minHeight: 44, padding: '10px 20px', whiteSpace: 'nowrap' },
        sizeSmall: { minHeight: 36, padding: '6px 12px' },
        sizeLarge: { minHeight: 48, padding: '12px 24px' },
      },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true, variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff' } } },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'sm' },
      styleOverrides: { paper: { borderRadius: 20, margin: 20, width: 'calc(100% - 40px)' } },
    },
    MuiDialogTitle: { styleOverrides: { root: { padding: '24px 24px 16px', fontSize: '1.375rem', fontWeight: 700 } } },
    MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px 24px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },
    MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderColor: '#e0e9eb', boxShadow: '0 5px 20px #16343e04' } } },
  },
});
