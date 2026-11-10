import { LanguageRounded } from '@mui/icons-material';
import { getLanguage, setLanguage, useLanguage } from '../i18n';
export default function LanguageSwitcher() {
  useLanguage();
  return <div className="language-switcher" role="group" aria-label={getLanguage() === 'vi' ? 'Ngôn ngữ / Language' : 'Language / Ngôn ngữ'}><LanguageRounded aria-hidden="true"/><button type="button" lang="vi" aria-label="Tiếng Việt" aria-pressed={getLanguage() === 'vi'} onClick={()=>setLanguage('vi')}>VI</button><span aria-hidden="true">/</span><button type="button" lang="en" aria-label="English" aria-pressed={getLanguage() === 'en'} onClick={()=>setLanguage('en')}>EN</button></div>;
}
