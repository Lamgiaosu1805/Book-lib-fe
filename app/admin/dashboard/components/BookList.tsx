'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Calendar, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';

export default function BookList() {
    const [books, setBooks] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

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

    const fetchBooks = async (page = 1) => {
        const token = getToken();
        if (!token) return;

        setFetching(true);
        try {
            const res = await axios.get(`http://localhost:3000/books?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setBooks(res.data.items || []);
            setTotalPages(res.data.meta?.totalPages || 1);
            setCurrentPage(res.data.meta?.currentPage || 1);
        } catch (err: any) {
            console.error("Lỗi lấy danh sách:", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage]);

    const formatVNTime = (dateString: string) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24">Ảnh bìa</th>
                            <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề sách</th>
                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày tạo</th>
                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Chế độ</th>
                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {fetching ? (
                            <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải dữ liệu...</td></tr>
                        ) : books.length > 0 ? (
                            books.map((book: any, index: number) => (
                                <tr key={book._id || index} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <PdfThumbnail bookId={book._id} token={getToken()} />
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-3 font-bold text-slate-700">
                                            {book.title}
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatVNTime(book.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${book.isFree ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {book.isFree ? 'Miễn phí' : 'VIP'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-5 text-right"><button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="px-10 py-24 text-center text-slate-300 italic font-medium tracking-widest uppercase">Kho dữ liệu trống</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 bg-white py-4 rounded-2xl border border-slate-200/60 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trang <span className="text-blue-600">{currentPage}</span> / {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className={`p-2 rounded-xl border transition-all ${currentPage === 1 ? 'text-slate-200 border-slate-100' : 'text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-500 bg-white'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className={`p-2 rounded-xl border transition-all ${currentPage === totalPages ? 'text-slate-200 border-slate-100' : 'text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-500 bg-white'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}