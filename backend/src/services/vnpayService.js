const crypto = require("crypto");
const querystring = require("querystring");

const isConfigured = () => Boolean(process.env.VNP_TMN_CODE && process.env.VNP_HASH_SECRET && process.env.VNP_RETURN_URL);

const createPaymentUrl = (order, ipAddress) => {
  if (!isConfigured()) {
    const error = new Error("Thanh toán thẻ chưa được cấu hình. Vui lòng chọn chuyển khoản hoặc COD.");
    error.statusCode = 503;
    throw error;
  }
  const now = new Date();
  const date = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Amount: String(Math.round(order.total * 100)),
    vnp_CurrCode: "VND",
    vnp_TxnRef: order.orderCode,
    vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_IpAddr: (ipAddress || "127.0.0.1").replace(/^::ffff:/, "").slice(0, 45),
    vnp_CreateDate: date,
  };
  const sorted = Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
  const signData = querystring.stringify(sorted);
  const secureHash = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET).update(signData, "utf8").digest("hex");
  const baseUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  return `${baseUrl}?${signData}&vnp_SecureHash=${secureHash}`;
};

const verify = (params) => {
  if (!process.env.VNP_HASH_SECRET) return false;
  const received = params.vnp_SecureHash;
  if (!received) return false;
  const values = { ...params };
  delete values.vnp_SecureHash;
  delete values.vnp_SecureHashType;
  const sorted = Object.fromEntries(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)));
  const expected = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET).update(querystring.stringify(sorted), "utf8").digest("hex");
  const a = Buffer.from(String(received).toLowerCase(), "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { isConfigured, createPaymentUrl, verify };
