import React, { useState } from 'react';
import './InventoryDashboard.css';
import { Page, Product } from '../App';

interface InventoryDashboardProps {
  navigate: (target: Page, product?: Product) => void;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  type: string;
  stock: number;
  sold: number;
  image: string;
}

const InventoryDashboard = ({ navigate }: InventoryDashboardProps) => {
  // Danh sách dữ liệu kho hàng & sản phẩm bán chạy
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    {
      id: 1,
      name: 'Son dưỡng môi 3CE Blur Water Tint',
      category: 'Son môi & Trang điểm',
      type: 'Màu #Casual Affair',
      stock: 12, // Dưới 15 là cảnh báo sắp hết
      sold: 45,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      name: 'Phấn nước Cushion Laneige Neo Cushion Matte',
      category: 'Trang điểm mặt',
      type: 'Tone 21N (Da sáng)',
      stock: 5,
      sold: 28,
      image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      name: 'Mặt nạ ngủ môi Laneige Lip Sleeping Mask',
      category: 'Skincare & Chăm sóc',
      type: 'Hương quả mọng 20g',
      stock: 40,
      sold: 35,
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 4,
      name: 'Kẻ mắt nước chống trôi Merzy The First Pen Eyeliner',
      category: 'Trang điểm mắt',
      type: 'Màu P1. Black',
      stock: 3,
      sold: 52,
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  // Hàm tăng số lượng tồn kho (Nhập thêm hàng)
  const handleRestock = (id: number) => {
    setInventoryList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, stock: item.stock + 20 } : item
      )
    );
  };

  return (
    <div className="inventory-dashboard-page">
      <div className="inventory-container">
        
        {/* Header */}
        <div className="inventory-header">
          <div>
            <h2 className="page-title">Quản Lý Tồn Kho & Sản Phẩm Bán Chạy</h2>
            <p className="page-subtitle">Theo dõi số lượng hàng hóa trong kho và tiến độ tiêu thụ</p>
          </div>
          <button className="btn-back" onClick={() => navigate("products")}>
            Về trang sản phẩm
          </button>
        </div>

        {/* Thống kê nhanh trạng thái kho */}
        <div className="inventory-stats-grid">
          <div className="inv-stat-card">
            <span className="stat-label">Tổng sản phẩm quản lý</span>
            <h3 className="stat-num">{inventoryList.length} dòng hàng</h3>
          </div>
          <div className="inv-stat-card warning">
            <span className="stat-label">Sản phẩm sắp hết kho (&lt; 15)</span>
            <h3 className="stat-num">
              {inventoryList.filter(i => i.stock < 15).length} sản phẩm
            </h3>
          </div>
          <div className="inv-stat-card success">
            <span className="stat-label">Tổng lượng đã bán ra</span>
            <h3 className="stat-num">
              {inventoryList.reduce((acc, curr) => acc + curr.sold, 0)} sản phẩm
            </h3>
          </div>
        </div>

        {/* Bảng danh sách tồn kho chi tiết */}
        <div className="inventory-table-box">
          <h3>Chi Tiết Kho Hàng & Trạng Thái</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Phân loại</th>
                <th>Đã bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item) => {
                let statusBadge = <span className="badge-ok">Còn hàng</span>;
                if (item.stock === 0) {
                  statusBadge = <span className="badge-out">Hết hàng</span>;
                } else if (item.stock < 15) {
                  statusBadge = <span className="badge-low">Sắp hết</span>;
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="product-info-cell">
                        <img src={item.image} alt={item.name} className="table-thumb" />
                        <div>
                          <span className="table-prod-name">{item.name}</span>
                          <span className="table-cat">{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td><b>{item.sold}</b> cái</td>
                    <td><b className={item.stock < 15 ? 'text-danger' : ''}>{item.stock}</b> cái</td>
                    <td>{statusBadge}</td>
                    <td>
                      <button 
                        className="btn-restock" 
                        onClick={() => handleRestock(item.id)}
                      >
                        Nhập thêm hàng (+20)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default InventoryDashboard;