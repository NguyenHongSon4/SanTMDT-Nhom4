import { useEffect, useMemo, useState } from "react";
import {
  getRevenueReport,
  type RevenueGranularity,
  type RevenueReport,
} from "../../services/revenueService";

const fmt = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const granularityOptions: { value: RevenueGranularity; label: string; hint: string }[] = [
  { value: "day", label: "Theo ngày", hint: "Chọn tháng để xem từng ngày" },
  { value: "month", label: "Theo tháng", hint: "12 tháng trong năm" },
  { value: "quarter", label: "Theo quý", hint: "4 quý trong năm" },
  { value: "year", label: "Theo năm", hint: "So sánh 5 năm gần nhất" },
];

function periodLabel(period: string, granularity: RevenueGranularity) {
  if (granularity === "day") return new Date(`${period}T12:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  if (granularity === "month") return `Tháng ${period.slice(5)}`;
  if (granularity === "quarter") return period.replace("-Q", " · Quý ");
  return `Năm ${period}`;
}

function RevenueChart({ report }: { report: RevenueReport }) {
  const width = 960;
  const height = 300;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 44;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(...report.series.map((item) => item.revenue), 1);
  const points = report.series.map((item, index) => {
    const x = report.series.length === 1 ? left + plotWidth / 2 : left + index * (plotWidth / (report.series.length - 1));
    const y = top + plotHeight - (item.revenue / max) * plotHeight;
    return { ...item, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = points.length ? `M ${points[0].x} ${top + plotHeight} L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points[points.length - 1].x} ${top + plotHeight} Z` : "";
  const labelIndexes = new Set(points.length <= 12 ? points.map((_, i) => i) : [0, ...points.map((_, i) => i).filter((i) => i % 5 === 0), points.length - 1]);

  if (!report.summary.orders) {
    return <div className="flex h-64 items-center justify-center text-sm" style={{ color: "var(--color-warm-gray)" }}>Chưa có doanh thu hoàn tất trong kỳ này.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ doanh thu theo kỳ" className="h-64 w-full min-w-[680px] overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = top + plotHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line x1={left} x2={width - right} y1={y} y2={y} stroke="rgba(26,26,26,0.08)" strokeDasharray={ratio === 0 ? undefined : "3 5"} />
              <text x={left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#958b80">{ratio === 0 ? "0" : `${Math.round((max * ratio) / 1000)}k`}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c9a882" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#c9a882" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#revenue-area)" />
        <polyline points={linePoints} fill="none" stroke="#a9855d" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={point.period}>
            <circle cx={point.x} cy={point.y} r="4" fill="#1a1a1a" stroke="#f7f3ee" strokeWidth="2">
              <title>{`${periodLabel(point.period, report.granularity)}: ${fmt(point.revenue)} · ${point.orders} đơn`}</title>
            </circle>
            {labelIndexes.has(index) && (
              <text x={point.x} y={height - 13} textAnchor="middle" fontSize="9" fill="#80766c">
                {report.granularity === "day" ? point.period.slice(8) : report.granularity === "month" ? point.period.slice(5) : report.granularity === "quarter" ? `Q${point.period.slice(-1)}` : point.period}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function downloadCsv(report: RevenueReport) {
  const rows = [
    ["Kỳ", "Doanh thu", "Đơn hoàn tất", "Tiền hàng", "Giảm giá", "Phí giao hàng", "COD", "Chuyển khoản", "Thẻ"],
    ...report.series.map((row) => [row.period, row.revenue, row.orders, row.subtotal, row.discount, row.shippingFee, row.codRevenue, row.transferRevenue, row.cardRevenue]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `doanh-thu-${report.granularity}-${report.year}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminRevenue() {
  const currentYear = new Date().getFullYear();
  const [granularity, setGranularity] = useState<RevenueGranularity>("month");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getRevenueReport({ granularity, year, month })
      .then((data) => { if (active) setReport(data); })
      .catch((err: Error) => { if (active) setError(err.message || "Không tải được báo cáo doanh thu"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [granularity, year, month]);

  const yearOptions = useMemo(() => Array.from({ length: 11 }, (_, index) => currentYear - index), [currentYear]);
  const selectedOption = granularityOptions.find((option) => option.value === granularity)!;

  return (
    <main className="min-h-screen p-5 md:p-8" style={{ background: "var(--color-cream)" }}>
      <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }}>Phân tích kinh doanh</p>
          <h1 className="text-3xl md:text-4xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>Báo cáo doanh thu</h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>Theo dõi doanh thu từ đơn đã hoàn tất và so sánh theo ngày, tháng, quý hoặc năm.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>
            Năm báo cáo
            <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="min-w-28 border bg-white px-3 py-2 text-sm normal-case tracking-normal outline-none" style={{ borderColor: "var(--color-champagne)", color: "var(--color-charcoal)" }}>
              {yearOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          {granularity === "day" && (
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>
              Tháng
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="min-w-32 border bg-white px-3 py-2 text-sm normal-case tracking-normal outline-none" style={{ borderColor: "var(--color-champagne)", color: "var(--color-charcoal)" }}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Tháng {String(value).padStart(2, "0")}</option>)}
              </select>
            </label>
          )}
          {report && <button type="button" onClick={() => downloadCsv(report)} className="border px-4 py-2 text-xs uppercase tracking-widest hover:bg-white" style={{ borderColor: "var(--color-champagne)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>Xuất CSV</button>}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b" style={{ borderColor: "var(--color-champagne)" }}>
        <div className="flex flex-wrap gap-1">
          {granularityOptions.map((option) => (
            <button key={option.value} onClick={() => setGranularity(option.value)} className="border-b-2 px-4 py-3 text-xs uppercase tracking-widest transition-colors" style={{ borderColor: granularity === option.value ? "var(--color-charcoal)" : "transparent", color: granularity === option.value ? "var(--color-charcoal)" : "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>
              {option.label}
            </button>
          ))}
        </div>
        <p className="pb-2 text-xs" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{selectedOption.hint}</p>
      </div>

      {loading && <div className="py-20 text-center text-sm" style={{ color: "var(--color-warm-gray)" }}>Đang tổng hợp doanh thu...</div>}
      {!loading && error && <div role="alert" className="border bg-white p-5 text-sm" style={{ color: "#c0392b", borderColor: "#e8c5bf" }}>{error}</div>}
      {!loading && !error && report && (
        <>
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Doanh thu thực nhận", value: fmt(report.summary.revenue), note: granularity === "year" ? `5 năm tính đến ${year}` : `${report.summary.orders} đơn hoàn tất` },
              { label: "Đơn hoàn tất", value: report.summary.orders.toLocaleString("vi-VN"), note: "Đơn đủ điều kiện ghi nhận doanh thu" },
              { label: "Giá trị đơn trung bình", value: fmt(report.summary.averageOrderValue), note: "Doanh thu / số đơn hoàn tất" },
              { label: "Giảm giá đã áp dụng", value: fmt(report.summary.discount), note: `Phí giao hàng: ${fmt(report.summary.shippingFee)}` },
            ].map((card) => (
              <article key={card.label} className="border bg-white p-5" style={{ borderColor: "var(--color-champagne)" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{card.label}</p>
                <p className="mt-3 text-2xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>{card.value}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{card.note}</p>
              </article>
            ))}
          </section>

          <section className="mb-6 border bg-white p-5 md:p-7" style={{ borderColor: "var(--color-champagne)" }}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>Xu hướng doanh thu</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{selectedOption.hint} · {granularity === "year" ? `${year - 4}–${year}` : granularity === "day" ? `Tháng ${String(month).padStart(2, "0")}/${year}` : year}</p>
              </div>
              <p className="text-right text-sm font-medium" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>{fmt(report.summary.revenue)}<span className="ml-1 text-xs font-normal text-[var(--color-warm-gray)]">tổng kỳ</span></p>
            </div>
            <RevenueChart report={report} />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: "COD", value: report.summary.byPaymentMethod.cod },
              { label: "Chuyển khoản", value: report.summary.byPaymentMethod.transfer },
              { label: "Thẻ", value: report.summary.byPaymentMethod.card },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border bg-white px-5 py-4" style={{ borderColor: "var(--color-champagne)" }}>
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{item.label}</span>
                <strong className="text-sm" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>{fmt(item.value)}</strong>
              </div>
            ))}
          </section>

          <section className="overflow-hidden border bg-white" style={{ borderColor: "var(--color-champagne)" }}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--color-champagne)" }}>
              <div>
                <h2 className="text-xl" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}>Chi tiết theo kỳ</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>Doanh thu, số đơn và giá trị trung bình trong từng khoảng.</p>
              </div>
              <span className="text-xs" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>{report.series.length} kỳ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-warm-gray)", background: "var(--color-mist)", fontFamily: "var(--font-body)" }}>
                    {["Kỳ", "Doanh thu", "Đơn hoàn tất", "Trung bình/đơn", "Tiền hàng", "Giảm giá"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.series.map((row) => (
                    <tr key={row.period} className="border-t" style={{ borderColor: "var(--color-champagne)" }}>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>{periodLabel(row.period, granularity)}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>{fmt(row.revenue)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-warm-gray)" }}>{row.orders.toLocaleString("vi-VN")}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-warm-gray)" }}>{fmt(row.orders ? Math.round(row.revenue / row.orders) : 0)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-warm-gray)" }}>{fmt(row.subtotal)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--color-warm-gray)" }}>{fmt(row.discount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>
            Doanh thu chỉ tính đơn đã hoàn tất, loại đơn hoàn tiền; COD được ghi nhận khi đơn hoàn tất, chuyển khoản/thẻ cần trạng thái đã thanh toán. Ngày hoàn tất được dùng cho báo cáo; đơn cũ chưa lưu ngày hoàn tất dùng ngày tạo đơn.
          </p>
        </>
      )}
    </main>
  );
}
