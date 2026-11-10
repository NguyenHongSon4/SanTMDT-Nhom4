import { useEffect, useMemo, useState } from "react";
import type { AppUser, Page } from "../App";
import { closeFeedback, createFeedback, getAllFeedback, getMyFeedback, replyToFeedback, type FeedbackThread } from "../services/feedbackService";

const categories = { question: "Thắc mắc chung", order: "Đơn hàng", product: "Sản phẩm", other: "Khác" };
const statusLabel = { open: "Đang chờ phản hồi", answered: "Đã phản hồi", closed: "Đã đóng" };
const dateLabel = (date: string) => new Date(date).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });

export default function FeedbackPage({ user, navigate }: { user: AppUser; navigate: (page: Page) => void }) {
  const isAdmin = user.role === "admin";
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<FeedbackThread["category"]>("question");
  const [content, setContent] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const refresh = async (preferredId?: string) => {
    const data = isAdmin ? await getAllFeedback() : await getMyFeedback();
    setThreads(data);
    const nextId = preferredId && data.some((thread) => thread._id === preferredId) ? preferredId : selectedId && data.some((thread) => thread._id === selectedId) ? selectedId : data[0]?._id || "";
    setSelectedId(nextId);
  };

  useEffect(() => {
    (isAdmin ? getAllFeedback() : getMyFeedback()).then((data) => { setThreads(data); setSelectedId(data[0]?._id || ""); })
      .catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const selected = useMemo(() => threads.find((thread) => thread._id === selectedId), [threads, selectedId]);
  const pendingCount = threads.filter((thread) => thread.status === "open").length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true); setError("");
    try {
      const created = await createFeedback({ subject, category, content });
      setSubject(""); setContent(""); await refresh(created._id);
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể gửi góp ý"); }
    finally { setSending(false); }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return;
    setSending(true); setError("");
    try { const updated = await replyToFeedback(selected._id, reply); setReply(""); await refresh(updated._id); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể gửi phản hồi"); }
    finally { setSending(false); }
  };

  const finishThread = async () => {
    if (!selected) return;
    setError("");
    try { await closeFeedback(selected._id); await refresh(selected._id); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể đóng góp ý"); }
  };

  return (
    <main className="min-h-screen px-5 py-12 md:px-10" style={{ paddingTop: "104px", background: "var(--color-mist)" }}>
      <div className="mx-auto max-w-6xl">
        <button onClick={() => navigate(isAdmin ? "admin-dashboard" : "home")} className="mb-6 text-sm hover:opacity-70" style={{ color: "var(--color-warm-gray)" }}>← {isAdmin ? "Quản trị" : "Trang chủ"}</button>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs uppercase tracking-[0.25em]" style={{ color: "var(--color-gold)" }}>{isAdmin ? "Chăm sóc khách hàng" : "Lumière hỗ trợ bạn"}</p>
            <h1 className="text-3xl md:text-4xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>{isAdmin ? "Yêu cầu hỗ trợ khách hàng" : "Góp ý & hỗ trợ"}</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--color-warm-gray)" }}>{isAdmin ? `${threads.length} cuộc trao đổi · ${pendingCount} đang chờ xử lý` : "Gửi thắc mắc cho chúng tôi và theo dõi phản hồi tại đây."}</p>
          </div>
          {!isAdmin && <button onClick={() => setSelectedId("new")} className="px-5 py-3 text-xs uppercase tracking-widest" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>Gửi góp ý mới ＋</button>}
        </header>

        {error && <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? <div className="py-16 text-center" style={{ color: "var(--color-warm-gray)" }}>Đang tải cuộc trao đổi…</div> : (
          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <aside className="space-y-3">
              {threads.map((thread) => {
                const customer = typeof thread.userId === "object" ? thread.userId : null;
                const lastMessage = thread.messages[thread.messages.length - 1];
                return <button key={thread._id} onClick={() => setSelectedId(thread._id)} className="w-full border p-4 text-left transition-colors" style={{ background: "var(--color-cream)", borderColor: selectedId === thread._id ? "var(--color-gold)" : "rgba(138,130,120,.2)" }}>
                  <div className="flex items-start justify-between gap-3"><span className="font-medium" style={{ color: "var(--color-charcoal)" }}>{thread.subject}</span><span className="shrink-0 text-[10px] uppercase tracking-wider" style={{ color: thread.status === "open" ? "#b7791f" : "var(--color-warm-gray)" }}>{statusLabel[thread.status]}</span></div>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-warm-gray)" }}>{customer ? `${customer.name} · ${customer.email}` : categories[thread.category]}</p>
                  <p className="mt-3 truncate text-sm" style={{ color: "var(--color-warm-gray)" }}>{lastMessage?.content}</p>
                  <p className="mt-2 text-[11px]" style={{ color: "var(--color-warm-gray)" }}>{lastMessage ? dateLabel(lastMessage.createdAt) : ""}</p>
                </button>;
              })}
              {!threads.length && <div className="border p-6 text-center text-sm" style={{ background: "var(--color-cream)", borderColor: "rgba(138,130,120,.2)", color: "var(--color-warm-gray)" }}>{isAdmin ? "Chưa có góp ý nào." : "Bạn chưa gửi góp ý nào."}</div>}
            </aside>

            {!isAdmin && selectedId === "new" ? (
              <form onSubmit={submit} className="space-y-5 border p-6 md:p-8" style={{ background: "var(--color-cream)", borderColor: "rgba(138,130,120,.2)" }}>
                <h2 className="text-xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>Gửi góp ý mới</h2>
                <label className="block text-sm" style={{ color: "var(--color-charcoal)" }}>Chủ đề<input required minLength={3} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 w-full border px-3 py-3 outline-none" /></label>
                <label className="block text-sm" style={{ color: "var(--color-charcoal)" }}>Nội dung liên quan<select value={category} onChange={(event) => setCategory(event.target.value as FeedbackThread["category"])} className="mt-2 w-full border px-3 py-3"><option value="question">Thắc mắc chung</option><option value="order">Đơn hàng</option><option value="product">Sản phẩm</option><option value="other">Khác</option></select></label>
                <label className="block text-sm" style={{ color: "var(--color-charcoal)" }}>Nội dung<textarea required minLength={5} maxLength={3000} rows={6} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Mô tả thắc mắc hoặc góp ý của bạn…" className="mt-2 w-full resize-y border px-3 py-3 outline-none" /></label>
                <button disabled={sending} className="px-6 py-3 text-xs uppercase tracking-widest disabled:opacity-50" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>{sending ? "Đang gửi…" : "Gửi góp ý"}</button>
              </form>
            ) : selected ? (
              <section className="flex min-h-[480px] flex-col border" style={{ background: "var(--color-cream)", borderColor: "rgba(138,130,120,.2)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "rgba(138,130,120,.2)" }}>
                  <div><h2 className="text-lg" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>{selected.subject}</h2><p className="mt-1 text-xs" style={{ color: "var(--color-warm-gray)" }}>{categories[selected.category]} · {statusLabel[selected.status]}</p></div>
                  {isAdmin && selected.status !== "closed" && <button onClick={finishThread} className="border px-3 py-2 text-xs" style={{ borderColor: "rgba(138,130,120,.3)", color: "var(--color-warm-gray)" }}>Đóng trao đổi</button>}
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-7">
                  {selected.messages.map((message) => {
                    const mine = message.senderRole === user.role;
                    return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><article className="max-w-[85%] px-4 py-3" style={{ background: mine ? "var(--color-charcoal)" : "var(--color-mist)", color: mine ? "var(--color-champagne)" : "var(--color-charcoal)" }}>
                      <p className="mb-1 text-[10px] uppercase tracking-widest" style={{ color: mine ? "var(--color-gold)" : "var(--color-warm-gray)" }}>{message.senderRole === "admin" ? "Lumière · Admin" : "Khách hàng"}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p><p className="mt-2 text-right text-[10px] opacity-60">{dateLabel(message.createdAt)}</p>
                    </article></div>;
                  })}
                </div>
                {selected.status !== "closed" ? <form onSubmit={sendReply} className="flex gap-3 border-t p-4" style={{ borderColor: "rgba(138,130,120,.2)" }}><textarea aria-label="Nội dung phản hồi" required minLength={5} maxLength={3000} rows={2} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Viết phản hồi…" className="min-w-0 flex-1 resize-y border px-3 py-2 text-sm outline-none" /><button disabled={sending} className="self-end px-5 py-3 text-xs uppercase tracking-widest disabled:opacity-50" style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}>{sending ? "Đang gửi" : "Gửi"}</button></form> : <p className="border-t p-4 text-center text-sm" style={{ borderColor: "rgba(138,130,120,.2)", color: "var(--color-warm-gray)" }}>Cuộc trao đổi đã đóng.</p>}
              </section>
            ) : <div className="border p-10 text-center text-sm" style={{ background: "var(--color-cream)", borderColor: "rgba(138,130,120,.2)", color: "var(--color-warm-gray)" }}>Chọn một cuộc trao đổi để xem nội dung.</div>}
          </div>
        )}
      </div>
    </main>
  );
}
