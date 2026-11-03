import React, { useState } from 'react';

export interface CheckoutItemType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutProps {
  items?: CheckoutItemType[];
  onOrderSuccess?: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items = [], onOrderSuccess }) => {
  // Dữ liệu sản phẩm mẫu (hoặc nhận từ giỏ hàng truyền sang)
  const defaultItems = items.length > 0 ? items : [
    { id: 1, name: 'Serum Dưỡng Da Hetras', price: 250000, quantity: 2, image: 'https://via.placeholder.com/70' },
    { id: 2, name: 'Sữa Rửa Mặt Sạch Sâu Whisis', price: 180000, quantity: 1, image: 'https://via.placeholder.com/70' },
  ];

  // State thông tin người nhận
  const [formData, setFormData] = useState({
    fullName: 'Đinh Thị Duyên',
    phone: '0987654321',
    address: 'Trảng Bom, Đồng Nai',
    note: 'Giao giờ hành chính giúp mình nhé',
    paymentMethod: 'cod',
  });

  // State nâng cao: Mã giảm giá & Mã đơn hàng
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Xử lý thay đổi input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tính tiền
  const subtotal = defaultItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 30000;
  const totalPayment = subtotal + shippingFee - discount;

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = () => {
    if (couponCode.trim() === 'SALE100K') {
      setDiscount(100000);
      setCouponMessage('✅ Áp dụng mã thành công (-100.000 đ)');
    } else if (couponCode.trim() === 'FREESHIP') {
      setDiscount(shippingFee);
      setCouponMessage('✅ Áp dụng mã miễn phí vận chuyển thành công!');
    } else {
      setDiscount(0);
      setCouponMessage('❌ Mã giảm giá không hợp lệ!');
    }
  };

  // Xử lý khi bấm nút đặt hàng
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    
    // Tạo mã đơn hàng ngẫu nhiên (Ví dụ: DH93821)
    const randomId = 'DH' + Math.floor(10000 + Math.random() * 90000);
    setOrderId(randomId);
    setIsSubmitted(true);
    
    if (onOrderSuccess) onOrderSuccess();
  };

  // Giao diện khi đặt hàng thành công
  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px', border: '1px solid #d4edda', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2 style={{ color: '#28a745', marginBottom: '15px' }}>🎉 Đặt hàng thành công!</h2>
        <p style={{ color: '#555', fontSize: '16px' }}>Cảm ơn bạn đã mua hàng tại hệ thống.</p>
        <div style={{ textAlign: 'left', margin: '20px 0', padding: '15px', background: '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
          <p><strong>Mã đơn hàng:</strong> <span style={{ color: '#007bff' }}>{orderId}</span></p>
          <p><strong>Người nhận:</strong> {formData.fullName}</p>
          <p><strong>Số điện thoại:</strong> {formData.phone}</p>
          <p><strong>Địa chỉ giao:</strong> {formData.address}</p>
          <p><strong>Hình thức thanh toán:</strong> {formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
          <p><strong>Tổng thanh toán:</strong> <span style={{ color: '#e44d26', fontWeight: 'bold' }}>{totalPayment.toLocaleString('vi-VN')} VNĐ</span></p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '20px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginTop: 0, color: '#333' }}>
        Thanh Toán Đơn Hàng
      </h2>

      <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        {/* Cột trái: Thông tin giao hàng & Thanh toán */}
        <div>
          <h3 style={{ fontSize: '18px', color: '#444', marginBottom: '15px' }}>1. Thông tin giao hàng</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Số điện thoại *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Địa chỉ nhận hàng *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ghi chú đơn hàng (Tùy chọn)</label>
            <textarea
              name="note"
              rows={2}
              value={formData.note}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <h3 style={{ fontSize: '18px', color: '#444', margin: '20px 0 15px 0' }}>2. Phương thức thanh toán</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleInputChange}
              />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="banking"
                checked={formData.paymentMethod === 'banking'}
                onChange={handleInputChange}
              />
              Chuyển khoản ngân hàng (MB / Vietcombank)
            </label>
          </div>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng & Mã giảm giá */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', color: '#444', marginTop: 0, marginBottom: '15px' }}>Đơn hàng của bạn ({defaultItems.length} sản phẩm)</h3>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' }}>
            {defaultItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} width="45" height="45" style={{ borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '500', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ color: '#888' }}>SL: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#e44d26' }}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập mã giảm giá (Mã gợi ý: SALE100K hoặc FREESHIP) */}
          <div style={{ marginBottom: '15px', borderTop: '1px solid #ddd', paddingTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>Mã giảm giá (Gợi ý: SALE100K)</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                placeholder="Nhập mã..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                style={{ padding: '8px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                Áp dụng
              </button>
            </div>
            {couponMessage && <div style={{ fontSize: '12px', marginTop: '5px', color: discount > 0 ? 'green' : 'red' }}>{couponMessage}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString('vi-VN')} đ</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
            <span>Phí vận chuyển:</span>
            <span>{shippingFee.toLocaleString('vi-VN')} đ</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'green', marginBottom: '8px' }}>
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString('vi-VN')} đ</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #ddd', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
            <span>Tổng cộng:</span>
            <span style={{ fontSize: '20px', color: '#e44d26' }}>{totalPayment.toLocaleString('vi-VN')} đ</span>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ĐẶT HÀNG NGAY
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;