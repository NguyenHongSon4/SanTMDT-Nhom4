import React, { useState } from 'react';
import './OrderHistory.css';
import { Page, Product } from '../App';

interface OrderHistoryProps {
  navigate: (target: Page, product?: Product) => void;
}

const OrderHistory = ({ navigate }: OrderHistoryProps) => {
  const [activeTab, setActiveTab] = useState('ALL');

  // Quản lý danh sách đơn hàng bằng state
  const [orders, setOrders] = useState([
    {
      id: 'DH001',
      date: '03/11/2026',
      status: 'Chờ xác nhận',
      items: [
        { 
          name: 'Son dưỡng môi 3CE Blur Water Tint', 
          type: 'Màu #Casual Affair', 
          quantity: 1, 
          price: '380.000đ', 
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=150&q=80' 
        }
      ],
      total: '380.000đ'
    },
    {
      id: 'DH002',
      date: '25/10/2026',
      status: 'Đã giao',
      items: [
        { 
          name: 'Phấn nước Cushion Laneige Neo Cushion Matte', 
          type: 'Tone 21N (Da sáng)', 
          quantity: 1, 
          price: '650.000đ', 
          image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=150&q=80' 
        }
      ],
      total: '650.000đ'
    },
    {
      id: 'DH003',
      date: '15/10/2026',
      status: 'Đã hủy',
      items: [
        { 
          name: 'Mặt nạ ngủ môi Laneige Lip Sleeping Mask', 
          type: 'Hương quả mọng 20g', 
          quantity: 1, 
          price: '280.000đ', 
          image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=150&q=80' 
        }
      ],
      total: '280.000đ'
    }
  ]);

  // LOGIC NÚT HỦY ĐƠN HÀNG
  const handleCancelOrder = (orderId: string) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId} không?`);
    if (confirmCancel) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'Đã hủy' } : order
        )
      );
    }
  };

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <h2 className="page-title">Lịch Sử Đơn Hàng</h2>
        
        <div className="order-tabs">
          <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Tất cả</button>
          <button className={`tab-btn ${activeTab === 'Chờ xác nhận' ? 'active' : ''}`} onClick={() => setActiveTab('Chờ xác nhận')}>Chờ xác nhận</button>
          <button className={`tab-btn ${activeTab === 'Đang giao' ? 'active' : ''}`} onClick={() => setActiveTab('Đang giao')}>Đang giao</button>
          <button className={`tab-btn ${activeTab === 'Đã giao' ? 'active' : ''}`} onClick={() => setActiveTab('Đã giao')}>Đã giao</button>
          <button className={`tab-btn ${activeTab === 'Đã hủy' ? 'active' : ''}`} onClick={() => setActiveTab('Đã hủy')}>Đã hủy</button>
        </div>

        <div className="order-list">
          {filteredOrders.length === 0 ? (
            <div className="no-order-box">
              <p>Chưa có đơn hàng nào trong mục này.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Mã đơn: <b>{order.id}</b></span>
                    <span className="order-date">Ngày mua: {order.date}</span>
                  </div>
                  <span className={`order-status status-${
                    order.status === 'Đang giao' ? 'shipping' 
                    : order.status === 'Đã giao' ? 'success' 
                    : order.status === 'Chờ xác nhận' ? 'pending' 
                    : 'cancel'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-body">
                  {order.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <img src={item.image} alt={item.name} className="item-img" />
                      <div className="item-info">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-type">Phân loại: {item.type}</p>
                        <p className="item-quantity">x{item.quantity}</p>
                      </div>
                      <div className="item-price">{item.price}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="total-container">
                    <span className="total-label">Thành tiền: </span>
                    <span className="total-value">{order.total}</span>
                  </div>
                  <div className="action-buttons">
                    {/* NÚT HỦY ĐƠN HÀNG: Chỉ xuất hiện khi trạng thái là 'Chờ xác nhận' */}
                    {order.status === 'Chờ xác nhận' && (
                      <button 
                        className="btn btn-cancel-order" 
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    <button className="btn btn-detail" onClick={() => navigate("home")}>Xem chi tiết</button>
                    <button className="btn btn-buy-again" onClick={() => navigate("products")}>Mua lại</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;