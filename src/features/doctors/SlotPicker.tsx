import { t, useLanguage } from '../../i18n';
import { useEffect } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAvailability } from './doctorSlice';
import { dateTime, localDate, time } from '../../utils/format';
import AsyncState from '../../components/AsyncState';
export default function SlotPicker({ doctorId, date, onDate, selected, onSelect, disabled = false }: { doctorId: string; date: string; onDate: (date: string) => void; selected: string; onSelect: (id: string) => void; disabled?: boolean }) {
  useLanguage();
  const dispatch = useAppDispatch(); const { availability, slotStatus, slotError } = useAppSelector(s=>s.doctors);
  useEffect(()=>{ if(doctorId && date) void dispatch(fetchAvailability({ id: doctorId, from: date, to: date })); },[dispatch,doctorId,date]);
  return <div className="grid gap-4"><TextField label={t("Ngày khám")} type="date" value={date} onChange={e=>onDate(e.target.value)} disabled={disabled} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: localDate() } }}/><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{t("Giờ khám còn trống")}</h3><span className="text-xs text-slate-500">{t("Giờ Việt Nam (GMT+7)")}</span></div><AsyncState status={slotStatus} error={slotError} retry={()=>void dispatch(fetchAvailability({ id: doctorId, from: date, to: date }))}/>{slotStatus === 'succeeded' && (!availability?.items.length ? <Alert severity="info">{t("Ngày này chưa có giờ trống. Bạn hãy chọn ngày khác.")}</Alert> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{availability.items.map(slot=><Button key={slot.id} variant={selected === slot.id ? 'contained' : 'outlined'} disabled={disabled} aria-pressed={selected === slot.id} aria-label={dateTime(slot.startsAt, availability.timezone)} onClick={()=>onSelect(slot.id)}>{time(slot.startsAt,availability.timezone)}</Button>)}</div>)}{availability?.policy && <p className="text-xs leading-relaxed text-slate-500">{t("Có thể đặt trước {0} ngày và cách giờ khám ít nhất {1} giờ. Mỗi lượt khám theo thời lượng của bác sĩ.", availability.policy.horizonDays, availability.policy.leadHours)}</p>}</div>;
}
