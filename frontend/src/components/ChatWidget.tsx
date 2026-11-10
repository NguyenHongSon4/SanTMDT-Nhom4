import { useEffect, useRef, useState } from "react";
import type { AppUser, Page } from "../App";
import { apiRequest, getToken, API_BASE } from "../services/api";
import { createFeedback } from "../services/feedbackService";

type ChatProduct = { id: string; name: string; description: string; ingredients: string; price: number; stock: number; image: string };
type ChatMessage = { role: "bot" | "customer"; text: string; products?: ChatProduct[] };
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

export default function ChatWidget({ user, navigate }: { user: AppUser | null; navigate: (page: Page) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "bot", text: "Xin chào! Mình có thể giúp bạn tìm hiểu sản phẩm, thành phần, thanh toán hoặc tra cứu đơn hàng." }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, handoff]);

  const send = async (value = draft) => {
    const text = value.trim();
    if (!text || busy) return;
    setMessages((items) => [...items, { role: "customer", text }]);
    setDraft(""); setBusy(true); setError("");
    try {
      const code = text.match(/\bLM\d{10}\b/i)?.[0];
      if (code || /đơn hàng|don hang|mã đơn|ma don/i.test(text)) {
        if (!code) {
          setMessages((items) => [...items, { role: "bot", text: "Bạn gửi mã đơn hàng (dạng LM + 10 chữ số) nhé. Thông tin đơn chỉ tra được sau khi đăng nhập." }]);
        } else if (!getToken()) {
          setMessages((items) => [...items, { role: "bot", text: "Vui lòng đăng nhập trước để mình tra cứu đơn hàng trong tài khoản của bạn." }]);
        } else {
          const result = await apiRequest<{ data: { orderCode: string; status: string; paymentStatus: string; itemCount: number } }>(`/chat/orders/${code}`);
          const order = result.data;
          setMessages((items) => [...items, { role: "bot", text: `Đơn ${order.orderCode}: ${order.status}. Thanh toán: ${order.paymentStatus}. Số sản phẩm: ${order.itemCount}.` }]);
        }
      } else {
        const result = await apiRequest<{ data: { answer: string; products: ChatProduct[] } }>("/chat/ask", { method: "POST", body: JSON.stringify({ message: text }) });
        setMessages((items) => [...items, { role: "bot", text: result.data.answer, products: result.data.products }]);
      }
    } catch (err) {
      setMessages((items) => [...items, { role: "bot", text: err instanceof Error ? err.message : "Chatbot chưa xử lý được yêu cầu này. Bạn có thể gửi yêu cầu cho nhân viên hỗ trợ." }]);
    } finally { setBusy(false); }
  };

  const submitHandoff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await createFeedback({ subject: String(form.get("subject")), category: "question", content: String(form.get("content")) });
      setSent(true); setHandoff(false);
      setMessages((items) => [...items, { role: "bot", text: "Mình đã gửi yêu cầu cho đội ngũ hỗ trợ. Bạn có thể theo dõi phản hồi trong mục Góp ý / Hỗ trợ." }]);
    } catch (err) { setError(err instanceof Error ? err.message : "Chưa gửi được yêu cầu hỗ trợ."); }
    finally { setBusy(false); }
  };

  return <div className="fixed bottom-5 right-5 z-[60] font-sans">
    {open && <section aria-label="Chat hỗ trợ Lumière" className="mb-3 flex h-[min(620px,calc(100vh-110px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden border shadow-2xl" style={{ background: "var(--color-cream)", borderColor: "var(--color-champagne)" }}>
      <header className="flex items-center justify-between px-5 py-4" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>
        <div><p className="text-sm font-medium">Lumière · Hỗ trợ</p><p className="mt-1 text-[11px] opacity-70">Tư vấn sản phẩm và đơn hàng</p></div>
        <button aria-label="Đóng cửa sổ chat" onClick={() => setOpen(false)} className="px-2 py-1 text-xl">×</button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => <div key={index} className={message.role === "customer" ? "ml-8" : "mr-5"}>
          <div className="whitespace-pre-wrap rounded-sm px-3 py-2 text-sm leading-relaxed" style={{ background: message.role === "customer" ? "var(--color-charcoal)" : "var(--color-mist)", color: message.role === "customer" ? "var(--color-champagne)" : "var(--color-charcoal)" }}>{message.text}</div>
          {message.products?.map((product) => <article key={product.id} className="mt-2 flex gap-3 border p-2" style={{ borderColor: "var(--color-champagne)", background: "white" }}>
            {product.image && <img src={product.image.startsWith("http") ? product.image : `${API_BASE.replace(/\/api\/?$/, "")}${product.image}`} alt="" className="h-16 w-16 object-cover" />}
            <div className="min-w-0"><p className="text-sm font-medium">{product.name}</p><p className="text-xs" style={{ color: "var(--color-gold)" }}>{money(product.price)} · {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}</p>
              {product.ingredients && <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--color-warm-gray)" }}>Thành phần: {product.ingredients}</p>}
            </div>
          </article>)}
        </div>)}
        {busy && <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>Đang tìm thông tin…</p>}
        <div ref={endRef} />
      </div>
      {handoff ? <form onSubmit={submitHandoff} className="space-y-2 border-t p-3" style={{ borderColor: "var(--color-champagne)" }}>
        {user ? <><input required minLength={3} maxLength={120} name="subject" placeholder="Chủ đề cần hỗ trợ" className="w-full border px-3 py-2 text-sm" />
          <textarea required minLength={5} maxLength={3000} name="content" placeholder="Mô tả vấn đề của bạn" rows={3} className="w-full resize-none border px-3 py-2 text-sm" />
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-between"><button type="button" onClick={() => setHandoff(false)} className="px-2 text-xs">Quay lại</button><button disabled={busy} className="px-4 py-2 text-xs disabled:opacity-50" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>{sent ? "Gửi yêu cầu khác" : "Gửi cho nhân viên"}</button></div></>
          : <div className="text-sm">Bạn cần đăng nhập để gửi yêu cầu và theo dõi phản hồi. <button type="button" className="underline" onClick={() => navigate("login")}>Đăng nhập</button><button type="button" className="ml-3 text-xs" onClick={() => setHandoff(false)}>Đóng</button></div>}
      </form> : <>
        <div className="flex gap-2 overflow-x-auto px-3 pb-2">
          {["Thành phần sản phẩm", "Phí giao hàng", "Cách thanh toán", "Tra cứu đơn hàng"].map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="shrink-0 border px-2 py-1 text-[10px]" style={{ borderColor: "var(--color-champagne)", color: "var(--color-warm-gray)" }}>{prompt}</button>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2 border-t p-3" style={{ borderColor: "var(--color-champagne)" }}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Nhập câu hỏi…" aria-label="Nhập câu hỏi" className="min-w-0 flex-1 border px-3 py-2 text-sm outline-none" />
          <button disabled={busy || !draft.trim()} className="px-3 text-xs disabled:opacity-40" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>Gửi</button>
        </form>
        <button onClick={() => setHandoff(true)} className="pb-3 text-center text-xs underline" style={{ color: "var(--color-warm-gray)" }}>Gặp nhân viên hỗ trợ</button>
      </>}
    </section>}
    <button onClick={() => setOpen((value) => !value)} aria-label={open ? "Đóng hỗ trợ chat" : "Mở hỗ trợ chat"} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>
      {open ? <span className="text-2xl">×</span> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.8-4.5A8.4 8.4 0 1 1 21 11.5Z"/><path d="M8 10h8M8 14h5"/></svg>}
    </button>
  </div>;
}
