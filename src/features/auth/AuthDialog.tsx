import { t, useLanguage } from '../../i18n';
import { useRef, useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { Close, LockOutlined, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { authenticate, closeAuth } from './authSlice';

export default function AuthDialog() {
  useLanguage();
  const dispatch = useAppDispatch();
  const { dialog, status, error } = useAppSelector(s => s.auth);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const busy = status === 'loading';
  const close = () => { if (!busy) { setPassword(''); setShowPassword(false); dispatch(closeAuth()); } };

  return (
    <Dialog open={dialog} onClose={close} maxWidth="xs" aria-labelledby="auth-title" aria-describedby="auth-description" slotProps={{ transition: { onEntered: () => emailInput.current?.focus() } }}>
      <form onSubmit={async e => {
        e.preventDefault();
        const result = await dispatch(authenticate({ mode, data: { email: email.trim(), password } }));
        if (authenticate.fulfilled.match(result)) { setPassword(''); setShowPassword(false); }
      }}>
        <DialogTitle component="div" sx={{ position: 'relative', pr: 6 }}>
          <span className="auth-brand-icon"><LockOutlined fontSize="small" /></span>
          <h2 id="auth-title" className="auth-title">
            {mode === 'login' ? t("Chào mừng bạn trở lại") : t("Tạo tài khoản của bạn")}
          </h2>
          <IconButton aria-label={t("Đóng cửa sổ đăng nhập")} onClick={close} disabled={busy} sx={{ position: 'absolute', right: 12, top: 12 }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="auth-fields">
            <p id="auth-description" className="auth-description">{t("Đăng nhập để lưu hồ sơ và quản lý lịch khám của bạn.")}</p>
            <ToggleButtonGroup
              className="auth-mode" exclusive value={mode} fullWidth disabled={busy}
              aria-label={t("Chọn đăng nhập hoặc đăng ký")}
              onChange={(_, value) => { if (value) setMode(value); }}
            >
              <ToggleButton value="login">{t("Đăng nhập")}</ToggleButton>
              <ToggleButton value="register">{t("Đăng ký")}</ToggleButton>
            </ToggleButtonGroup>
            {error && <Alert severity="error">{t(error.message)}</Alert>}
            <TextField
              autoFocus inputRef={emailInput} label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" disabled={busy} placeholder="ban@example.com"
            />
            <TextField
              label={t("Mật khẩu")} type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} required disabled={busy}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              helperText={mode === 'register' ? t("Sử dụng ít nhất 8 ký tự.") : undefined}
              slotProps={{
                htmlInput: { minLength: mode === 'register' ? 8 : 1 },
                input: {
                  endAdornment: <InputAdornment position="end"><IconButton
                    aria-label={showPassword ? t("Ẩn mật khẩu") : t("Hiện mật khẩu")}
                    onClick={() => setShowPassword(v => !v)} edge="end" disabled={busy}
                  >{showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}</IconButton></InputAdornment>,
                },
              }}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ pt: 0, flexDirection: 'column', alignItems: 'stretch' }}>
          <Button type="submit" variant="contained" fullWidth loading={busy}>
            {mode === 'login' ? t("Đăng nhập") : t("Tạo tài khoản")}
          </Button>
          <p className="auth-footer-note">{t("Thông tin của bạn được bảo vệ trong phiên đăng nhập.")}</p>
        </DialogActions>
      </form>
    </Dialog>
  );
}
