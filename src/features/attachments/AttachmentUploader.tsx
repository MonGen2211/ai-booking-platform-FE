import { t, useLanguage } from '../../i18n';
import { useState } from 'react';
import { Alert, Button, LinearProgress } from '@mui/material';
import { AttachFile, Close, DownloadOutlined, UploadFileOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { downloadAttachment, removeAttachment, uploadAttachment } from './attachmentSlice';
import { fileError } from '../../utils/validation';
import { useClock } from '../../hooks/useClock';
export default function AttachmentUploader({ disabled }: { disabled?: boolean }) {
  useLanguage();
  const dispatch = useAppDispatch(); const { items,pending,error } = useAppSelector(s=>s.attachments); const [localError,setLocalError] = useState('');
  const now = useClock();
  return <div className="grid gap-3"><h3 className="font-semibold">{t("Tài liệu đính kèm")}<span className="text-sm font-normal text-slate-500">{t("(không bắt buộc)")}</span></h3><div className="upload-zone"><UploadFileOutlined sx={{ fontSize: 30, color: '#087e8b' }}/><p>{t("Kết quả xét nghiệm, đơn thuốc hoặc tài liệu liên quan")}</p><p className="text-xs text-slate-500">{t("JPEG, PNG, PDF · Tối đa 5 file · 10 MiB/file")}</p><Button component="label" disabled={disabled || !!pending || items.length >= 5} variant="outlined" size="small">{t("Chọn file")}<input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={async e=>{ const file = e.target.files?.[0]; e.target.value = ''; if(!file) return; const message = fileError(file,items.length); setLocalError(message); if(!message) await dispatch(uploadAttachment(file)); }}/></Button></div>{!!pending && <LinearProgress aria-label={t("Đang xử lý file")}/>}{(localError || error) && <Alert severity="error">{t(localError || error?.message || "")}</Alert>}{items.map(file=><div key={file.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"><AttachFile fontSize="small"/><div className="min-w-0 flex-1"><p className="truncate text-sm">{file.originalName}</p><p className="text-xs text-slate-500">{Math.ceil(file.size/1024)} KB{file.expiresAt && new Date(file.expiresAt).getTime() <= now ? t(" · Đã hết hạn, hãy xóa và tải lại") : t(" · File tạm, lưu tối đa 24 giờ")}</p></div><Button aria-label={t("Tải {0}", file.originalName)} disabled={disabled || !!pending} onClick={()=>void dispatch(downloadAttachment(file))} sx={{minWidth:36,px:0}}><DownloadOutlined fontSize="small"/></Button><Button aria-label={t("Xóa {0}", file.originalName)} disabled={disabled || !!pending} onClick={()=>void dispatch(removeAttachment(file.id))} sx={{minWidth:36,px:0}}><Close fontSize="small"/></Button></div>)}</div>;
}
