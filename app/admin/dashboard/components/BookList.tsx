'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Trash2, ChevronLeft, ChevronRight, User, Tag, Pencil, RefreshCcw, Flame, Loader2 } from 'lucide-react';
import { useDialog } from '@/app/components/Dialog';
import PdfThumbnail from './PdfThumbnail';

type ViewMode = 'active' | 'deleted';

export default function BookList() {
    const [books, setBooks] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('active');
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const router = useRouter();
    const { confirm, alert, error, dialog } = useDialog();

    const getToken = () => {
        const ca = document.cookie.split(';');
        for (const c of ca) {
            const t = c.trim();
            if (t.startsWith('token=')) return t.substring(6);
        }
        return '';
    };

    const fetchBooks = async (page = 1, mode: ViewMode = viewMode) => {
        const token = getToken();
        if (!token) return;
        setFetching(true);
        try {
            const res = await api.get(`/books?page=${page}&limit=${limit}&status=${mode}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(res.data.items || []);
            setTotalPages(res.data.meta?.totalPages || 1);
            setCurrentPage(res.data.meta?.currentPage || 1);
            setTotalItems(res.data.meta?.totalItems || 0);
        } catch (err) {
            console.error('Lỗi:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchBooks(1, viewMode); }, [viewMode]);

    const switchMode = (mode: ViewMode) => {
        setCurrentPage(1);
        setViewMode(mode);
    };

    const handleSoftDelete = async (e: React.MouseEvent, bookId: string, title: string) => {
        e.stopPropagation();
        const ok = await confirm(`Xóa mềm sách "${title}"?\nSách sẽ bị ẩn nhưng vẫn có thể khôi phục lại.`, {
            title: 'Xác nhận xóa mềm',
            type: 'confirm',
            confirmText: 'Xóa mềm',
        });
        if (!ok) return;
        try {
            await api.delete(`/books/${bookId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchBooks(currentPage);
        } catch (err: any) {
            error(err.response?.data?.message || 'Lỗi khi xóa sách');
        }
    };

    const handleRestore = async (e: React.MouseEvent, bookId: string) => {
        e.stopPropagation();
        try {
            await api.patch(`/books/${bookId}/restore`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchBooks(currentPage, 'deleted');
        } catch (err: any) {
            error(err.response?.data?.message || 'Lỗi khi khôi phục sách');
        }
    };

    const handleHardDelete = async (e: React.MouseEvent, bookId: string, title: string) => {
        e.stopPropagation();
        const ok = await confirm(
            `Toàn bộ file PDF sẽ bị xóa khỏi máy chủ và KHÔNG THỂ khôi phục!`,
            {
                title: `Xóa vĩnh viễn "${title}"?`,
                type: 'confirm',
                confirmText: 'Xóa vĩnh viễn',
            },
        );
        if (!ok) return;
        try {
            await api.delete(`/books/${bookId}/permanent`, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchBooks(currentPage, 'deleted');
        } catch (err: any) {
            error(err.response?.data?.message || 'Lỗi khi xóa vĩnh viễn');
        }
    };

    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    const thStyle = 'px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left';

    return (
        <>
        {dialog}
        <div className="flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex items-center gap-2">
                <button onClick={() => switchMode('active')}
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all border"
                    style={{
                        background: viewMode === 'active' ? '#3B0E1E' : '#FFFDF8',
                        color: viewMode === 'active' ? '#C9A227' : '#7a3a46',
                        borderColor: viewMode === 'active' ? '#3B0E1E' : '#E5D5B5',
                    }}>
                    Đang hoạt động
                </button>
                <button onClick={() => switchMode('deleted')}
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all border flex items-center gap-2"
                    style={{
                        background: viewMode === 'deleted' ? '#7B1A1A' : '#FFFDF8',
                        color: viewMode === 'deleted' ? '#fca5a5' : '#ef4444',
                        borderColor: viewMode === 'deleted' ? '#7B1A1A' : '#fecdd3',
                    }}>
                    <Trash2 size={14}/> Thùng rác
                </button>
                <span className="text-xs ml-auto" style={{ color: '#9a7070' }}>
                    <span className="font-black" style={{ color: '#3B0E1E' }}>{totalItems}</span> tài liệu
                </span>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5D5B5', background: '#FFFDF8' }}>
                {fetching ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin" style={{ color: '#C9A227' }}/>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20 text-sm font-semibold" style={{ color: '#9a7070' }}>
                        {viewMode === 'deleted' ? 'Thùng rác trống' : 'Chưa có sách nào'}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead style={{ background: '#F9F5EE', borderBottom: '1px solid #E5D5B5' }}>
                            <tr>
                                <th className={thStyle} style={{ color: '#9a7070', width: 72 }}>Bìa</th>
                                <th className={thStyle} style={{ color: '#9a7070' }}>Thông tin sách</th>
                                <th className={`${thStyle} text-center`} style={{ color: '#9a7070' }}>Danh mục</th>
                                <th className={`${thStyle} text-center`} style={{ color: '#9a7070' }}>Giá</th>
                                <th className={`${thStyle} text-right`} style={{ color: '#9a7070' }}>
                                    {viewMode === 'active' ? 'Thao tác' : 'Khôi phục / Xóa vĩnh viễn'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book, i) => (
                                <tr key={book._id}
                                    onClick={() => viewMode === 'active' && router.push(`/admin/dashboard/books/${book._id}`)}
                                    className="transition-colors"
                                    style={{
                                        borderBottom: i < books.length - 1 ? '1px solid #F5EDD8' : 'none',
                                        cursor: viewMode === 'active' ? 'pointer' : 'default',
                                        opacity: viewMode === 'deleted' ? 0.8 : 1,
                                    }}>
                                    {/* Bìa */}
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-16 rounded-lg overflow-hidden relative"
                                             style={{ border: '1px solid #E5D5B5' }}>
                                            <PdfThumbnail bookId={String(book._id)} token={getToken()} />
                                        </div>
                                    </td>
                                    {/* Tên sách */}
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-sm" style={{ color: '#3B0E1E', textDecoration: viewMode === 'deleted' ? 'line-through' : 'none' }}>
                                            {book.title}
                                        </p>
                                        <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#9a7070' }}>
                                            <User size={11}/> {book.author || 'Ẩn danh'}
                                        </p>
                                    </td>
                                    {/* Danh mục */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
                                              style={{ background: '#F5EDD8', color: '#7a3a46', border: '1px solid #E5D5B5' }}>
                                            <Tag size={9}/> {book.category || 'Chung'}
                                        </span>
                                    </td>
                                    {/* Giá */}
                                    <td className="px-4 py-3 text-center">
                                        {book.isFree
                                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: '#3B0E1E', color: '#C9A227' }}>FREE</span>
                                            : <span className="text-xs font-black" style={{ color: '#C9A227' }}>{formatCurrency(book.price)}</span>}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right">
                                        {viewMode === 'active' ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <button title="Sửa thông tin"
                                                    onClick={e => { e.stopPropagation(); router.push(`/admin/dashboard/books/${book._id}`); }}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#3b82f6', border: '1px solid #bfdbfe', background: '#eff6ff' }}>
                                                    <Pencil size={14}/>
                                                </button>
                                                <button title="Xóa mềm"
                                                    onClick={e => handleSoftDelete(e, book._id, book.title)}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#f97316', border: '1px solid #fed7aa', background: '#fff7ed' }}>
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <button title="Khôi phục sách"
                                                    onClick={e => handleRestore(e, book._id)}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#22c55e', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                                                    <RefreshCcw size={14}/>
                                                </button>
                                                <button title="Xóa vĩnh viễn (xóa cứng)"
                                                    onClick={e => handleHardDelete(e, book._id, book.title)}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{ color: '#ef4444', border: '1px solid #fecdd3', background: '#fff5f5' }}>
                                                    <Flame size={14}/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => fetchBooks(currentPage - 1)} disabled={currentPage === 1}
                        className="p-2 rounded-lg transition-all disabled:opacity-40"
                        style={{ border: '1px solid #E5D5B5', color: '#7a3a46', background: '#FFFDF8' }}>
                        <ChevronLeft size={16}/>
                    </button>
                    <span className="text-xs font-semibold px-3" style={{ color: '#7a3a46' }}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button onClick={() => fetchBooks(currentPage + 1)} disabled={currentPage === totalPages}
                        className="p-2 rounded-lg transition-all disabled:opacity-40"
                        style={{ border: '1px solid #E5D5B5', color: '#7a3a46', background: '#FFFDF8' }}>
                        <ChevronRight size={16}/>
                    </button>
                </div>
            )}

            {/* Legend */}
            {viewMode === 'deleted' && (
                <div className="flex items-center gap-4 text-xs px-1" style={{ color: '#9a7070' }}>
                    <span className="flex items-center gap-1.5">
                        <RefreshCcw size={12} style={{ color: '#22c55e' }}/> Khôi phục — sách sẽ hiện lại
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Flame size={12} style={{ color: '#ef4444' }}/> Xóa vĩnh viễn — xóa luôn file PDF, không thể hoàn tác
                    </span>
                </div>
            )}
        </div>
        </>
    );
}
