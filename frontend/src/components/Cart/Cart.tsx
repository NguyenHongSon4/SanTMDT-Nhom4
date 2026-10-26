import React, { useState } from 'react';
import CartItem, { CartItemType } from './CartItem';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    { id: 1, name: 'Serum Dưỡng Da Hetras', price: 250000, quantity: 1, image: 'https://via.placeholder.com/60' },
    { id: 2, name: 'Sữa Rửa Mặt Sạch Sâu', price: 180000, quantity: 2, image: 'https://via.placeholder.com/60' },
  ]);

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const handleRemove = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '30px auto', fontFamily: 'Arial, sans-serif', background: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', color: '#333' }}>🛒 Giỏ Hàng Mỹ Phẩm</h2>
      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemove={handleRemove} 
            />
          ))}
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <h3>Tổng tiền: <span style={{ color: '#e44d26' }}>{totalPrice.toLocaleString('vi-VN')} VNĐ</span></h3>
            <button style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
              Tiến Hành Thanh Toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;