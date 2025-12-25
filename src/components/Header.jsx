// src/components/Header.jsx
import React from 'react';
import { motion } from 'framer-motion';

// 1. THÊM 'categories' VÀO ĐÂY ĐỂ NHẬN DỮ LIỆU TỪ HOME
const Header = ({ activeCategory, setActiveCategory, systemConfig, categories }) => {
  
  // 2. XÓA BỎ ĐOẠN CODE KHAI BÁO CỨNG NÀY ĐI
  /* const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'food', label: 'Ăn uống 🍜' },
    { id: 'travel', label: 'Đi chơi 🚀' },
    { id: 'mood', label: 'Tâm trạng ☁️' },
  ]; 
  */

  return (
    <header>
      <motion.img 
        src={systemConfig?.avatar || "https://via.placeholder.com/150"} 
        alt="Avatar" 
        className="profile-pic"
        whileHover={{ rotate: 10, scale: 1.1 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {systemConfig?.title || "Tiêu Đề Mặc Định"}
      </motion.h1>

      <p className="bio">
        {systemConfig?.bio ? (
             systemConfig.bio.split('\n').map((str, index) => (
                <React.Fragment key={index}>
                    {str}
                    <br />
                </React.Fragment>
             ))
        ) : "Đang tải bio..."}
      </p>

      <div className="tags">
        {/* 3. BÂY GIỜ NÓ SẼ MAP DỮ LIỆU THẬT TỪ SUPABASE */}
        {categories && categories.map((cat) => (
          <motion.div
            key={cat.id}
            // Logic so sánh: activeCategory (state) === cat.id (từ DB)
            className={`tag ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}   
            layout 
          >
            {cat.label}
            
            {activeCategory === cat.id && (
              <motion.div
                className="active-bg"
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: '#e56b6f', 
                  borderRadius: '50px',
                  zIndex: -1 
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </header>
  );
};

export default Header;