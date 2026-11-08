import type { Page } from "../App";

interface SupportInfoPageProps {
  page: "return-policy" | "buying-guide" | "brand-story" | "certifications";
  navigate: (page: Page) => void;
}

const content = {
  "return-policy": {
    eyebrow: "Hỗ trợ khách hàng",
    title: "Chính sách đổi trả",
    intro:
      "Lumière hỗ trợ đổi hoặc trả sản phẩm trong vòng 30 ngày kể từ ngày đơn hàng được giao, theo các điều kiện dưới đây.",
    sections: [
      {
        title: "Điều kiện áp dụng",
        points: [
          "Sản phẩm còn nguyên niêm phong, chưa qua sử dụng và còn đầy đủ hộp, phụ kiện, quà tặng kèm (nếu có).",
          "Khách hàng cung cấp mã đơn hàng hoặc thông tin đặt hàng để Lumière kiểm tra.",
          "Với mỹ phẩm đã mở niêm phong, Lumière chỉ tiếp nhận yêu cầu nếu sản phẩm bị giao nhầm, hư hỏng khi vận chuyển hoặc có vấn đề chất lượng cần xác minh.",
        ],
      },
      {
        title: "Sản phẩm giao nhầm hoặc bị hư hỏng",
        points: [
          "Vui lòng liên hệ Lumière trong vòng 48 giờ sau khi nhận hàng và gửi ảnh/video tình trạng sản phẩm cùng bao bì vận chuyển.",
          "Giữ lại sản phẩm và bao bì để việc kiểm tra được thuận tiện. Lumière sẽ hướng dẫn đổi sản phẩm hoặc hoàn tiền sau khi xác minh.",
          "Nếu lỗi được xác nhận thuộc về Lumière hoặc đơn vị vận chuyển, Lumière chịu chi phí đổi trả.",
        ],
      },
      {
        title: "Cách gửi yêu cầu",
        points: [
          "Gọi hotline 1900 8989 và cung cấp mã đơn hàng, sản phẩm cần hỗ trợ cùng lý do đổi trả.",
          "Chờ hướng dẫn từ nhân viên trước khi gửi sản phẩm về; vui lòng không tự gửi COD nếu chưa được xác nhận.",
          "Sau khi nhận và kiểm tra sản phẩm, Lumière sẽ liên hệ để xác nhận phương án đổi hàng hoặc hoàn tiền. Thời gian hoàn tiền phụ thuộc phương thức thanh toán và ngân hàng liên quan.",
        ],
      },
    ],
    note: "Chính sách này không hạn chế các quyền của người tiêu dùng theo quy định pháp luật hiện hành.",
  },
  "buying-guide": {
    eyebrow: "Hỗ trợ khách hàng",
    title: "Hướng dẫn mua hàng",
    intro:
      "Bạn có thể đặt sản phẩm Lumière trực tiếp trên website theo các bước đơn giản sau.",
    sections: [
      {
        title: "1. Chọn sản phẩm",
        points: [
          "Mở mục Sản Phẩm ở thanh điều hướng hoặc footer để xem toàn bộ danh mục.",
          "Chọn sản phẩm để xem mô tả, thành phần, giá bán và đánh giá trước khi mua.",
          "Điều chỉnh số lượng rồi chọn Thêm vào giỏ hàng hoặc Mua ngay.",
        ],
      },
      {
        title: "2. Kiểm tra giỏ hàng và nhập thông tin nhận hàng",
        points: [
          "Kiểm tra sản phẩm, số lượng và tổng tiền trong giỏ; nhập mã giảm giá nếu có.",
          "Điền chính xác họ tên, số điện thoại, địa chỉ và tỉnh/thành phố để đơn hàng được giao thuận lợi.",
          "Đọc lại thông tin và ghi chú giao hàng trước khi chuyển sang bước thanh toán.",
        ],
      },
      {
        title: "3. Chọn thanh toán và theo dõi đơn",
        points: [
          "Chọn COD để thanh toán khi nhận hàng hoặc chuyển khoản theo QR và nội dung đơn hàng được hiển thị sau khi đặt đơn.",
          "Thanh toán thẻ sẽ xuất hiện khi cửa hàng đã bật cổng thanh toán tương ứng.",
          "Sau khi đặt hàng, lưu lại mã đơn và vào mục Đơn hàng để xem thông tin, trạng thái xử lý hoặc gửi yêu cầu hỗ trợ.",
        ],
      },
    ],
    note: "Nếu cần hỗ trợ đặt hàng, vui lòng gọi hotline 1900 8989.",
  },
  "brand-story": {
    eyebrow: "Về Lumière",
    title: "Câu chuyện thương hiệu",
    intro:
      "Lumière lấy cảm hứng từ vẻ đẹp tự nhiên và những khoảnh khắc chăm sóc bản thân mỗi ngày — nhẹ nhàng, có chủ đích và phù hợp với nhịp sống hiện đại.",
    sections: [
      {
        title: "Ánh sáng trong những điều giản dị",
        points: [
          "Chúng tôi tin rằng chăm sóc sắc đẹp không cần cầu kỳ; một lựa chọn phù hợp và thói quen đều đặn có thể tạo nên khác biệt lâu dài.",
          "Lumière xây dựng trải nghiệm mua sắm tinh giản để khách hàng dễ tìm hiểu và chọn sản phẩm theo nhu cầu của mình.",
        ],
      },
      {
        title: "Tôn trọng làn da, đề cao thông tin rõ ràng",
        points: [
          "Mỗi sản phẩm được giới thiệu cùng thông tin mô tả, thành phần và hướng dẫn sử dụng hiện có từ nhà sản xuất hoặc nhà cung cấp.",
          "Chúng tôi khuyến khích khách hàng đọc kỹ thành phần, thử sản phẩm phù hợp với tình trạng da và tham khảo chuyên gia khi cần.",
        ],
      },
      {
        title: "Hoàn thiện từ trải nghiệm khách hàng",
        points: [
          "Lumière lắng nghe đánh giá và góp ý để cải thiện cách tư vấn, lựa chọn sản phẩm và hỗ trợ sau mua.",
          "Mục tiêu của chúng tôi là mang đến trải nghiệm chăm sóc bản thân tinh tế, đáng tin cậy và gần gũi.",
        ],
      },
    ],
    note: "Nội dung giới thiệu thương hiệu này mô tả định hướng và trải nghiệm Lumière hướng tới; thông tin cụ thể của từng sản phẩm được trình bày tại trang sản phẩm tương ứng.",
  },
  certifications: {
    eyebrow: "Minh bạch sản phẩm",
    title: "Chứng nhận & hồ sơ sản phẩm",
    intro:
      "Hồ sơ và chứng từ có thể khác nhau theo thương hiệu, dòng sản phẩm và lô hàng. Lumière chỉ cung cấp thông tin xác minh được từ nhà sản xuất hoặc nhà cung cấp.",
    sections: [
      {
        title: "Thông tin theo từng sản phẩm",
        points: [
          "Thành phần, hướng dẫn sử dụng, xuất xứ và các thông tin công bố được thể hiện tại trang chi tiết sản phẩm khi có dữ liệu.",
          "Chứng từ chất lượng hoặc chứng nhận (nếu có) chỉ áp dụng cho sản phẩm, đơn vị cấp và phạm vi ghi trên chính tài liệu đó.",
          "Không phải mọi sản phẩm đều có cùng loại chứng nhận; vì vậy Lumière không sử dụng một biểu trưng chung để đại diện cho toàn bộ danh mục.",
        ],
      },
      {
        title: "Cách yêu cầu kiểm tra hồ sơ",
        points: [
          "Gọi hotline 1900 8989 và cung cấp tên sản phẩm, mã đơn hàng hoặc thông tin lô in trên bao bì.",
          "Lumière sẽ kiểm tra tài liệu hiện có từ nhà cung cấp và phản hồi về hồ sơ có thể chia sẻ cho sản phẩm đó.",
          "Khi nhận hàng, khách hàng có thể đối chiếu tên sản phẩm, nhãn, niêm phong và thông tin lô với mô tả được cung cấp.",
        ],
      },
    ],
    note: "Trang này không thay thế chứng nhận hoặc hồ sơ riêng của từng sản phẩm. Khi có tài liệu xác thực được duyệt để công bố, thông tin sẽ được bổ sung cụ thể theo sản phẩm.",
  },
} as const;

