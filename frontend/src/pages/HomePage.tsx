import { useState, useEffect } from "react";
import type { Page, Product } from "../App";
import { fetchProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

interface HomePageProps {
  navigate: (p: Page, product?: any) => void;
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1764694187688-454d172e5ca0?w=1400&h=900&fit=crop&auto=format",
    label: "Sérum Cao Cấp",
    title: "Vẻ Đẹp\nTrường Tồn",
    sub: "Khoa học và thiên nhiên hoà quyện trong từng giọt serum",
  },
  {
    image: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?w=1400&h=900&fit=crop&auto=format",
    label: "Nước Hoa Độc Quyền",
    title: "Hương Thơm\nQuyến Rũ",
    sub: "Những mùi hương được chưng cất từ thiên nhiên thuần khiết",
  },
  {
    image: "https://images.unsplash.com/photo-1764694071508-e4b1efcd39bc?w=1400&h=900&fit=crop&auto=format",
    label: "Dưỡng Da Chuyên Sâu",
    title: "Làn Da\nHoàn Hảo",
    sub: "Công thức độc quyền từ các phòng thí nghiệm danh tiếng tại Paris",
  },
];

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function HomePage({ navigate }: HomePageProps) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

const [bestsellers, setBestsellers] = useState<Product[]>([]);
const [newArrivals, setNewArrivals] = useState<Product[]>([]);

useEffect(() => {
  fetchProducts()
    .then((list) => {
      setBestsellers(list.filter((p) => p.isBestseller));
      setNewArrivals(list.filter((p) => p.isNew));
    })
    .catch(() => {
      // giữ mảng rỗng nếu lỗi
    });
}, []);

  return (
    <div style={{ paddingTop: "64px" }}>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: slide === i ? 1 : 0 }}
          >
            <img src={s.image} alt={s.label} className="w-full h-full object-cover" />
            <div
              style={{ background: "linear-gradient(to right, rgba(26,26,26,0.72) 0%, rgba(26,26,26,0.2) 60%, transparent 100%)" }}
              className="absolute inset-0"
            />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-xl">
              <p
                style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }}
                className="text-xs tracking-widest uppercase mb-6 opacity-90"
              >
                {heroSlides[slide].label}
              </p>
              <h1
                style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }}
                className="text-5xl lg:text-7xl font-normal leading-tight mb-6 whitespace-pre-line"
              >
                {heroSlides[slide].title}
              </h1>
              <p style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-base font-light mb-10 leading-relaxed opacity-80 max-w-xs">
                {heroSlides[slide].sub}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("products")}
                  style={{ background: "var(--color-gold)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                >
                  Khám Phá
                </button>
                <button
                  onClick={() => navigate("products")}
                  style={{ border: "1px solid var(--color-champagne)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                  className="px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-70"
                >
                  Bộ Sưu Tập
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            >
              <span
                style={{
                  display: "block",
                  height: "2px",
                  width: slide === i ? "32px" : "16px",
                  background: slide === i ? "var(--color-gold)" : "rgba(232,221,208,0.4)",
                  transition: "all 0.3s",
                }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Brand values strip */}
      <section style={{ background: "var(--color-charcoal)" }} className="py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "✦", text: "Thành Phần Thuần Khiết" },
              { icon: "✦", text: "Kiểm Định Da Liễu" },
              { icon: "✦", text: "Không Thử Nghiệm Động Vật" },
              { icon: "✦", text: "Bao Bì Tái Chế" },
            ].map((v) => (
              <div key={v.text} className="flex items-center justify-center gap-2">
                <span style={{ color: "var(--color-gold)" }} className="text-xs">{v.icon}</span>
                <span style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase font-light">
                  {v.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
              Được Yêu Thích Nhất
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-4xl font-normal">
              Sản Phẩm Bán Chạy
            </h2>
          </div>
          <button
            onClick={() => navigate("products")}
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }}
            className="text-xs tracking-widest uppercase pb-1 hover:opacity-70 transition-opacity hidden md:block"
          >
            Xem Tất Cả
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="relative overflow-hidden" style={{ height: "420px" }}>
        <img
          src="https://images.unsplash.com/photo-1767771357444-92072accdcd6?w=1400&h=500&fit=crop&auto=format"
          alt="Bộ sưu tập nước hoa"
          className="w-full h-full object-cover"
        />
        <div
          style={{ background: "rgba(26,26,26,0.55)" }}
          className="absolute inset-0 flex items-center justify-center text-center"
        >
          <div>
            <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-4">
              Bộ Sưu Tập 2025
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }}
              className="text-5xl lg:text-6xl font-normal italic mb-6"
            >
              L'Art du Parfum
            </h2>
            <button
              onClick={() => navigate("products")}
              style={{ border: "1px solid var(--color-gold)", color: "var(--color-gold)", fontFamily: "var(--font-body)" }}
              className="px-10 py-3 text-xs tracking-widest uppercase hover:bg-[var(--color-gold)] hover:text-[var(--color-charcoal)] transition-colors"
            >
              Khám Phá Ngay
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ background: "var(--color-mist)" }} className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
              Vừa Ra Mắt
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-4xl font-normal">
              Sản Phẩm Mới
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: "var(--color-charcoal)" }} className="py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-4">
            Ưu Đãi Độc Quyền
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-3xl font-normal mb-4">
            Nhận Ưu Đãi 15%
          </h2>
          <p style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-sm font-light mb-8 opacity-70">
            Đăng ký nhận bản tin để nhận ngay mã giảm giá 15% cho đơn hàng đầu tiên và cập nhật sản phẩm mới nhất.
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              style={{
                background: "rgba(232,221,208,0.08)",
                border: "1px solid rgba(232,221,208,0.2)",
                color: "var(--color-champagne)",
                fontFamily: "var(--font-body)",
              }}
              className="flex-1 px-4 py-3 text-sm placeholder:opacity-40 outline-none focus:border-[var(--color-gold)]"
            />
            <button
              style={{ background: "var(--color-gold)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
              className="px-6 py-3 text-xs tracking-widest uppercase font-medium hover:opacity-80 transition-opacity"
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111", borderTop: "1px solid rgba(232,221,208,0.08)" }} className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <p style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-2xl mb-3">Lumière</p>
              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light leading-relaxed">
                Vẻ đẹp thuần khiết từ thiên nhiên, được tinh luyện qua khoa học hiện đại.
              </p>
            </div>
            {[
              { title: "Sản Phẩm", links: ["Dưỡng Da", "Nước Hoa", "Dưỡng Thể", "Mặt Nạ"] },
              { title: "Hỗ Trợ", links: ["Chính Sách Đổi Trả", "Hướng Dẫn Mua Hàng", "Liên Hệ", "FAQ"] },
              { title: "Về Chúng Tôi", links: ["Câu Chuyện Thương Hiệu", "Thành Phần", "Chứng Nhận", "Blog"] },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-4 font-medium">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light hover:text-[var(--color-champagne)] transition-colors cursor-pointer">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(232,221,208,0.08)" }} className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">
              © 2025 Lumière Beauty. Bản quyền thuộc về Lumière.
            </p>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">
              Thanh toán bảo mật · SSL · VNPAY · MoMo · Thẻ tín dụng
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
