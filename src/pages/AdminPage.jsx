import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Tab active: 'post' | 'category' | 'system'
  const [activeTab, setActiveTab] = useState('post');

  // --- DATA STATES ---
  const [categories, setCategories] = useState([]);
  
  // Form Post
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');

  // Form System
  const [sysTitle, setSysTitle] = useState('');
  const [sysBio, setSysBio] = useState('');
  const [sysAvatarFile, setSysAvatarFile] = useState(null);
  const [sysAvatarPreview, setSysAvatarPreview] = useState(null);

  // --- FETCH DATA ---
  const fetchInitData = async () => {
    // Categories
    const { data: catData } = await supabase.from('Category').select('*');
    if (catData) {
      setCategories(catData);
      if(catData.length > 0 && !categoryId) setCategoryId(catData[0].id);
    }
    // System
    const { data: sysData } = await supabase.from('System').select('*');
    if (sysData) {
      sysData.forEach(item => {
        if (item.code === 'caption') setSysTitle(item.text);
        if (item.code === 'content') setSysBio(item.text);
        if (item.code === 'avatar') setSysAvatarPreview(item.img_url); // Hiện avatar cũ
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchInitData();
  }, [isAuthenticated]);

  // --- HANDLERS ---
  const handleLogin = () => {
    if (password === '123456') setIsAuthenticated(true);
    else alert('Sai mật khẩu!');
  };

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 1. Đăng bài
  const handlePostBlog = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let publicUrl = null;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error: upErr } = await supabase.storage.from('blog_image').upload(fileName, imageFile);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('blog_image').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      await supabase.from('Blog').insert([{
        title, caption, img_url: publicUrl, id_category: categoryId
      }]);

      alert('Đã đăng bài thành công! 🎉');
      // Reset form
      setTitle(''); setCaption(''); setImageFile(null); setPreviewUrl(null);
    } catch (err) { alert(err.message); } 
    finally { setUploading(false); }
  };

  // 2. Tạo Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('Category').insert([{ name: newCatName, code: newCatCode }]);
      alert('Thêm category thành công!');
      setNewCatName(''); setNewCatCode('');
      fetchInitData();
    } catch (err) { alert(err.message); }
  };

  // 3. Update System
  const handleUpdateSystem = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await supabase.from('System').update({ text: sysTitle }).eq('code', 'caption');
      await supabase.from('System').update({ text: sysBio }).eq('code', 'content');
      
      if (sysAvatarFile) {
        const fileName = `avatar-${Date.now()}`;
        await supabase.storage.from('blog_image').upload(fileName, sysAvatarFile);
        const { data } = supabase.storage.from('blog_image').getPublicUrl(fileName);
        await supabase.from('System').update({ img_url: data.publicUrl }).eq('code', 'avatar');
      }
      alert('Đã cập nhật giao diện! 💅');
    } catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fdfbf7'}}>
      <div style={{background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', textAlign: 'center'}}>
        <h2 style={{color: '#e56b6f', marginBottom: '20px', fontFamily: 'Patrick Hand', fontSize: '2.5rem'}}>Admin Access 🔒</h2>
        <input 
          type="password" 
          value={password} onChange={e=>setPassword(e.target.value)} 
          placeholder="Password..."
          style={{padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1.2rem', marginBottom: '20px', width: '100%'}}
        />
        <button onClick={handleLogin} className="btn-primary" style={{width: '100%'}}>Vào Nhà</button>
      </div>
    </div>
  );

  // --- RENDER DASHBOARD ---
  return (
    <div className="dashboard-container">
      
      {/* 1. SIDEBAR */}
      <div className="sidebar">
        <div className="logo-area" onClick={() => navigate('/')}>
          <i className="fas fa-book-open"></i>
          <span>My Diary</span>
        </div>

        <div className={`menu-item ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
          <i className="fas fa-pen-fancy"></i>
          <span>Viết Nhật Ký</span>
        </div>

        <div className={`menu-item ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>
          <i className="fas fa-tags"></i>
          <span>Quản Lý Tags</span>
        </div>

        <div className={`menu-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
          <i className="fas fa-cog"></i>
          <span>Cấu Hình Web</span>
        </div>

        <div className="menu-item logout-btn" onClick={() => navigate('/')}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Về Trang Chủ</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="main-content">
        
        {/* --- TAB: VIẾT BÀI --- */}
        {activeTab === 'post' && (
          <div>
            <div className="page-header">
              <h2>Viết Nhật Ký Mới ✍️</h2>
              <p>Hôm nay bạn muốn chia sẻ điều gì?</p>
            </div>

            <form className="dashboard-card" onSubmit={handlePostBlog}>
              <div className="input-group">
                <label className="label">Tiêu đề bài viết</label>
                <input className="inp" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nhập tiêu đề..." required />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="label">Chủ đề</label>
                  <select className="inp" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label" style={{ marginBottom: '3.4%' }}>Ảnh bìa</label>
                  <input type="file" id="imgUpload" hidden accept="image/*" onChange={(e)=>handleImageChange(e, setImageFile, setPreviewUrl)} />
                  <label  htmlFor="imgUpload" className="inp" style={{cursor: 'pointer', textAlign: 'center', color: '#666'}}>
                    <i className="fas fa-cloud-upload-alt"></i> Chọn ảnh
                  </label>
                </div>
              </div>

              {previewUrl && (
                <div className="input-group">
                   <div className="preview-box">
                      <img src={previewUrl} alt="Preview" />
                   </div>
                </div>
              )}

              <div className="input-group">
                <label className="label">Nội dung</label>
                <textarea className="inp" rows="6" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Viết gì đó..." required></textarea>
              </div>

              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Đang đăng...' : 'Đăng Bài Ngay'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB: CATEGORY --- */}
        {activeTab === 'category' && (
          <div>
             <div className="page-header">
              <h2>Quản Lý Danh Mục 🏷️</h2>
              <p>Thêm các chủ đề mới cho blog của bạn</p>
            </div>

            <div className="dashboard-card">
              <div className="grid-2">
                {/* Form thêm */}
                <div>
                  <h3 style={{marginBottom: '15px', color: 'var(--accent)'}}>Thêm Mới</h3>
                  <form onSubmit={handleCreateCategory}>
                    <div className="input-group">
                      <label className="label">Tên hiển thị</label>
                      <input className="inp" placeholder="Vd: Nhạc Hay" value={newCatName} onChange={e=>setNewCatName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label className="label">Mã Code (viết liền)</label>
                      <input className="inp" placeholder="Vd: music" value={newCatCode} onChange={e=>setNewCatCode(e.target.value)} required />
                    </div>
                    <button className="btn-primary">Thêm Tag</button>
                  </form>
                </div>

                {/* Danh sách hiện có */}
                <div style={{borderLeft: '1px solid #eee', paddingLeft: '20px'}}>
                  <h3 style={{marginBottom: '15px', color: '#555'}}>Danh sách hiện có</h3>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    {categories.map(c => (
                      <span key={c.id} style={{padding: '8px 15px', background: '#fff0f1', color: 'var(--accent)', borderRadius: '20px', fontWeight: 'bold'}}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: SYSTEM --- */}
        {activeTab === 'system' && (
          <div>
             <div className="page-header">
              <h2>Cấu Hình Hệ Thống ⚙️</h2>
              <p>Thay đổi giao diện trang chủ</p>
            </div>

            <form className="dashboard-card" onSubmit={handleUpdateSystem}>
               <div className="input-group" style={{textAlign: 'center'}}>
                  <div className="preview-box" style={{width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 15px'}}>
                     {sysAvatarPreview ? <img src={sysAvatarPreview} /> : <span className="preview-text">No Avatar</span>}
                  </div>
                  <input type="file" id="sysAvatar" hidden onChange={(e)=>handleImageChange(e, setSysAvatarFile, setSysAvatarPreview)} />
                  <label htmlFor="sysAvatar" style={{color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold'}}>
                     <i className="fas fa-camera"></i> Đổi Avatar
                  </label>
               </div>

               <div className="input-group">
                  <label className="label">Tiêu đề Website (H1)</label>
                  <input className="inp" value={sysTitle} onChange={e=>setSysTitle(e.target.value)} />
               </div>

               <div className="input-group">
                  <label className="label">Giới thiệu bản thân (Bio)</label>
                  <textarea className="inp" rows="4" value={sysBio} onChange={e=>setSysBio(e.target.value)}></textarea>
               </div>

               <button className="btn-primary" disabled={uploading}>
                 {uploading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
               </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;