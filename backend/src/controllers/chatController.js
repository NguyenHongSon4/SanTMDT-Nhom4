const Product = require("../models/Product");
const Order = require("../models/Order");

const normalize = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const supportAnswers = [
  { keys: ["doi tra", "hoan tien", "tra hang"], answer: "Lumière hỗ trợ đổi hoặc trả trong vòng 30 ngày kể từ khi nhận hàng theo điều kiện áp dụng. Sản phẩm cần còn nguyên niêm phong; nếu hàng giao nhầm, hư hỏng hoặc có vấn đề chất lượng, vui lòng liên hệ hotline 1900 8989 để được hướng dẫn." },
  { keys: ["giao hang", "phi ship", "van chuyen", "thoi gian giao"], answer: "Phí giao hàng hiện là 30.000₫; đơn từ 500.000₫ được miễn phí vận chuyển. Thời gian giao dự kiến chưa được hệ thống cung cấp, bạn vui lòng liên hệ hotline 1900 8989 để được xác nhận." },
  { keys: ["thanh toan", "cod", "chuyen khoan", "the"], answer: "Cửa hàng hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản. Thanh toán thẻ chỉ khả dụng khi cổng thanh toán tương ứng được bật. Trạng thái thanh toán thực tế sẽ được cập nhật trong mục Đơn hàng." },
  { keys: ["dat hang", "mua hang", "huong dan"], answer: "Bạn chọn sản phẩm, thêm vào giỏ, nhập thông tin nhận hàng rồi chọn phương thức thanh toán. Sau khi đặt hàng, vào mục Đơn hàng để theo dõi trạng thái." },
];

const ask = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (message.length < 2 || message.length > 500) return res.status(400).json({ success: false, message: "Câu hỏi cần từ 2 đến 500 ký tự." });

    const query = normalize(message);
    const asksIngredients = /thanh phan|ingredient/.test(query);
    const terms = query.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word.length > 2 && !["cho", "toi", "cua", "mot", "voi", "the", "nao", "giup", "shop", "san", "pham", "thanh", "phan", "gia", "ton", "kho", "con", "hang"].includes(word));
    const products = await Product.find({ isActive: true })
      .select("name description ingredients price originalPrice stock images tags")
      .limit(200).lean();
    const exactNameMatches = products.filter((product) => {
      const normalizedName = normalize(product.name).trim();
      return normalizedName.length >= 3 && query.includes(normalizedName);
    });
    const ranked = products.map((product) => {
      const searchable = normalize(`${product.name} ${product.description} ${product.ingredients} ${(product.tags || []).join(" ")}`);
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { product, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(({ product }) => product);
    const matches = (exactNameMatches.length ? exactNameMatches : ranked).slice(0, 4).map((product) => ({
      id: product._id, name: product.name, description: product.description, ingredients: product.ingredients,
      price: product.price, originalPrice: product.originalPrice, stock: product.stock, image: product.images?.[0] || "", tags: product.tags || [],
    }));

    if (asksIngredients && !exactNameMatches.length) {
      return res.json({ success: true, data: { answer: "Bạn muốn xem thành phần của sản phẩm nào? Hãy gửi đúng tên sản phẩm để mình tra cứu thông tin trong cửa hàng nhé.", products: [] } });
    }
    if (asksIngredients && exactNameMatches.length) {
      const withIngredients = exactNameMatches.map((product) => ({
        id: product._id, name: product.name, description: product.description, ingredients: product.ingredients,
        price: product.price, originalPrice: product.originalPrice, stock: product.stock, image: product.images?.[0] || "", tags: product.tags || [],
      }));
      return res.json({ success: true, data: { answer: withIngredients.some((product) => product.ingredients?.trim())
        ? "Đây là thành phần được lưu trong thông tin sản phẩm của cửa hàng:"
        : "Mình tìm thấy sản phẩm, nhưng cửa hàng chưa có dữ liệu thành phần cho sản phẩm này. Bạn có thể gửi yêu cầu cho nhân viên để được kiểm tra thêm.", products: withIngredients } });
    }
    if (matches.length && (query.includes("gia") || query.includes("ton kho") || terms.some((term) => normalize(matches[0].name).includes(term)))) {
      return res.json({ success: true, data: { answer: "Mình tìm thấy một số sản phẩm phù hợp. Giá và tình trạng còn hàng bên dưới được lấy từ dữ liệu cửa hàng:", products: matches } });
    }
    const policy = supportAnswers.find((item) => item.keys.some((key) => query.includes(key)));
    if (policy) return res.json({ success: true, data: { answer: policy.answer, products: [] } });
    if (matches.length) return res.json({ success: true, data: { answer: "Mình tìm thấy các sản phẩm có thông tin gần với câu hỏi của bạn:", products: matches } });
    return res.json({ success: true, data: { answer: "Mình chưa tìm thấy thông tin đủ chắc chắn để trả lời. Bạn có thể thử hỏi tên sản phẩm cụ thể hoặc chọn “Gặp nhân viên hỗ trợ” để gửi yêu cầu cho cửa hàng.", products: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Chatbot tạm thời chưa thể xử lý câu hỏi." });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const orderCode = String(req.params.orderCode || "").trim().toUpperCase();
    const order = await Order.findOne({ orderCode, userId: req.user._id }).select("orderCode status paymentStatus paymentMethod items createdAt").lean();
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng trong tài khoản của bạn." });
    const statuses = { pending: "Đang chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao hàng", completed: "Đã hoàn tất", cancelled: "Đã hủy" };
    const payments = { unpaid: "Chưa thanh toán", pending: "Đang xử lý", paid: "Đã thanh toán", failed: "Thanh toán thất bại", refunded: "Đã hoàn tiền" };
    res.json({ success: true, data: { orderCode: order.orderCode, status: statuses[order.status] || order.status, paymentStatus: payments[order.paymentStatus] || order.paymentStatus, itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tra cứu đơn hàng lúc này." });
  }
};

module.exports = { ask, getOrderStatus };
