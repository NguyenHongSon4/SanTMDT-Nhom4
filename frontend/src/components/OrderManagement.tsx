import React, { useState } from 'react';
import './OrderManagement.css';
import { Page, Product } from '../App';

interface OrderManagementProps {
  navigate: (target: Page, product?: Product) => void;
}

interface OrderItem {
  name: string;
  type: string;
  quantity: number;
  price: string;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: string;
}

const OrderManagement = ({ navigate }: OrderManagementProps) => {
  const [activeTab, setActiveTab] = useState('ALL');

  // Dữ liệu mẫu danh sách đơn hàng hệ thống
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'DH001',
      customerName: 'Đinh Thị Duyên',
      phone: '0987654321',
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
      customerName: 'Nguyễn Văn A',
      phone: '0912345678',
      date: '25/10/2026',
      status: 'Đang giao',
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
      customerName: 'Trần Thị B',
      phone: '0933445566',
      date: '15/10/2026',
      status: 'Đã giao',
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

  // Hàm chuyển trạng thái đơn hàng (Dành cho Admin/Người bán)
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Lọc đơn hàng theo tab
  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div className="order-management-page">
      <div className="management-container">
        <h2 className="page-title">Quản Lý Đơn Hàng (Admin / Người Bán)</h2>
        
        {/* Thanh Tabs trạng thái */}
        <div className="order-tabs">
          {['ALL', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'].map((tab) => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ALL' ? 'Tất cả đơn' : tab}
            </button>
          ))}
        </div>

        {/* Danh sách quản lý đơn hàng */}
        <div className="management-list">
          {filteredOrders.length === 0 ? (
            <div className="no-order-box">
              <p>Không có đơn hàng nào ở trạng thái này.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div className="management-card" key={order.id}>
                {/* Header đơn hàng */}
                <div className="card-header">
                  <div>
                    <span className="order-id">Mã đơn: <b>{order.id}</b></span>
                    <span className="customer-info"> | Khách hàng: <b>{order.customerName}</b> ({order.phone})</span>
                    <span className="order-date"> - Ngày đặt: {order.date}</span>
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

                {/* Danh sách sản phẩm trong đơn */}
                <div className="card-body">
                  {order.items.map((item, index) => (
                    <div className="item-row" key={index}>
                      <img src={item.image} alt={item.name} className="manage-img" />
                      <div className="manage-item-info">
                        <h4>{item.name}</h4>
                        <p>Phân loại: {item.type} | Số lượng: {item.quantity}</p>
                      </div>
                      <div className="manage-price">{item.price}</div>
                    </div>
                  ))}
                </div>

                {/* Footer quản lý & Nút thao tác Admin */}
                <div className="card-footer">
                  <div className="total-box">
                    Tổng tiền thu: <span className="total-highlight">{order.total}</span>
                  </div>
                  <div className="admin-actions">
                    {order.status === 'Chờ xác nhận' && (
                      <>
                        <button 
                          className="btn-action btn-confirm" 
                          onClick={() => handleUpdateStatus(order.id, 'Đang giao')}
                        >
                          Xác nhận & Giao hàng
                        </button>
                        <button 
                          className="btn-action btn-cancel" 
                          onClick={() => handleUpdateStatus(order.id, 'Đã hủy')}
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {order.status === 'Đang giao' && (
                      <button 
                        className="btn-action btn-success" 
                        onClick={() => handleUpdateStatus(order.id, 'Đã giao')}
                      >
                        Đánh dấu Đã giao thành công
                      </button>
                    )}
                    <span className="status-note">
                      {order.status === 'Đã giao' && 'Đơn hàng đã hoàn tất.'}
                      {order.status === 'Đã hủy' && 'Đơn hàng đã bị hủy.'}
                    </span>
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

export default OrderManagement;