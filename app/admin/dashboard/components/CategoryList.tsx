'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2, FolderPlus, Folder, Loader2, RefreshCcw, Flame } from 'lucide-react';

type ViewMode = 'active' | 'deleted';

export default function CategoryList() {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('active');

    const getToken = () => {
        const ca = document.cookie.split(';');
        for (const c of ca) {
            const t = c.trim();
            if (t.startsWith('token=')) return t.substring(6);
        }
        return '';
    };

    const fetchCategories = async (mode: ViewMode = viewMode) => {
        setFetching(true);
        try {
            const res = await api.get(`/categories?status=${mode}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setCategories(res.data);
        } catch (err) {
            console.error('Lỗi lấy danh mục', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchCategories(viewMode); }, [viewMode]);

    const handleAdd = async () => {
        if (!name.trim()) return alert('Vui lòng nhập tên danh mục!');
        setLoading(true);
        try {
            await api.post('/categories', { name }, { headers: { Authorization: `Bearer ${getToken()}` } });
            setName('');
            fetchCategories('active');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi thêm danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleSoftDelete = async (id: string, catName: string) => {
        if (!confirm(`Xóa mềm danh mục "${catName}"?`)) return;
        try {
            await api.delete(`/categories/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchCategories('active');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi xóa danh mục');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await api.patch(`/categories/${id}/restore`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchCategories('deleted');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi khôi phục danh mục');
        }
    };

    const handleHardDelete = async (id: string, catName: string) => {
        if (!confirm(`⚠️ XÓA VĨNH VIỄN danh mục "${catName}"?\nKhông thể hoàn tác!`)) return;
        try {
            await api.delete(`/categories/${id}/permanent`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchCategories('deleted');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi xóa vĩnh viễn');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* CỘT TRÁI: FORM THÊM MỚI */}
            <div className="w-full md:w-1/3">
                <div className="rounded-2xl p-6 sticky top-6"
                     style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                    <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid #F5EDD8' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                             style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227' }}>
                            <FolderPlus size={16}/>
                        </div>
                        <h3 className="font-black text-sm" style={{ color: '#3B0E1E' }}>Thêm danh mục</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Tên danh mục mới</label>
                            <input
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                placeholder="VD: Thần học, Kinh Thánh..."
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                                style={{ border: '1.5px solid #E5D5B5', background: '#F9F5EE', color: '#3B0E1E' }}
                            />
                        </div>
                        <button onClick={handleAdd} disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                            style={{ background: loading ? '#9a4a5a' : '#3B0E1E', color: '#C9A227', boxShadow: '0 4px 15px rgba(59,14,30,0.2)' }}>
                            {loading ? 'Đang lưu...' : 'Lưu danh mục'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: DANH SÁCH */}
            <div className="w-full md:w-2/3 space-y-4">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('active')}
                        className="px-4 py-2 rounded-xl font-bold text-sm transition-all border"
                        style={{
                            background: viewMode === 'active' ? '#3B0E1E' : '#FFFDF8',
                            color: viewMode === 'active' ? '#C9A227' : '#7a3a46',
                            borderColor: viewMode === 'active' ? '#3B0E1E' : '#E5D5B5',
                        }}>
                        Đang hoạt động
                    </button>
                    <button onClick={() => setViewMode('deleted')}
                        className="px-4 py-2 rounded-xl font-bold text-sm transition-all border flex items-center gap-1.5"
                        style={{
                            background: viewMode === 'deleted' ? '#7B1A1A' : '#FFFDF8',
                            color: viewMode === 'deleted' ? '#fca5a5' : '#ef4444',
                            borderColor: viewMode === 'deleted' ? '#7B1A1A' : '#fecdd3',
                        }}>
                        <Trash2 size={13}/> Thùng rác
                    </button>
                </div>

                {/* Bảng */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5D5B5', background: '#FFFDF8' }}>
                    <table className="w-full text-left border-collapse">
                        <thead style={{ background: '#F9F5EE', borderBottom: '1px solid #E5D5B5' }}>
                            <tr>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-center"
                                    style={{ color: '#9a7070', width: 48 }}>STT</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: '#9a7070' }}>Tên danh mục</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-right"
                                    style={{ color: '#9a7070' }}>
                                    {viewMode === 'active' ? 'Xóa mềm' : 'Khôi phục / Xóa vĩnh viễn'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetching ? (
                                <tr><td colSpan={3} className="py-16 text-center">
                                    <Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#C9A227' }}/>
                                </td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={3} className="py-16 text-center text-sm font-semibold" style={{ color: '#9a7070' }}>
                                    {viewMode === 'deleted' ? 'Thùng rác trống' : 'Chưa có danh mục nào'}
                                </td></tr>
                            ) : categories.map((cat, index) => (
                                <tr key={cat._id} style={{ borderBottom: index < categories.length - 1 ? '1px solid #F5EDD8' : 'none' }}
                                    className="hover:bg-[#FAF7F2] transition-colors">
                                    <td className="px-5 py-3 text-center text-xs font-bold" style={{ color: '#b08080' }}>
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 font-bold text-sm"
                                             style={{ color: '#3B0E1E', textDecoration: viewMode === 'deleted' ? 'line-through' : 'none', opacity: viewMode === 'deleted' ? 0.7 : 1 }}>
                                            <Folder size={14} style={{ color: '#C9A227', flexShrink: 0 }}/>
                                            {cat.name}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {viewMode === 'active' ? (
                                            <button onClick={() => handleSoftDelete(cat._id, cat.name)}
                                                className="p-2 rounded-lg transition-all"
                                                style={{ color: '#f97316', border: '1px solid #fed7aa', background: '#fff7ed' }}
                                                title="Xóa mềm">
                                                <Trash2 size={14}/>
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleRestore(cat._id)}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#22c55e', border: '1px solid #bbf7d0', background: '#f0fdf4' }}
                                                    title="Khôi phục">
                                                    <RefreshCcw size={14}/>
                                                </button>
                                                <button onClick={() => handleHardDelete(cat._id, cat.name)}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#ef4444', border: '1px solid #fecdd3', background: '#fff5f5' }}
                                                    title="Xóa vĩnh viễn">
                                                    <Flame size={14}/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {viewMode === 'deleted' && (
                    <div className="flex items-center gap-4 text-xs px-1" style={{ color: '#9a7070' }}>
                        <span className="flex items-center gap-1.5"><RefreshCcw size={11} style={{ color: '#22c55e' }}/> Khôi phục lại</span>
                        <span className="flex items-center gap-1.5"><Flame size={11} style={{ color: '#ef4444' }}/> Xóa vĩnh viễn, không thể hoàn tác</span>
                    </div>
                )}
            </div>
        </div>
    );
}
