import { t, useLanguage } from '../../i18n';
import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { ChatBubbleOutlineRounded, CloseRounded, SendRounded, SmartToyOutlined } from '@mui/icons-material';
import { onSessionCleared } from '../../api/axiosClient';


export default function ChatbotWidget() {
  const language = useLanguage();
  const suggestions = [t("Tôi muốn đặt lịch khám"), t("Cách đổi hoặc hủy lịch hẹn"), t("Đặt khám cho người thân")];

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);

  useEffect(() => onSessionCleared(() => { setMessages([]); setDraft(''); }), []);

  const close = () => { setOpen(false); launcher.current?.focus(); };
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open && thread.current) thread.current.scrollTop = messages.length ? thread.current.scrollHeight : 0;
  }, [messages, open, language]);

  function send(text = draft) {
    const content = text.trim();
    if (!content || content.length > 2000) return;
    setMessages(current => [...current, { id: ++sequence.current, text: content }]);
    setDraft('');
    input.current?.focus();
  }

  return <div className="chatbot-widget">
    {open && <section
      id="support-chat" className="chatbot-panel" role="dialog" aria-modal="false"
      aria-labelledby="support-chat-title" aria-describedby="support-chat-status"
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}
    >
      <header className="chatbot-header">
        <span className="chatbot-avatar"><SmartToyOutlined /></span>
        <div className="chatbot-heading"><h2 id="support-chat-title">{t("Trợ lý An Tâm")}</h2><p>{t("Đồng hành cùng bạn khi đặt khám")}</p></div>
        <IconButton aria-label={t("Thu gọn khung chat")} onClick={close} sx={{ color: 'white', flexShrink: 0 }}><CloseRounded fontSize="small" /></IconButton>
      </header>

      <div className="chatbot-thread" ref={thread}>
        <p className="chatbot-conversation-label">{t("HỖ TRỢ ĐẶT LỊCH KHÁM")}</p>
        <div className="chatbot-greeting">
          <span className="chatbot-message-avatar"><SmartToyOutlined fontSize="small" /></span>
          <div className="chatbot-bubble chatbot-bubble-assistant"><p className="chatbot-greeting-title">{t("Chào bạn! Mình là trợ lý An Tâm.")}</p><p>{t("Bạn cần hỗ trợ tìm bác sĩ, đặt lịch hay quản lý lịch hẹn? Hãy để lại câu hỏi ở đây nhé.")}</p></div>
        </div>
        {!messages.length && <div className="chatbot-suggestions" aria-label={t("Câu hỏi gợi ý")}>{suggestions.map(text => <Button key={text} size="small" variant="outlined" onClick={() => send(text)}>{text}</Button>)}</div>}
        <div className="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label={t("Tin nhắn hỗ trợ")}>{messages.map(message => <div key={message.id} className="chatbot-user-message"><span className="chatbot-message-label">{t("Bạn")}</span><p className="chatbot-bubble chatbot-bubble-user">{message.text}</p></div>)}</div>
        <p id="support-chat-status" className="chatbot-preview-notice">{t("Bản xem trước giao diện · Trợ lý chưa kết nối để trả lời. Tin nhắn chỉ hiển thị trên thiết bị này và sẽ mất khi tải lại trang.")}</p>
      </div>

      <form className="chatbot-composer" onSubmit={event => { event.preventDefault(); send(); }}>
        <div className="chatbot-input-row"><TextField
          inputRef={input} multiline maxRows={4} placeholder={t("Nhập câu hỏi của bạn…")} value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
          }}
          slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': t("Tin nhắn cho trợ lý An Tâm") } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: 15, backgroundColor: '#f7faf9' } }}
        /><IconButton type="submit" aria-label={t("Gửi tin nhắn")} disabled={!draft.trim()} sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: 'primary.main', color: 'white', flexShrink: 0, '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: '#edf2f2', color: '#9badaf' } }}><SendRounded sx={{ fontSize: 20 }} /></IconButton></div>
        <p className="chatbot-composer-hint">{t("Enter để gửi · Shift + Enter để xuống dòng")}</p>
      </form>
    </section>}

    <button
      ref={launcher} type="button" className={`chatbot-launcher${open ? ' is-open' : ''}`}
      aria-label={open ? t("Đóng trợ lý An Tâm") : t("Mở trợ lý An Tâm")} aria-expanded={open}
      aria-controls={open ? 'support-chat' : undefined} onClick={() => open ? close() : setOpen(true)}
    >{open ? <CloseRounded /> : <ChatBubbleOutlineRounded />}<span>{open ? t("Thu gọn") : t("Chat hỗ trợ")}</span>{!open && <span className="chatbot-launcher-dot" aria-hidden="true" />}</button>
  </div>;
}
