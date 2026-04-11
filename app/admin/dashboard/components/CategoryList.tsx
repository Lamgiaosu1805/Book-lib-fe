'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, FolderPlus, Folder, Loader2 } from 'lucide-react';

export default function CategoryList() {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

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
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAdd = async () => {
        if (!name.trim()) return alert('Vui lòng nhập tên danh mục!');
        setLoading(true);
        try {
            await axios.post('http://localhost:3001/categories', { name }, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setName('');
            fetchCategories(); // Reload lại list
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi thêm danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await axios.delete(`http://localhost:3001/categories/${id}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            fetchCategories();
        } catch (err) {
            alert('Lỗi xóa danh mục');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* CỘT TRÁI: FORM THÊM MỚI */}
            <div className="w-full md:w-1/3">
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-8 sticky top-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FolderPlus size={20} /></div>
                        <h3 className="font-black text-slate-800 tracking-tight text-lg">Thêm danh mục</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tên danh mục mới</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold placeholder:font-normal"
                                placeholder="VD: Công nghệ, Kinh tế..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-black text-white text-sm shadow-lg transition-all active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                        >
                            {loading ? 'ĐANG LƯU...' : 'LƯU DANH MỤC'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: BẢNG DANH SÁCH */}
            <div className="w-full md:w-2/3">
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">STT</th>
                                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên Danh Mục</th>
                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {fetching ? (
                                <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Đang tải...</td></tr>
                            ) : categories.length > 0 ? (
                                categories.map((cat, index) => (
                                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center text-slate-400 font-bold">{index + 1}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3 font-bold text-slate-700">
                                                <Folder size={16} className="text-blue-500" />
                                                {cat.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(cat._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Chưa có danh mục nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}