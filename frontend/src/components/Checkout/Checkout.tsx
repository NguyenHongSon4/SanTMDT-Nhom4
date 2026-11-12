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
  const defaultItems = items.length > 0 ? items : [
    { id: 1, name: 'Serum Dưỡng Da Hetras', price: 250000, quantity: 2, image: 'https://via.placeholder.com/70' },
    { id: 2, name: 'Sữa Rửa Mặt Sạch Sâu Whisis', price: 180000, quantity: 1, image: 'https://via.placeholder.com/70' },
  ];

  const [formData, setFormData] = useState({
    fullName: 'Đinh Thị Duyên',
    phone: '0987654321',
    address: 'Trảng Bom, Đồng Nai',
    note: 'Giao giờ hành chính giúp mình nhé',
    paymentMethod: 'cod',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Kiểm tra nhanh số điện thoại
    if (name === 'phone') {
      if (value && !/^[0-9]{10,11}$/.test(value)) {
        setPhoneError('Số điện thoại không hợp lệ (phải từ 10-11 chữ số)');
      } else {
        setPhoneError('');
      }
    }
  };

  const subtotal = defaultItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 30000;
  const totalPayment = subtotal + shippingFee - discount;

  // Áp dụng mã giảm giá linh hoạt
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply !== undefined ? codeToApply : couponCode).trim().toUpperCase();
    if (code === 'SALE100K') {
      setDiscount(100000);
      setCouponMessage('✅ Áp dụng mã SALE100K thành công (-100.000 đ)');
      setCouponCode('SALE100K');
    } else if (code === 'FREESHIP') {
      setDiscount(shippingFee);
      setCouponMessage('✅ Đã áp dụng Miễn phí vận chuyển (-30.000 đ)');
      setCouponCode('FREESHIP');
    } else {
      setDiscount(0);
      setCouponMessage('❌ Mã giảm giá không tồn tại hoặc đã hết hạn!');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc!');
      return;
    }
    if (phoneError) {
      alert('Vui lòng kiểm tra lại số điện thoại nhận hàng!');
      return;
    }

    setIsSubmitting(true);

    // Giả lập độ trễ kết nối API Backend (1.2 giây)
    setTimeout(() => {
      const randomId = 'DH' + Math.floor(10000 + Math.random() * 90000);
      setOrderId(randomId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onOrderSuccess) onOrderSuccess();
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '40px', border: '1px solid #d4edda', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#28a745', marginBottom: '15px' }}>🎉 Đặt hàng thành công!</h2>
        <p style={{ color: '#555', fontSize: '16px' }}>Cảm ơn bạn đã mua hàng tại hệ thống Thương Mại Điện Tử.</p>
        <div style={{ textAlign: 'left', margin: '20px 0', padding: '20px', background: '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
          <p style={{ margin: '8px 0' }}><strong>Mã đơn hàng:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{orderId}</span></p>
          <p style={{ margin: '8px 0' }}><strong>Người nhận:</strong> {formData.fullName}</p>
          <p style={{ margin: '8px 0' }}><strong>Số điện thoại:</strong> {formData.phone}</p>
          <p style={{ margin: '8px 0' }}><strong>Địa chỉ giao:</strong> {formData.address}</p>
          <p style={{ margin: '8px 0' }}><strong>Ghi chú:</strong> {formData.note || 'Không có'}</p>
          <p style={{ margin: '8px 0' }}><strong>Phương thức thanh toán:</strong> {formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : formData.paymentMethod === 'banking' ? 'Chuyển khoản MB Bank' : 'Ví điện tử MoMo/VNPay'}</p>
          <p style={{ margin: '12px 0 0 0', borderTop: '1px dashed #ddd', paddingTop: '10px', fontSize: '16px' }}>
            <strong>Tổng thanh toán:</strong> <span style={{ color: '#e44d26', fontWeight: 'bold' }}>{totalPayment.toLocaleString('vi-VN')} VNĐ</span>
          </p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          style={{ padding: '12px 24px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '30px auto', padding: '30px', border: '1px solid #e1e1e1', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '12px', marginTop: 0, color: '#333' }}>
        🛒 Tiến Hành Thanh Toán Đơn Hàng
      </h2>

      <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px', marginTop: '20px' }}>
        {/* Cột trái: Thông tin nhận hàng và Thanh toán */}
        <div>
          <h3 style={{ fontSize: '17px', color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 1. Thông tin giao hàng
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Họ và tên người nhận *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Số điện thoại liên hệ *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: `1px solid ${phoneError ? 'red' : '#ccc'}`, borderRadius: '6px', fontSize: '14px' }}
            />
            {phoneError && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Địa chỉ nhận hàng chi tiết *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Ghi chú đơn hàng (Tùy chọn)</label>
            <textarea
              name="note"
              rows={2}
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi tới..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <h3 style={{ fontSize: '17px', color: '#333', margin: '25px 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💳 2. Phương thức thanh toán
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* COD */}
            <label style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', 
              border: formData.paymentMethod === 'cod' ? '2px solid #007bff' : '1px solid #ddd', 
              borderRadius: '8px', cursor: 'pointer',
              backgroundColor: formData.paymentMethod === 'cod' ? '#f4f8ff' : '#fff',
              transition: 'all 0.2s'
            }}>
              <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} style={{ marginTop: '3px' }} />
              <div>
                <strong style={{ display: 'block', color: '#222', fontSize: '14px' }}>Thanh toán khi nhận hàng (COD)</strong>
                <span style={{ fontSize: '13px', color: '#666' }}>Thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận hàng.</span>
              </div>
            </label>

            {/* Banking */}
            <label style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', 
              border: formData.paymentMethod === 'banking' ? '2px solid #007bff' : '1px solid #ddd', 
              borderRadius: '8px', cursor: 'pointer',
              backgroundColor: formData.paymentMethod === 'banking' ? '#f4f8ff' : '#fff',
              transition: 'all 0.2s'
            }}>
              <input type="radio" name="paymentMethod" value="banking" checked={formData.paymentMethod === 'banking'} onChange={handleInputChange} style={{ marginTop: '3px' }} />
              <div style={{ width: '100%' }}>
                <strong style={{ display: 'block', color: '#222', fontSize: '14px' }}>Chuyển khoản ngân hàng (MB Bank)</strong>
                <span style={{ fontSize: '13px', color: '#666' }}>Chuyển khoản nhanh qua số tài khoản hoặc quét mã QR.</span>
                
                {formData.paymentMethod === 'banking' && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', border: '1px dashed #007bff', borderRadius: '6px', fontSize: '13px', color: '#333' }}>
                    <p style={{ margin: '0 0 6px 0' }}>🏦 <strong>Ngân hàng TMCP Quân Đội (MB)</strong></p>
                    <p style={{ margin: '0 0 6px 0' }}>Số tài khoản: <code style={{ background: '#e9ecef', padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px' }}>1822030767</code></p>
                    <p style={{ margin: '0 0 6px 0' }}>Chủ tài khoản: <strong>ĐINH THỊ DUYÊN</strong></p>
                    <p style={{ margin: 0, color: '#e44d26', fontWeight: '500' }}>Nội dung: <code>Thanh toan {formData.phone || 'SDT'}</code></p>
                  </div>
                )}
              </div>
            </label>

            {/* Ví điện tử */}
            <label style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', 
              border: formData.paymentMethod === 'momo' ? '2px solid #007bff' : '1px solid #ddd', 
              borderRadius: '8px', cursor: 'pointer',
              backgroundColor: formData.paymentMethod === 'momo' ? '#f4f8ff' : '#fff',
              transition: 'all 0.2s'
            }}>
              <input type="radio" name="paymentMethod" value="momo" checked={formData.paymentMethod === 'momo'} onChange={handleInputChange} style={{ marginTop: '3px' }} />
              <div>
                <strong style={{ display: 'block', color: '#222', fontSize: '14px' }}>Ví điện tử MoMo / VNPay</strong>
                <span style={{ fontSize: '13px', color: '#666' }}>Thanh toán trực tuyến an toàn qua cổng ví điện tử liên kết.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Cột phải: Tổng quan giỏ hàng và Mã giảm giá */}
        <div style={{ backgroundColor: '#fcfcfc', padding: '22px', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
          <h3 style={{ fontSize: '17px', color: '#333', marginTop: 0, marginBottom: '15px' }}>
            📦 Đơn hàng của bạn ({defaultItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
          </h3>
          
          <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' }}>
            {defaultItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px', borderBottom: '1px solid #f1f1f1', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} width="45" height="45" style={{ borderRadius: '6px', objectFit: 'cover', border: '1px solid #ddd' }} />
                  <div>
                    <div style={{ fontWeight: '500', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }}>{item.name}</div>
                    <div style={{ color: '#777', fontSize: '12px' }}>SL: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#e44d26', fontSize: '14px' }}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập mã giảm giá tích hợp gợi ý nhanh */}
          <div style={{ marginBottom: '18px', borderTop: '1px solid #e1e1e1', paddingTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Mã giảm giá</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Nhập mã (VD: SALE100K)..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flex: 1, padding: '9px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                style={{ padding: '9px 14px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                Áp dụng
              </button>
            </div>
            
            {/* Gợi ý mã giảm giá nhanh cho người dùng */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>Gợi ý:</span>
              <button type="button" onClick={() => handleApplyCoupon('SALE100K')} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>SALE100K</button>
              <button type="button" onClick={() => handleApplyCoupon('FREESHIP')} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>FREESHIP</button>
            </div>

            {couponMessage && <div style={{ fontSize: '12px', marginTop: '6px', color: discount > 0 ? '#28a745' : '#dc3545', fontWeight: '500' }}>{couponMessage}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#555' }}>
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString('vi-VN')} đ</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#555' }}>
            <span>Phí vận chuyển:</span>
            <span>{shippingFee.toLocaleString('vi-VN')} đ</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745', marginBottom: '8px', fontWeight: '500' }}>
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString('vi-VN')} đ</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e1e1e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
            <span>Tổng cộng thanh toán:</span>
            <span style={{ fontSize: '20px', color: '#e44d26' }}>{totalPayment.toLocaleString('vi-VN')} đ</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
              color: '#fff',
              border: 'none',
              padding: '13px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(40,167,69,0.3)',
              transition: 'background 0.2s'
            }}
          >
            {isSubmitting ? 'Đang xử lý đơn hàng...' : '🚀 ĐẶT HÀNG NGAY'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;