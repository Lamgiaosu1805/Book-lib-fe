'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useDialog } from '@/app/components/Dialog';

export default function AddBook({ onSuccess }: { onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // State form
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(''); // Lưu tên category được chọn
    const [publishedYear, setPublishedYear] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState('true');
    const [price, setPrice] = useState('');
    const { alert, success, error, dialog } = useDialog();

    // State lưu danh sách Category để map ra Select
    const [categories, setCategories] = useState<any[]>([]);

    const getToken = () => {
        const name = "token=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "";
    };

    // ✅ NẠP DANH SÁCH DANH MỤC LÚC MỚI VÀO TAB
    useEffect(() => {
        const fetchCategories = async () => {
            const token = getToken();
            if (!token) return;
            try {
                const res = await api.get('/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh mục", err);
            }
        };
        fetchCategories();
    }, []);

    const handleUpload = async () => {
        if (!file || !title) { alert('Vui lòng nhập tiêu đề và chọn file PDF!'); return; }
        if (!category) { alert('Vui lòng chọn danh mục cho sách!'); return; }
        if (isFree === 'false' && !price) { alert('Vui lòng nhập giá tiền cho sách trả phí!'); return; }

        const token = getToken();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('author', author);
            formData.append('category', category);
            formData.append('publishedYear', publishedYear);
            formData.append('description', description);
            formData.append('isFree', isFree);
            formData.append('price', isFree === 'true' ? '0' : price);

            await api.post('/books/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            success('Thêm sách thành công!');
            setTitle(''); setAuthor(''); setCategory(''); setPublishedYear('');
            setDescription(''); setPrice(''); setFile(null);
            onSuccess();
        } catch {
            error('Có lỗi xảy ra khi upload sách');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        {dialog}
        <div className="max-w-5xl rounded-2xl p-8" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
            <div className="space-y-8">

                <div className="space-y-6 p-6 rounded-2xl" style={{ background: '#F9F5EE', border: '1px solid #E5D5B5' }}>
                    <h3 className="font-black tracking-tight text-lg pb-2" style={{ color: '#3B0E1E', borderBottom: '1px solid #E5D5B5' }}>Thông tin cơ bản</h3>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Tiêu đề sách <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full px-5 py-4 rounded-xl outline-none transition-all font-bold placeholder:font-normal" style={{ background: '#FFFDF8', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }} placeholder="VD: Đắc Nhân Tâm..." value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Tác giả</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: '#FFFDF8', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }} placeholder="VD: Dale Carnegie" value={author} onChange={(e) => setAuthor(e.target.value)} />
                        </div>

                        {/* ✅ THAY INPUT BẰNG SELECT DROPDOWN TẠI ĐÂY */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Danh mục <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all appearance-none cursor-pointer font-bold"
                                style={{ background: '#FFFDF8', border: '1.5px solid #E5D5B5', color: category ? '#3B0E1E' : '#9a7070' }}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>-- Chọn danh mục --</option>
                                {categories.length === 0 ? (
                                    <option value="" disabled>Chưa có DM nào (Hãy tạo mới)</option>
                                ) : (
                                    categories.map(c => (
                                        <option key={c._id} value={c.name} className="text-slate-900 font-medium">
                                            {c.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Năm xuất bản</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: '#FFFDF8', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }} placeholder="VD: 2023" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Các phần Mô tả, Giá, File Upload giữ nguyên y hệt file cũ... */}
                {/* DO TÔI GIỚI HẠN HIỂN THỊ NÊN TÔI CẮT NGẮN, BẠN CHỈ CẦN COPY KHÚC TRÊN ĐÈ VÀO LÀ ĐƯỢC */}

                {/* MÔ TẢ NỘI DUNG */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Tóm tắt / Mô tả sách</label>
                    <textarea rows={4} className="w-full px-5 py-4 rounded-xl outline-none transition-all" style={{ background: '#F9F5EE', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }} placeholder="Nhập giới thiệu ngắn về nội dung sách..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                {/* GIÁ BÁN */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Chế độ hiển thị</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { setIsFree('true'); setPrice(''); }}
                            className="py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border transition-all"
                            style={{
                                background: isFree === 'true' ? '#3B0E1E' : '#FFFDF8',
                                color: isFree === 'true' ? '#C9A227' : '#7a3a46',
                                borderColor: isFree === 'true' ? '#3B0E1E' : '#E5D5B5',
                            }}>
                            Miễn phí
                        </button>
                        <button onClick={() => setIsFree('false')}
                            className="py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border transition-all"
                            style={{
                                background: isFree === 'false' ? '#3B0E1E' : '#FFFDF8',
                                color: isFree === 'false' ? '#C9A227' : '#7a3a46',
                                borderColor: isFree === 'false' ? '#3B0E1E' : '#E5D5B5',
                            }}>
                            Trả phí (VIP)
                        </button>
                    </div>
                </div>
                {isFree === 'false' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" className="w-full px-5 py-4 pl-12 rounded-xl outline-none transition-all font-bold" style={{ background: '#F9F5EE', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }} placeholder="Nhập số tiền..." value={price ? new Intl.NumberFormat('vi-VN').format(Number(price)) : ''} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black" style={{ color: '#C9A227' }}>₫</span>
                        </div>
                    </div>
                )}

                {/* FILE UPLOAD */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: '#7a3a46' }}>Tài liệu PDF <span className="text-red-500">*</span></label>
                    <div className="relative border-2 border-dashed rounded-2xl p-12 transition-all text-center group"
                         style={{ borderColor: '#E5D5B5', background: '#F9F5EE' }}>
                        <input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.type === 'application/pdf') setFile(f); else { alert('Chỉ chấp nhận file PDF!'); e.target.value = ''; } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="space-y-3">
                            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                                 style={{
                                     background: file ? '#22c55e' : '#FFFDF8',
                                     color: file ? '#ffffff' : '#C9A227',
                                     border: file ? '1px solid #22c55e' : '1px solid #E5D5B5',
                                 }}>
                                {file ? <CheckCircle2 size={28} /> : <Upload size={28} />}
                            </div>
                            <div>
                                <p className="text-base font-bold leading-tight" style={{ color: '#3B0E1E' }}>{file ? file.name : 'Chọn tập tin PDF'}</p>
                                <p className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: '#9a7070' }}>Dung lượng tối đa 50MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleUpload} disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.98]"
                    style={{ background: loading ? '#9a4a5a' : '#3B0E1E', color: '#C9A227', boxShadow: '0 4px 15px rgba(59,14,30,0.2)' }}>
                    {loading ? 'ĐANG XỬ LÝ...' : 'THÊM SÁCH VÀO KHO'}
                </button>
            </div>
        </div>
        </>
    );
}
