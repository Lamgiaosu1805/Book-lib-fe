'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, CheckCircle2 } from 'lucide-react';

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
                const res = await axios.get('http://localhost:3001/categories', {
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
        if (!file || !title) return alert('Vui lòng nhập tiêu đề và chọn file PDF!');
        if (!category) return alert('Vui lòng chọn danh mục cho sách!'); // Bắt lỗi chưa chọn DM
        if (isFree === 'false' && !price) return alert('Vui lòng nhập giá tiền cho sách trả phí!');

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

            await axios.post('http://localhost:3001/books/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Thêm sách thành công!');
            setTitle(''); setAuthor(''); setCategory(''); setPublishedYear('');
            setDescription(''); setPrice(''); setFile(null);
            onSuccess();
        } catch (err: any) {
            alert('Có lỗi xảy ra khi upload sách');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-10">
            <div className="space-y-8">

                <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="font-black text-slate-800 tracking-tight text-lg border-b border-slate-200 pb-2">Thông tin cơ bản</h3>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tiêu đề sách <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold placeholder:font-normal" placeholder="VD: Đắc Nhân Tâm..." value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tác giả</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" placeholder="VD: Dale Carnegie" value={author} onChange={(e) => setAuthor(e.target.value)} />
                        </div>

                        {/* ✅ THAY INPUT BẰNG SELECT DROPDOWN TẠI ĐÂY */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Danh mục <span className="text-red-500">*</span></label>
                            <select
                                className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer ${category ? 'text-slate-900 font-bold' : 'text-slate-400'}`}
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
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Năm xuất bản</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" placeholder="VD: 2023" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Các phần Mô tả, Giá, File Upload giữ nguyên y hệt file cũ... */}
                {/* DO TÔI GIỚI HẠN HIỂN THỊ NÊN TÔI CẮT NGẮN, BẠN CHỈ CẦN COPY KHÚC TRÊN ĐÈ VÀO LÀ ĐƯỢC */}

                {/* MÔ TẢ NỘI DUNG */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tóm tắt / Mô tả sách</label>
                    <textarea rows={4} className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" placeholder="Nhập giới thiệu ngắn về nội dung sách..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                {/* GIÁ BÁN */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Chế độ hiển thị</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { setIsFree('true'); setPrice(''); }} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isFree === 'true' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}>Miễn phí</button>
                        <button onClick={() => setIsFree('false')} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isFree === 'false' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}>Trả phí (VIP)</button>
                    </div>
                </div>
                {isFree === 'false' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" className="w-full px-5 py-4 pl-12 rounded-xl border border-amber-200 bg-amber-50/30 focus:bg-white focus:ring-4 focus:ring-amber-50 focus:border-amber-500 outline-none transition-all font-bold text-amber-900" placeholder="Nhập số tiền..." value={price ? new Intl.NumberFormat('vi-VN').format(Number(price)) : ''} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-amber-500">₫</span>
                        </div>
                    </div>
                )}

                {/* FILE UPLOAD */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tài liệu PDF <span className="text-red-500">*</span></label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-[20px] p-12 transition-all text-center hover:border-blue-400 hover:bg-blue-50/30 group">
                        <input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.type === 'application/pdf') setFile(f); else { alert('Chỉ chấp nhận PDF!'); e.target.value = ''; } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="space-y-3">
                            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${file ? 'bg-green-500 text-white' : 'bg-slate-50 text-blue-500'}`}>{file ? <CheckCircle2 size={28} /> : <Upload size={28} />}</div>
                            <div><p className="text-base font-bold text-slate-700 leading-tight">{file ? file.name : 'Chọn tập tin PDF'}</p><p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Dung lượng tối đa 50MB</p></div>
                        </div>
                    </div>
                </div>

                <button onClick={handleUpload} disabled={loading} className={`w-full py-4.5 rounded-2xl font-black text-white text-base shadow-xl transition-all active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>{loading ? 'ĐANG XỬ LÝ...' : 'THÊM SÁCH VÀO KHO'}</button>
            </div>
        </div>
    );
}