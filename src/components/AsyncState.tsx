import { t, useLanguage } from '../i18n';
import { Alert, Button, Skeleton } from '@mui/material';
import type { ApiError, LoadStatus } from '../api/types';
export default function AsyncState({ status, error, empty, retry }: { status: LoadStatus; error?: ApiError | null; empty?: boolean; retry: () => void }) {
  useLanguage();
  if (status === 'loading') return <div role="status" aria-label={t("Đang tải")} className="grid gap-3"><Skeleton variant="rounded" height={110}/><Skeleton variant="rounded" height={110}/></div>;
  if (status === 'failed') return <Alert severity="error" action={<Button color="inherit" onClick={retry}>{t("Thử lại")}</Button>}>{t(error?.message || "Không thể tải dữ liệu.")}</Alert>;
  if (empty) return <div className="empty-state"><span className="empty-symbol">+</span><h3>{t("Chưa có dữ liệu")}</h3><p>{t("Hãy đổi lựa chọn hoặc quay lại sau.")}</p></div>;
  return null;
}
