import React, { useState } from 'react';
import './ProductReview.css';
import { Page, Product } from '../App';

interface ProductReviewProps {
  navigate: (target: Page, product?: Product) => void;
}

interface ReviewItem {
  id: number;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  productType: string;
}

const ProductReview = ({ navigate }: ProductReviewProps) => {
  // Dữ liệu mẫu các đánh giá sản phẩm
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 1,
      userName: 'Đinh Thị Duyên',
      rating: 5,
      date: '04/11/2026',
      comment: 'Son màu lên môi cực kỳ tôn da, chất son mịn và không bị khô môi. Giao hàng nhanh và đóng gói rất cẩn thận!',
      productType: 'Màu #Casual Affair'
    },
    {
      id: 2,
      userName: 'Nguyễn Văn Minh',
      rating: 4,
      date: '01/11/2026',
      comment: 'Sản phẩm dùng ổn trong tầm giá, giữ màu được khoảng 4-5 tiếng nếu không ăn uống nhiều.',
      productType: 'Màu #Persistence'
    }
  ]);

  // State quản lý form viết đánh giá mới
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [productType, setProductType] = useState<string>('Màu #Casual Affair');

  // Hàm xử lý khi gửi đánh giá mới
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá của bạn!');
      return;
    }

    const newReviewObj: ReviewItem = {
      id: Date.now(),
      userName: 'Đinh Thị Duyên', // Lấy tên người dùng hiện tại
      rating: newRating,
      date: new Date().toLocaleDateString('vi-VN'),
      comment: newComment,
      productType: productType
    };

    setReviews([newReviewObj, ...reviews]);
    setNewComment('');
    alert('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
  };

  return (
    <div className="product-review-page">
      <div className="review-container">
        <h2 className="page-title">Đánh Giá & Nhận Xét Sản Phẩm</h2>

        {/* Tổng quan đánh giá */}
        <div className="review-summary-box">
          <div className="average-score">
            <span className="score-number">4.5</span>
            <span className="score-max">/5</span>
            <div className="stars-lg">★★★★★</div>
            <p className="total-reviews-count">Dựa trên {reviews.length + 12} lượt đánh giá của khách hàng</p>
          </div>
          <div className="review-actions-top">
            <button className="btn-back-shop" onClick={() => navigate("products")}>
              Quay lại mua sắm
            </button>
          </div>
        </div>

        {/* Form viết đánh giá mới */}
        <div className="write-review-section">
          <h3>Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Chọn số sao:</label>
              <select 
                value={newRating} 
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="select-rating"
              >
                <option value={5}>★★★★★ (5/5 - Tuyệt vời)</option>
                <option value={4}>★★★★☆ (4/5 - Hài lòng)</option>
                <option value={3}>★★★☆☆ (3/5 - Bình thường)</option>
                <option value={2}>★★☆☆☆ (2/5 - Tạm được)</option>
                <option value={1}>★☆☆☆☆ (1/5 - Không hài lòng)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Phân loại đã mua:</label>
              <input 
                type="text" 
                value={productType} 
                onChange={(e) => setProductType(e.target.value)}
                className="input-type"
                placeholder="Ví dụ: Màu #Casual Affair"
              />
            </div>

            <div className="form-group">
              <label>Nhận xét chi tiết:</label>
              <textarea 
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng sản phẩm nhé..."
                className="textarea-comment"
              ></textarea>
            </div>

            <button type="submit" className="btn-submit-review">
              Gửi Đánh Giá
            </button>
          </form>
        </div>

        {/* Danh sách các đánh giá hiện có */}
        <div className="review-list-section">
          <h3>Đánh giá từ khách hàng ({reviews.length})</h3>
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <span className="reviewer-name">{review.userName}</span>
                <span className="review-date">{review.date}</span>
              </div>
              <div className="review-stars">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                <span className="reviewed-type">Phân loại: {review.productType}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReview;