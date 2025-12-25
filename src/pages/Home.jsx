// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Chỉnh lại đường dẫn import cho đúng
import Footer from '../components/Footer';
import DiaryItem from '../components/DiaryItem';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Dùng Link thay vì thẻ a

const Home = ({ systemConfig }) => {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Hàm lấy dữ liệu (Giữ nguyên logic cũ)
  const fetchData = async () => {
    setLoading(true);
    // 1. Lấy Category
    const { data: cateData } = await supabase.from('Category').select('*');
    if (cateData) {
      const formattedCates = cateData.map(c => ({ id: c.code, label: c.name, dbId: c.id }));
      setCategories([{ id: 'all', label: 'Tất cả' }, ...formattedCates]);
    }
    // 2. Lấy Blog
    const { data: blogData } = await supabase
      .from('Blog')
      .select(`*, Category (code)`)
      .order('created_at', { ascending: false });

    if (blogData) {
      const formattedEntries = blogData.map(blog => ({
        id: blog.id,
        title: blog.title,
        caption: blog.caption,
        image: blog.img_url,
        category: blog.Category?.code || 'mood',
        date: new Date(blog.created_at).toLocaleDateString('vi-VN'),
      }));
      setEntries(formattedEntries);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredEntries = activeCategory === 'all' 
    ? entries 
    : entries.filter(item => item.category === activeCategory);

  return (
    <div className="App">
      <Header systemConfig={systemConfig} activeCategory={activeCategory} setActiveCategory={setActiveCategory} categories={categories} />
      
      <main className="gallery-container">
        {loading ? <p style={{textAlign:'center', marginTop:50}}>Đang tải...</p> : (
          <AnimatePresence mode="wait">
            {filteredEntries.map(item => <DiaryItem key={item.id} item={item} />)}
          </AnimatePresence>
        )}
      </main>

      {/* Nút Admin: Giờ bấm vào sẽ chuyển sang trang /admin */}
      <Link to="/admin"> 
        <div style={{
          position: 'fixed', bottom: 20, right: 20, width: 50, height: 50, 
          background: '#e56b6f', color: '#fff', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          cursor: 'pointer', zIndex: 99, boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        }}>
          <i className="fas fa-cog"></i> {/* Đổi icon thành bánh răng cho hợp */}
        </div>
      </Link>

      <Footer />
    </div>
  );
};

export default Home;