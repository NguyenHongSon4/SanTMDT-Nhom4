import React from 'react';

export interface CartItemType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
      <img src={item.image} alt={item.name} width="60" style={{ borderRadius: '8px', objectFit: 'cover' }} />
      <div style={{ flex: 1, marginLeft: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
        <p style={{ margin: 0, color: '#e44d26', fontWeight: 'bold' }}>{item.price.toLocaleString('vi-VN')} VNĐ</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ padding: '2px 8px', cursor: 'pointer' }}>-</button>
        <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ padding: '2px 8px', cursor: 'pointer' }}>+</button>
      </div>
      <button onClick={() => onRemove(item.id)} style={{ marginLeft: '20px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>
    </div>
  );
};

export default CartItem;