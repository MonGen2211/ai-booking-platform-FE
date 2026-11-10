import { t, useLanguage } from '../i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Tab, Tabs } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { openAuth } from '../features/auth';
import { AppointmentList, BookingForm } from '../features/appointments';
import type { Rebook } from '../api/types';
export default function BookingPage() {
  useLanguage();
  const [params,setParams] = useSearchParams(); const dispatch = useAppDispatch(); const user = useAppSelector(s=>s.auth.user); const boot = useAppSelector(s=>s.auth.bootstrapStatus); const [prefill,setPrefill] = useState<Rebook | null>(null); const [draftKey,setDraftKey] = useState(0);
  const tab = params.get('tab') === 'appointments' ? 'appointments' : 'booking';
  return <div className="booking-page"><div className="section-wrap"><div className="booking-heading"><span className="eyebrow">{t("CHĂM SÓC SỨC KHỎE CHỦ ĐỘNG")}</span><h1>{t("Đặt lịch khám")}</h1><p>{t("Chọn thời gian thuận tiện, để chúng tôi đồng hành cùng bạn.")}</p></div><Tabs value={tab} onChange={(_,value)=>{ const next = new URLSearchParams(params); if(value === 'booking') next.delete('tab'); else next.set('tab',value); setParams(next); }} aria-label={t("Đặt lịch và lịch hẹn")} sx={{mb:4,borderBottom:1,borderColor:'divider'}}><Tab value="booking" label={t("Đặt lịch khám")}/><Tab value="appointments" label={t("Lịch hẹn của tôi")}/></Tabs><div hidden={tab !== 'booking'}><BookingForm key={draftKey} prefill={prefill}/></div>{tab === 'appointments' && (user ? <AppointmentList key={user.id} onRebook={data=>{setPrefill(data);setDraftKey(k=>k+1); const next = new URLSearchParams(params); next.set('doctorId',data.doctor.id);next.delete('tab');setParams(next);}}/> : <section className="surface mx-auto max-w-2xl text-center"><h2 className="text-2xl font-bold">{t("Lịch hẹn của bạn, ở một nơi")}</h2><p className="my-5 text-slate-500">{t("Đăng nhập để xem và quản lý các lịch khám đã đặt.")}</p>{boot === 'loading' ? <Alert severity="info">{t("Đang khôi phục phiên…")}</Alert> : <Button variant="contained" onClick={()=>dispatch(openAuth())}>{t("Đăng nhập")}</Button>}</section>)}</div></div>;
}
