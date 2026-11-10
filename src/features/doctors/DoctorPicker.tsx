import { useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import { Button, CircularProgress, ListSubheader, MenuItem, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { t, useLanguage } from '../../i18n';
import { fetchDoctorOptions } from './doctorSlice';
import type { Doctor } from '../../api/types';

export default function DoctorPicker({ value, selectedDoctor, onChange, disabled = false }: {
  value: string; selectedDoctor: Doctor | null; onChange: (id: string) => void; disabled?: boolean;
}) {
  useLanguage();
  const dispatch = useAppDispatch();
  const options = useAppSelector(s => s.doctors.options);
  const [open, setOpen] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMore = options.page < options.totalPages;
  const loadNext = () => { if (!disabled) void dispatch(fetchDoctorOptions(options.page + 1)); };

  useEffect(() => { void dispatch(fetchDoctorOptions(1)); }, [dispatch]);
  // Cancel queued work when the menu closes, its state changes, or it unmounts.
  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = null;
  }, [open, disabled, options.page, options.status]);

  // The selected doctor can come from a deep link before its page is loaded.
  const includeSelected = !!value && !options.items.some(doctor => doctor.id === value);
  return <TextField
    select label={t('Bác sĩ khám')} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}
    slotProps={{ select: {
      open, onOpen: () => setOpen(true), onClose: () => setOpen(false),
      MenuProps: { slotProps: {
        paper: {
          sx: { maxHeight: 300, overscrollBehavior: 'contain' },
          onScroll: (event: UIEvent<HTMLDivElement>) => {
            const element = event.currentTarget;
            if (scrollTimer.current) clearTimeout(scrollTimer.current);
            scrollTimer.current = null;
            if (!disabled && hasMore && options.status !== 'loading' && options.status !== 'failed' && element.scrollHeight - element.scrollTop - element.clientHeight < 64) {
              scrollTimer.current = setTimeout(() => {
                scrollTimer.current = null;
                if (element.isConnected && element.scrollHeight - element.scrollTop - element.clientHeight < 64) loadNext();
              }, 300);
            }
          },
        },
      } },
    } }}
  >
    <MenuItem value="">{t('Chọn bác sĩ')}</MenuItem>
    {includeSelected && <MenuItem value={value}>{selectedDoctor ? `${selectedDoctor.name} · ${selectedDoctor.specialty}` : t('Đang tải bác sĩ đã chọn…')}</MenuItem>}
    {options.items.map(doctor => <MenuItem key={doctor.id} value={doctor.id} sx={{ whiteSpace: 'normal', minHeight: 48 }}>{doctor.name} · {doctor.specialty}</MenuItem>)}
    <ListSubheader component="div" sx={{ bgcolor: 'background.paper', lineHeight: 1.6, py: 1.5, whiteSpace: 'normal', fontSize: 13 }}>
      {options.status === 'loading' ? <span role="status" className="flex items-center justify-center gap-2"><CircularProgress size={16} />{t('Đang tải thêm bác sĩ…')}</span>
        : options.error ? <div role="alert" className="grid gap-2"><span>{t(options.error.message)}</span><Button size="small" onClick={event => { event.stopPropagation(); loadNext(); }}>{t('Thử lại')}</Button></div>
        : !options.items.length ? t('Chưa có dữ liệu')
        : <div className="grid justify-items-center gap-1"><span></span>{hasMore
          ? <Button size="small" onClick={event => { event.stopPropagation(); loadNext(); }}>{t('Tải thêm bác sĩ')}</Button>
          : null}</div>}
    </ListSubheader>
  </TextField>;
}