export default function SupportInfoPage({ page, navigate }: SupportInfoPageProps) {
  const info = content[page];

  return (
    <main style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      <header style={{ background: "var(--color-charcoal)" }} className="py-14 px-6 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
          {info.eyebrow}
        </p>
        <h1 style={{ color: "var(--color-champagne)", fontFamily: "var(--font-display)" }} className="text-4xl font-normal italic">
          {info.title}
        </h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase mb-8" style={{ fontFamily: "var(--font-body)" }}>
          <button onClick={() => navigate("home")} className="hover:text-[var(--color-charcoal)]" style={{ color: "var(--color-warm-gray)" }}>Trang Chủ</button>
          <span style={{ color: "var(--color-champagne)" }}>·</span>
          <button onClick={() => navigate("products")} className="hover:text-[var(--color-charcoal)]" style={{ color: "var(--color-warm-gray)" }}>Sản Phẩm</button>
          <span style={{ color: "var(--color-champagne)" }}>·</span>
          <span style={{ color: "var(--color-charcoal)" }}>{info.title}</span>
        </nav>

        <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-xl leading-relaxed mb-8">
          {info.intro}
        </p>

        <div className="space-y-5">
          {info.sections.map((section) => (
            <section key={section.title} style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6 md:p-8">
              <h2 style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-2xl mb-4">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}>
                    <span style={{ color: "var(--color-gold)" }}>✦</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", borderTop: "1px solid var(--color-champagne)" }} className="mt-8 pt-5 text-xs leading-relaxed">
          {info.note}
        </p>
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("products")}
            style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
            className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
          >
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    </main>
  );
}
