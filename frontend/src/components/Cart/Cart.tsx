import React, { useState } from 'react';
import CartItem, { CartItemType } from './CartItem';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    {
      id: 1,
      name: 'Serum Dưỡng Da Hetras',
      price: 250000,
      quantity: 2,
      image: 'https://via.placeholder.com/70',
      selected: true,
    },
    {
      id: 2,
      name: 'Sữa Rửa Mặt Sạch Sâu Whisis',
      price: 180000,
      quantity: 1,
      image: 'https://via.placeholder.com/70',
      selected: true,
    },
    {
      id: 3,
      name: 'Son Thỏi YSL Cao Cấp',
      price: 850000,
      quantity: 1,
      image: 'https://via.placeholder.com/70',
      selected: false,
    },
  ]);

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleClearSelected = () => {
    const selectedCount = cartItems.filter((i) => i.selected).length;
    if (selectedCount === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để xóa!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCount} sản phẩm đã chọn?`)) {
      setCartItems((prev) => prev.filter((item) => !item.selected));
    }
  };

  const handleToggleSelect = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const handleSelectAll = () => {
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !isAllSelected }))
    );
  };

  const totalPrice = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2 style={{ color: '#555' }}>Giỏ hàng của bạn đang trống!</h2>
        <p style={{ color: '#888' }}>Hãy chọn thêm sản phẩm để tiếp tục mua sắm nhé.</p>
        <button
          onClick={() => setCartItems([
            { id: 1, name: 'Serum Dưỡng Da Hetras', price: 250000, quantity: 1, image: 'https://via.placeholder.com/70', selected: true }
          ])}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Tiếp tục mua hàng
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginTop: 0 }}>
        Giỏ Hàng Của Bạn
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            style={{ width: '18px', height: '18px' }}
          />
          Chọn tất cả ({cartItems.length} sản phẩm)
        </label>

        <button
          onClick={handleClearSelected}
          style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Xóa các mục đã chọn
        </button>
      </div>

      <div style={{ margin: '15px 0' }}>
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #eee' }}>
        <div>
          <span style={{ fontSize: '16px' }}>Tổng thanh toán: </span>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#e44d26', marginLeft: '10px' }}>
            {totalPrice.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
        <button
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          MUA HÀNG
        </button>
      </div>
    </div>
  );
};

export default Cart;