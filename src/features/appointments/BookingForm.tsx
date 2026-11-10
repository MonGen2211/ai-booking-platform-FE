import { t, useLanguage } from '../../i18n';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, Step, StepLabel, Stepper, TextField } from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircleOutlined, LockOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDoctor, fetchAvailability, SlotPicker, DoctorPicker } from '../doctors';
import { openAuth } from '../auth';
import { ProfilePicker } from '../patientProfiles';
import { AttachmentUploader, clearAttachments } from '../attachments';
import { createAppointment, fetchAppointments } from './appointmentSlice';
import type { ApiError, Appointment, BookingInput, Rebook } from '../../api/types';
import { dateTime, localDate, money } from '../../utils/format';
import { filesReady } from '../../utils/validation';
import { sessionGeneration } from '../../api/axiosClient';
import AsyncState from '../../components/AsyncState';
import { useClock } from '../../hooks/useClock';

export default function BookingForm({ prefill }: { prefill: Rebook | null }) {
  useLanguage();
  const dispatch = useAppDispatch(); const [params,setParams] = useSearchParams();
  const doctorId = params.get('doctorId') || '';
  const doctors = useAppSelector(s=>s.doctors); const user = useAppSelector(s=>s.auth.user); const profiles = useAppSelector(s=>s.patientProfiles.items); const attachments = useAppSelector(s=>s.attachments);
  const [date,setDate] = useState(localDate); const [slotId,setSlot] = useState(''); const [profileId,setProfile] = useState(prefill?.patientProfile.id || ''); const [step,setStep] = useState(0); const [reason,setReason] = useState(''); const [symptoms,setSymptoms] = useState(''); const [accepted,setAccepted] = useState(false); const [busy,setBusy] = useState(false); const [error,setError] = useState<ApiError | null>(null); const [success,setSuccess] = useState<Appointment | null>(null);
  const attempt = useRef<{ key: string; data: BookingInput } | null>(null); const sending = useRef(false); const [uncertain,setUncertain] = useState(false); const clock = useClock();
  const doctor = doctors.detail?.id === doctorId ? doctors.detail : null; const slot = doctors.availability?.items.find(s=>s.id === slotId); const profile = profiles.find(p=>p.id === profileId);

  // A route change is an external input; invalidate choices tied to the previous doctor.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(()=>{ if(doctorId) void dispatch(fetchDoctor(doctorId)); setSlot(''); setAccepted(false); setStep(0); },[doctorId,dispatch]);
  // Logout must erase local medical draft fields as well as Redux data.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(()=>{ if(!user) { setStep(0); setProfile(''); setReason(''); setSymptoms(''); setAccepted(false); setSuccess(null); setError(null); attempt.current = null; setUncertain(false); } },[user]);
  const selectDoctor = (id: string) => { const next = new URLSearchParams(params); next.set('doctorId',id); setParams(next); setSuccess(null); setError(null); attempt.current = null; };
  const ready = !!(doctor && slot && profile && reason.trim() && reason.trim().length <= 2000 && symptoms.length <= 4000 && filesReady(attachments.items,!!attachments.pending,clock));
  async function submit() {
    if(sending.current || (!uncertain && (!ready || !accepted))) return;
    if(!attempt.current) { if(!doctor) return; attempt.current = { key: crypto.randomUUID(), data: { slotId,profileId,reason:reason.trim(),symptoms:symptoms.trim() || null,attachmentIds:attachments.items.map(f=>f.id),acceptedDetails:{ consultationFee:doctor.consultationFee,address:doctor.address } } }; }
    const generation = sessionGeneration(); sending.current = true; setBusy(true); setError(null);
    const result = await dispatch(createAppointment(attempt.current)); sending.current = false; setBusy(false);
    if(generation !== sessionGeneration()) return;
    if(createAppointment.fulfilled.match(result)) { setSuccess(result.payload); attempt.current = null; setUncertain(false); setSlot(''); setProfile(''); setReason(''); setSymptoms(''); setAccepted(false); dispatch(clearAttachments()); void dispatch(fetchAppointments({page:1})); }
    else { const failure = result.payload || { code:'UNKNOWN',message:t("Chưa thể xác định kết quả. Vui lòng thử lại.") }; setError(failure);
      if(!failure.status || failure.status >= 500 || failure.code === 'BOOKING_UNAVAILABLE') setUncertain(true);
      else { attempt.current = null; setUncertain(false); setAccepted(false);
        if(failure.code === 'SLOT_UNAVAILABLE') { setSlot(''); setStep(0); void dispatch(fetchAvailability({id:doctorId,from:date,to:date})); }
        if(failure.code === 'BOOKING_DETAILS_CHANGED') { void dispatch(fetchDoctor(doctorId)); setStep(2); }
      }
    }
  }
  if(success) return <section className="surface mx-auto max-w-2xl text-center"><CheckCircleOutlined sx={{fontSize:60,color:'primary.main'}}/><span className="eyebrow mt-5 block">{t("ĐÃ GỬI YÊU CẦU")}</span><h2 className="mt-3 text-3xl font-bold">{t("Lịch khám của bạn đang chờ xác nhận")}</h2><p className="mt-4 text-slate-500">{t("Mã lịch hẹn")}</p><p className="mt-1 break-all text-2xl font-bold text-teal-700">{success.code}</p><p className="mt-4">{success.doctorName} · {dateTime(success.startsAt,success.timezone)}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button variant="contained" onClick={()=>{ const next = new URLSearchParams(params); next.set('tab','appointments'); setParams(next); }}>{t("Xem lịch hẹn của tôi")}</Button><Button variant="outlined" onClick={()=>{ setSuccess(null); setStep(0); }}>{t("Đặt lịch khác")}</Button></div></section>;
  return <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
    <section className="surface min-w-0"><Stepper activeStep={step} alternativeLabel sx={{mb:4}}>{[t("Chọn lịch khám"),t("Thông tin bệnh nhân"),t("Xác nhận")].map(label=><Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" sx={{mb:3}}>{t(error.message)}{!!error.suggestions?.length && <div className="mt-2">{t("Giờ gợi ý:")}{error.suggestions.map(s=>dateTime(s.startsAt)).join(' · ')}{t(". Hãy chọn ngày tương ứng để tải lại giờ trống.")}</div>}</Alert>}
      {uncertain && <Alert severity="warning" sx={{mb:3}}>{t("Chưa xác định được kết quả lần gửi trước. Các thông tin được giữ nguyên để thử lại an toàn. Nếu tải lại trang, hãy kiểm tra “Lịch hẹn của tôi” trước khi đặt tiếp.")}</Alert>}
      <fieldset disabled={busy || uncertain} className="min-w-0 border-0 p-0">
      {step === 0 && <div className="grid gap-6"><div><h2 className="text-xl font-bold">{t("Chọn bác sĩ & thời gian")}</h2><p className="mt-1 text-sm text-slate-500">{t("Tìm một lịch khám thuận tiện cho bạn.")}</p></div><DoctorPicker value={doctorId} selectedDoctor={doctor} onChange={selectDoctor} disabled={busy || uncertain}/>{doctorId && <><AsyncState status={doctors.detailStatus} error={doctors.detailError} retry={()=>void dispatch(fetchDoctor(doctorId))}/>{doctor && <SlotPicker doctorId={doctorId} date={date} onDate={v=>{setDate(v);setSlot('');setAccepted(false);}} selected={slotId} onSelect={id=>{setSlot(id);setAccepted(false);}} disabled={busy || uncertain}/>}</>}</div>}
      {step === 1 && user && <div className="grid gap-7"><ProfilePicker value={profileId} onChange={id=>{setProfile(id);setAccepted(false);}} disabled={busy || uncertain}/><hr className="border-slate-100"/><TextField label={t("Lý do khám")} required multiline minRows={3} value={reason} onChange={e=>{setReason(e.target.value);setAccepted(false);}} slotProps={{htmlInput:{maxLength:2000}}} helperText={t("{0}/2000 ký tự", reason.length)}/><TextField label={t("Triệu chứng / thông tin thêm")} multiline minRows={3} value={symptoms} onChange={e=>{setSymptoms(e.target.value);setAccepted(false);}} slotProps={{htmlInput:{maxLength:4000}}}/><AttachmentUploader disabled={busy || uncertain}/>{!filesReady(attachments.items,!!attachments.pending,clock) && <Alert severity="warning">{t("Vui lòng đợi xử lý file hoàn tất và xóa/tải lại file đã hết hạn.")}</Alert>}</div>}
      {step === 2 && <div className="grid gap-5"><h2 className="text-xl font-bold">{t("Kiểm tra thông tin đặt khám")}</h2><div className="summary-grid"><span>{t("Bác sĩ")}</span><b>{doctor?.name || t("Đang cập nhật…")}</b><span>{t("Giờ khám")}</span><b>{slot ? dateTime(slot.startsAt,doctors.availability?.timezone) : t("Chưa chọn")}</b><span>{t("Bệnh nhân")}</span><b>{profile?.fullName}</b><span>{t("Lý do khám")}</span><p className="whitespace-pre-wrap break-words">{reason}</p><span>{t("Triệu chứng")}</span><p className="whitespace-pre-wrap break-words">{symptoms || t("Không có")}</p><span>{t("Tài liệu")}</span><p>{t("{0} file", attachments.items.length)}</p><span>{t("Địa chỉ khám")}</span><b>{doctor?.address}</b><span>{t("Phí khám")}</span><b className="text-teal-700">{doctor ? money(doctor.consultationFee) : '—'}</b></div><Alert severity="info">{t("Yêu cầu đặt khám sẽ ở trạng thái chờ xác nhận. Bạn có thể theo dõi trong “Lịch hẹn của tôi”.")}</Alert><FormControlLabel control={<Checkbox checked={accepted} disabled={busy || uncertain || !ready} onChange={e=>setAccepted(e.target.checked)}/>} label={t("Tôi xác nhận thông tin bệnh nhân, thời gian, phí khám và địa chỉ ở trên.")}/></div>}
      </fieldset>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6"><Button startIcon={<ArrowBack/>} disabled={!step || busy || uncertain} onClick={()=>{setStep(step-1);setError(null);}}>{t("Quay lại")}</Button>{uncertain ? <Button variant="contained" loading={busy} onClick={()=>void submit()}>{t("Thử lại yêu cầu đã gửi")}</Button> : step < 2 ? <Button variant="contained" endIcon={<ArrowForward/>} disabled={busy || (step === 0 ? !slot || !doctor : !ready)} onClick={()=>{ if(!user) dispatch(openAuth()); else {setStep(step+1);setAccepted(false);} }}>{!user ? t("Đăng nhập để tiếp tục") : t("Tiếp tục")}</Button> : <Button variant="contained" loading={busy} disabled={!ready || !accepted} onClick={()=>void submit()}>{t("Xác nhận đặt lịch")}</Button>}</div>
    </section>
    <aside className="grid gap-4 lg:sticky lg:top-28"><section className="surface booking-summary"><span className="eyebrow">{t("LỊCH KHÁM CỦA BẠN")}</span><div className="summary-avatar">+</div><h3 className="mt-4 text-lg font-bold">{doctor?.name || t("Chọn bác sĩ của bạn")}</h3><p className="mt-1 text-sm text-teal-700">{doctor?.specialty || t("Bắt đầu từ bước chọn lịch khám")}</p><hr className="my-5 border-slate-100"/><p className="text-sm text-slate-500">{t("Thời gian khám")}</p><p className="mt-1 font-semibold">{slot ? dateTime(slot.startsAt,doctors.availability?.timezone) : t("Chưa chọn giờ khám")}</p><p className="mt-4 text-sm text-slate-500">{t("Địa điểm")}</p><p className="mt-1 text-sm">{doctor?.address || t("Hiển thị sau khi chọn bác sĩ")}</p><div className="mt-6 flex justify-between border-t border-slate-100 pt-4"><span>{t("Phí khám")}</span><b className="text-teal-700">{doctor ? money(doctor.consultationFee) : '—'}</b></div></section><div className="flex gap-3 rounded-xl bg-teal-50 p-5 text-sm leading-relaxed text-teal-800"><LockOutlined fontSize="small"/><p>{t("Hồ sơ và tài liệu của bạn chỉ được sử dụng để phục vụ việc khám bệnh.")}</p></div></aside>
  </div>;
}
