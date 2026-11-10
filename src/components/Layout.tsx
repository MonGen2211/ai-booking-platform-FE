import { t, useLanguage } from '../i18n';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import { CalendarMonthOutlined, HealthAndSafetyOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { AuthDialog, bootstrap, logout, openAuth, retryBootstrap } from '../features/auth';
import { ChatbotWidget } from '../features/chatbot';
import LanguageSwitcher from './LanguageSwitcher';
export default function Layout() {
  useLanguage();
  const dispatch = useAppDispatch(); const auth = useAppSelector(s=>s.auth); const [year] = useState(()=>new Date().getFullYear());
  useEffect(()=>{ void dispatch(bootstrap()); },[dispatch]);
  return <><a href="#main" className="skip-link">{t("Đến nội dung chính")}</a><header className="site-header"><div className="header-inner"><Link to="/" className="brand" aria-label={t("An Tâm — Trang chủ")}><span className="brand-mark">+</span><span>{t("An Tâm")}<span className="brand-sub">{t("CHĂM SÓC SỨC KHỎE")}</span></span></Link><nav aria-label={t("Điều hướng chính")} className="main-nav"><NavLink to="/" end>{t("Trang chủ")}</NavLink><NavLink to="/booking">{t("Đặt lịch khám")}</NavLink></nav><div className="header-actions"><LanguageSwitcher/>{auth.user ? <><span className="account-email" title={auth.user.email}>{auth.user.email}</span><Button size="small" disabled={auth.status === 'loading'} onClick={()=>void dispatch(logout())}>{t("Đăng xuất")}</Button></> : <Button onClick={()=>dispatch(openAuth())}>{t("Đăng nhập")}</Button>}<Button component={Link} to="/booking" variant="contained" className="header-book" startIcon={<CalendarMonthOutlined/>}>{t("Đặt lịch")}</Button></div></div></header>
  {auth.error && !auth.dialog && <div className="mx-auto mt-4 max-w-7xl px-5"><Alert severity="warning" action={<Button color="inherit" onClick={()=>{dispatch(retryBootstrap());void dispatch(bootstrap());}}>{t("Khôi phục phiên")}</Button>}>{t(auth.error.message)}</Alert></div>}
  <main id="main" tabIndex={-1}><Outlet/></main><footer className="site-footer"><div className="section-wrap grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]"><div><Link to="/" className="brand"><span className="brand-mark">+</span><span>{t("An Tâm")}</span></Link><p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">{t("Kết nối bạn với bác sĩ phù hợp.")}<br/>{t("Chủ động đặt lịch, an tâm chăm sóc sức khỏe.")}</p></div><div><h3 className="font-bold">{t("Dành cho bạn")}</h3><div className="mt-4 grid gap-3 text-sm text-slate-500"><Link to="/">{t("Tìm bác sĩ")}</Link><Link to="/booking">{t("Đặt lịch khám")}</Link><Link to="/booking?tab=appointments">{t("Lịch hẹn của tôi")}</Link></div></div><div><h3 className="flex items-center gap-2 font-bold"><HealthAndSafetyOutlined fontSize="small"/>{t("Chăm sóc có kế hoạch")}</h3><p className="mt-4 text-sm leading-7 text-slate-500">{t("Thông tin trên website hỗ trợ đặt lịch khám. Nếu cần cấp cứu, hãy đến cơ sở y tế gần nhất.")}</p></div></div><div className="footer-bottom">© {year}{t("An Tâm · Đặt lịch khám trực tuyến")}</div></footer><ChatbotWidget/><AuthDialog/></>;
}
