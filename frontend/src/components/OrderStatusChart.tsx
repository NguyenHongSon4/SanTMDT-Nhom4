import React, { useState } from 'react';
import './OrderStatusChart.css';
import { Page, Product } from '../App';

interface OrderStatusChartProps {
  navigate: (target: Page, product?: Product) => void;
}

const OrderStatusChart = ({ navigate }: OrderStatusChartProps) => {
  // Bộ lọc thời gian thống kê
  const [timeFilter, setTimeFilter] = useState('month');

  // Dữ liệu giả lập các trạng thái đơn hàng (Tổng số: 120 đơn)
  const orderStats = [
    { 
      status: 'Chờ xác nhận', 
      count: 18, 
      percentage: 15, 
      color: '#ff9800', 
      desc: 'Đơn hàng mới đặt, đang chờ duyệt từ kho' 
    },
    { 
      status: 'Đang giao', 
      count: 36, 
      percentage: 30, 
      color: '#03a9f4', 
      desc: 'Đang vận chuyển cho đơn vị giao hàng' 
    },
    { 
      status: 'Đã giao thành công', 
      count: 54, 
      percentage: 45, 
      color: '#4caf50', 
      desc: 'Khách đã nhận hàng và thanh toán' 
    },
    { 
      status: 'Đã hủy', 
      count: 12, 
      percentage: 10, 
      color: '#f44336', 
      desc: 'Đơn bị hủy bởi khách hoặc cửa hàng' 
    }
  ];

  const totalOrders = orderStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="order-status-chart-page">
      <div className="chart-container">
        
        {/* Header & Bộ lọc */}
        <div className="chart-header">
          <div>
            <h2 className="page-title">Biểu Đồ Thống Kê Đơn Hàng Theo Trạng Thái</h2>
            <p className="page-subtitle">Phân tích tỷ lệ và số lượng đơn hàng qua các trạng thái xử lý</p>
          </div>
          <div className="filter-group">
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="time-select-box"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này (11/2026)</option>
              <option value="year">Năm 2026</option>
            </select>
          </div>
        </div>

        {/* Tổng quan chỉ số */}
        <div className="overview-banner">
          <div className="overview-item">
            <span className="overview-label">Tổng số đơn hàng</span>
            <h3 className="overview-value">{totalOrders} đơn</h3>
          </div>
          <div className="overview-item">
            <span className="overview-label">Tỷ lệ thành công</span>
            <h3 className="overview-value success-text">45%</h3>
          </div>
          <div className="overview-item">
            <span className="overview-label">Tỷ lệ hủy đơn</span>
            <h3 className="overview-value danger-text">10%</h3>
          </div>
        </div>

        {/* Khu vực Biểu đồ thanh (Bar Chart Progress) */}
        <div className="chart-content-box">
          <h3>Chi tiết phân bổ trạng thái đơn hàng</h3>
          <div className="bars-list">
            {orderStats.map((item, index) => (
              <div className="status-bar-row" key={index}>
                <div className="row-info-top">
                  <span className="status-name" style={{ borderLeftColor: item.color }}>
                    {item.status}
                  </span>
                  <span className="status-numbers">
                    <b>{item.count}</b> đơn ({item.percentage}%)
                  </span>
                </div>
                
                {/* Thanh biểu đồ ngang */}
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${item.percentage}%`, 
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
                <p className="status-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nút điều hướng quay lại */}
        <div className="chart-footer">
          <button className="btn-back-manage" onClick={() => navigate("products")}>
            Quay lại trang sản phẩm
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderStatusChart;