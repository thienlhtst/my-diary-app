// src/components/AdminPanel.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient'; // Import supabase

const AdminPanel = ({ onClose, existingTags, onSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // State form
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTagCode, setSelectedTagCode] = useState(existingTags[0]?.id || ''); // Lưu code (food)
  
  // State upload ảnh
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleLogin = () => {
    if (password === '123456') setIsAuthenticated(true);
    else alert('Sai mật khẩu!');
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let publicUrl = null;

      // 1. Upload ảnh nếu có chọn file
      if (imageFile) {
        // Tạo tên file ngẫu nhiên để không bị trùng: timestamp-tenfile
        const fileName = `${Date.now()}-${imageFile.name}`;
        
        const { data, error } = await supabase.storage
          .from('blog_image') // Tên bucket của bạn
          .upload(fileName, imageFile);

        if (error) throw error;

        // Lấy link public
        const { data: urlData } = supabase.storage
          .from('blog_image')
          .getPublicUrl(fileName);
          
        publicUrl = urlData.publicUrl;
      }

      // 2. Tìm id thực (số) của category dựa trên code (food, travel...)
      // Lưu ý: existingTags ở App truyền xuống cần có field dbId mà ta đã map ở bước 1
      const selectedCategoryObj = existingTags.find(t => t.id === selectedTagCode);
      const categoryDbId = selectedCategoryObj ? selectedCategoryObj.dbId : null;

      if (!categoryDbId) {
        alert("Lỗi: Không tìm thấy ID danh mục trong DB");
        setUploading(false);
        return;
      }

      // 3. Insert vào bảng Blog
      const { error: insertError } = await supabase
        .from('Blog')
        .insert([{
          title: title,
          caption: caption,
          img_url: publicUrl,
          id_category: categoryDbId, // Cần ID số (FK)
          // created_at tự động sinh
        }]);

      if (insertError) throw insertError;

      alert('Đã đăng bài thành công! 🎉');
      onSuccess(); // Gọi hàm refresh dữ liệu bên App
      onClose();   // Đóng admin panel

    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div className="admin-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="admin-box">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {!isAuthenticated ? (
          <div className="login-screen">
            <h2>Khu Vực Bí Mật 🔒</h2>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="******" />
            <button className="primary-btn" onClick={handleLogin}>Mở Cửa</button>
          </div>
        ) : (
          <div className="panel-content">
            <h2>📝 Viết Nhật Ký Mới</h2>
            <form onSubmit={handleSubmitEntry} className="admin-form">
              
              <input 
                type="text" placeholder="Tiêu đề..." required
                value={title} onChange={e => setTitle(e.target.value)}
              />
              
              <div className="row">
                <select 
                  value={selectedTagCode}
                  onChange={e => setSelectedTagCode(e.target.value)}
                >
                  {existingTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.label}</option>
                  ))}
                </select>
              </div>

              {/* INPUT FILE THAY VÌ TEXT URL */}
              <div style={{marginBottom: 15}}>
                <label style={{fontSize: '0.9rem', color: '#666'}}>Chọn ảnh bìa:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  style={{border: 'none', padding: '10px 0'}}
                />
              </div>
              
              <textarea 
                placeholder="Nội dung tâm sự..." rows="4" required
                value={caption} onChange={e => setCaption(e.target.value)}
              ></textarea>

              <button type="submit" className="primary-btn" disabled={uploading}>
                {uploading ? 'Đang tải lên... 🚀' : 'Đăng Bài'}
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;