'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BookOpen, Search, LogIn, UserPlus, Loader2 } from 'lucide-react';
import PdfThumbnail from '../admin/dashboard/components/PdfThumbnail';

export default function BrowsePage() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewBook, setPreviewBook] = useState<any>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        api.get('/books?limit=100')
            .then(res => setBooks(res.data.items || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const openPreview = async (book: any) => {
        setPreviewBook(book);
        setLoadingPdf(true);
        setPdfBlob(null);
        try {
            const res = await api.get(`/books/${book._id}/preview`, { responseType: 'blob' });
            setPdfBlob(res.data);
        } catch {
            setPdfBlob(null);
        } finally {
            setLoadingPdf(false);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">E-LIBRARY</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                            <LogIn size={16} /> Đăng nhập
                        </Link>
                        <Link href="/register" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                            <UserPlus size={16} /> Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* HERO */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-800 mb-3">Thư viện tài liệu</h2>
                    <p className="text-slate-500 font-medium mb-6">Xem thử tài liệu miễn phí. Đăng nhập để truy cập đầy đủ.</p>
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên sách, tác giả..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-indigo-500">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="font-bold tracking-widest uppercase text-xs">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredBooks.map(book => (
                            <div
                                key={book._id}
                                onClick={() => openPreview(book)}
                                className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer active:scale-[0.98]"
                            >
                                <div className="h-64 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden [&_canvas]:!w-full [&_canvas]:!h-full [&_img]:!w-full [&_img]:!h-full">
                                        <PdfThumbnail bookId={book._id} token="" />
                                    </div>
                                    <div className="absolute top-3 right-3 z-20">
                                        {book.isFree ? (
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow">Miễn Phí</span>
                                        ) : (
                                            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow">{formatCurrency(book.price)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-black text-slate-800 text-base leading-tight line-clamp-2 mb-1 uppercase group-hover:text-indigo-600 transition-colors">
                                        {book.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-bold mb-4">{book.author || 'Tác giả ẩn danh'}</p>
                                    <div className="mt-auto">
                                        <div className="w-full py-2.5 bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 rounded-xl font-bold text-sm transition-all text-center">
                                            Xem thử
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL XEM THỬ */}
            {previewBook && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
                    <div className="h-16 bg-white flex items-center justify-between px-6 shrink-0">
                        <div>
                            <h3 className="font-black text-slate-800">{previewBook.title}</h3>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Bản xem thử — 1 trang</p>
                        </div>
                        <button onClick={() => { setPreviewBook(null); setPdfBlob(null); }} className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all text-xl font-bold">✕</button>
                    </div>

                    <div className="flex-1 bg-slate-800 relative p-4 md:p-8 overflow-hidden">
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <Loader2 size={40} className="animate-spin mb-4 text-indigo-400" />
                                <p className="text-xs font-bold uppercase tracking-widest">Đang tải PDF...</p>
                            </div>
                        ) : pdfBlob ? (
                            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                                <iframe
                                    src={`${URL.createObjectURL(pdfBlob)}#toolbar=0&navpanes=0`}
                                    className="w-full h-full"
                                />
                                {/* CTA đăng nhập */}
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur px-8 py-5 rounded-2xl shadow-2xl text-center border border-slate-200">
                                    <p className="font-bold text-slate-800 mb-3">Đăng nhập để đọc toàn bộ tài liệu</p>
                                    <div className="flex gap-3 justify-center">
                                        <Link href="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition-all">
                                            Đăng nhập
                                        </Link>
                                        <Link href="/register" className="px-5 py-2.5 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all">
                                            Đăng ký miễn phí
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold">Không thể tải bản xem thử</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
