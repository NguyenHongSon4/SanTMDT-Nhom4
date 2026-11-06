import React, { useState } from 'react';
import './RevenueDashboard.css';
import { Page, Product } from '../App';

interface RevenueDashboardProps {
  navigate: (target: Page, product?: Product) => void;
}

const RevenueDashboard = ({ navigate }: RevenueDashboardProps) => {
  // Bộ lọc thời gian thống kê
  const [timeRange, setTimeRange] = useState('this_month');

  // Dữ liệu mẫu thống kê doanh thu
  const statsData = {
    this_month: {
      totalRevenue: '48.500.000đ',
      totalOrders: '128',
      totalCustomers: '95',
      growthRate: '+15.2%'
    },
    last_month: {
      totalRevenue: '42.100.000đ',
      totalOrders: '110',
      totalCustomers: '82',
      growthRate: '+8.4%'
    }
  };

  const currentStats = timeRange === 'this_month' ? statsData.this_month : statsData.last_month;

  // Danh mục bán chạy
  const topCategories = [
    { name: 'Son môi & Trang điểm mắt', percentage: 45, sales: '21.800.000đ' },
    { name: 'Kem dưỡng & Skincare', percentage: 30, sales: '14.500.000đ' },
    { name: 'Mặt nạ ngủ & Chăm sóc môi', percentage: 15, sales: '7.200.000đ' },
    { name: 'Khác (Phụ kiện, dụng cụ)', percentage: 10, sales: '5.000.000đ' }
  ];

  // Top sản phẩm doanh thu cao nhất
  const topProducts = [
    { id: 1, name: 'Son dưỡng môi 3CE Blur Water Tint', sold: 45, revenue: '17.100.000đ' },
    { id: 2, name: 'Phấn nước Cushion Laneige Neo Cushion', sold: 28, revenue: '18.200.000đ' },
    { id: 3, name: 'Mặt nạ ngủ môi Laneige Lip Sleeping Mask', sold: 35, revenue: '9.800.000đ' }
  ];

  return (
    <div className="revenue-dashboard-page">
      <div className="dashboard-container">
        
        {/* Header Dashboard & Bộ lọc thời gian */}
        <div className="dashboard-header">
          <div>
            <h2 className="page-title">Dashboard Doanh Thu & Thống Kê</h2>
            <p className="page-subtitle">Tổng quan số liệu kinh doanh của hệ thống cửa hàng</p>
          </div>
          <div className="filter-box">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="this_month">Tháng này (Tháng 11/2026)</option>
              <option value="last_month">Tháng trước (Tháng 10/2026)</option>
            </select>
          </div>
        </div>

        {/* Các thẻ KPI thống kê nhanh */}
        <div className="kpi-grid">
          <div className="kpi-card revenue-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-info">
              <span className="kpi-label">Tổng Doanh Thu</span>
              <h3 className="kpi-value">{currentStats.totalRevenue}</h3>
              <span className="kpi-growth positive">So với kỳ trước {currentStats.growthRate}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-info">
              <span className="kpi-label">Tổng Đơn Hàng</span>
              <h3 className="kpi-value">{currentStats.totalOrders} đơn</h3>
              <span className="kpi-growth positive">Hoàn tất giao dịch</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-info">
              <span className="kpi-label">Khách Hàng Mới</span>
              <h3 className="kpi-value">{currentStats.totalCustomers} khách</h3>
              <span className="kpi-growth positive">Tương tác mua sắm</span>
            </div>
          </div>
        </div>

        {/* Khu vực phân tích chi tiết: Doanh thu theo danh mục & Top sản phẩm */}
        <div className="dashboard-sections-grid">
          
          {/* Tỷ trọng danh mục */}
          <div className="section-box">
            <h3>Tỷ Trọng Doanh Thu Theo Danh Mục</h3>
            <div className="category-progress-list">
              {topCategories.map((cat, index) => (
                <div className="progress-item" key={index}>
                  <div className="progress-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-sales">{cat.sales}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top sản phẩm bán chạy */}
          <div className="section-box">
            <h3>Top Sản Phẩm Doanh Thu Cao</h3>
            <div className="top-product-list">
              {topProducts.map((prod) => (
                <div className="top-product-item" key={prod.id}>
                  <div className="prod-rank">#{prod.id}</div>
                  <div className="prod-details">
                    <h4>{prod.name}</h4>
                    <p>Đã bán: <b>{prod.sold}</b> sản phẩm</p>
                  </div>
                  <div className="prod-revenue">{prod.revenue}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Nút hành động nhanh */}
        <div className="dashboard-footer-actions">
          <button className="btn-manage-orders" onClick={() => navigate("products")}>
            Quay lại trang sản phẩm
          </button>
        </div>

      </div>
    </div>
  );
};

export default RevenueDashboard;