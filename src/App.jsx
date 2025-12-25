// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  // State lưu cấu hình hệ thống (Mặc định để tránh lỗi khi chưa load xong)
  const [systemConfig, setSystemConfig] = useState({
    avatar: 'https://via.placeholder.com/150', // Ảnh mặc định
    title: 'Đang tải...',
    bio: '...'
  });

  useEffect(() => {
    const fetchSystemData = async () => {
      // Lấy dữ liệu từ bảng System
      const { data, error } = await supabase.from('System').select('*');
      
      if (data) {
        // Biến đổi mảng thành object cho dễ dùng
        const config = {};
        data.forEach(item => {
          if (item.code === 'avatar') config.avatar = item.img_url;
          if (item.code === 'caption') config.title = item.text; // caption là H1
          if (item.code === 'content') config.bio = item.text;   // content là đoạn văn
        });
        
        // Cập nhật state (kết hợp với giá trị cũ để không bị mất field nào thiếu)
        setSystemConfig(prev => ({ ...prev, ...config }));
        console.log(systemConfig)
      }
    };

    fetchSystemData();
  }, []);

  return (
    <Routes>
      {/* Truyền systemConfig xuống Home */}
      <Route path="/" element={<Home systemConfig={systemConfig} />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;