// src/components/DiaryItem.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DiaryItem = ({ item }) => {
  // --- Cấu hình cho chuyển động "MỀM MẠI" ---
  const softSpring = {
    type: "spring",
    mass: 1,        // Khối lượng chuẩn
    damping: 35,    // Độ cản cao -> Dừng lại rất êm, ít nảy
    stiffness: 200, // Độ cứng vừa phải -> Di chuyển không quá nhanh
    velocity: 2     // Vận tốc ban đầu nhẹ
  };

  // Định nghĩa các trạng thái hình ảnh
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 50, // Bắt đầu từ vị trí thấp hơn 50px
      scale: 0.98 // Hơi nhỏ xíu thôi, đừng nhỏ quá
    },
    visible: { 
      opacity: 1, 
      y: 0, // Bay lên vị trí chuẩn
      scale: 1,
      transition: softSpring // Áp dụng cấu hình mềm mại khi xuất hiện
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" } // Biến mất nhanh và êm
    }
  };

  return (
    <motion.article 
      className="diary-item"
      // Sử dụng layout ID để Framer Motion nhận diện item khi nó di chuyển giữa các cột
      layoutId={item.id} 
      
      // Kích hoạt variants đã định nghĩa ở trên
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {item.sticker && <div className="sticker">{item.sticker}</div>}
      
      {item.image && (
        <div className="photo-frame">
          <img src={item.image} alt={item.title} style={{ display: 'block', width: '100%' }} />
        </div>
      )}

      <div className="item-content">
        <span className="date">{item.date}</span>
        <h2 className="item-title">{item.title}</h2>
        <p className="caption">{item.caption}</p>
      </div>
    </motion.article>
  );
};

export default DiaryItem;