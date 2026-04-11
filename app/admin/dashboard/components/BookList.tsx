'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Calendar, Trash2, ChevronLeft, ChevronRight, User, Tag } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';

export default function BookList() {
    const [books, setBooks] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const router = useRouter();

    const getToken = () => {
        const name = "token=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "";
    };

    const fetchBooks = async (page = 1) => {
        const token = getToken();
        if (!token) return;
        setFetching(true);
        try {
            const res = await axios.get(`https://elib.tgphanoi.org/api/books?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBooks(res.data.items || []);
            setTotalPages(res.data.meta?.totalPages || 1);
            setCurrentPage(res.data.meta?.currentPage || 1);
        } catch (err) {
            console.error("Lỗi:", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchBooks(currentPage); }, [currentPage]);

    const formatCurrency = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24">Bìa</th>
                            <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin sách</th>
                            <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Danh mục</th>
                            <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Giá/Loại</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Sửa/Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {books.map((book) => (
                            <tr
                                key={book._id}
                                onClick={() => router.push(`/admin/dashboard/books/${book._id}`)}
                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-8 py-4">
                                    {/* ✅ ĐIỂM SỬA QUAN TRỌNG: Bọc div w-14 h-20 ở đây */}
                                    <div className="w-14 h-20 rounded-md overflow-hidden border border-slate-200 shadow-sm relative bg-white">
                                        <PdfThumbnail bookId={String(book._id)} token={getToken()} />
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-slate-700 text-[15px]">{book.title}</span>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                            <User size={12} /> {book.author || 'Ẩn danh'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-tighter border border-blue-100">
                                        <Tag size={10} /> {book.category || 'Chung'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {book.isFree ? (
                                        <span className="text-[10px] font-black text-green-500 uppercase bg-green-50 px-2 py-1 rounded">Miễn phí</span>
                                    ) : (
                                        <span className="text-sm font-black text-amber-600">{formatCurrency(book.price)}</span>
                                    )}
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Ngăn không cho click vào nút xóa bị nhảy trang
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}