'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Search, LogIn, UserPlus, Loader2, X, ChevronRight } from 'lucide-react';
import PdfThumbnail from '../admin/dashboard/components/PdfThumbnail';

export default function BrowsePage() {
    const [books, setBooks] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewBook, setPreviewBook] = useState<any>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        api.get('/books?limit=200')
            .then(res => {
                const items = res.data.items || [];
                setBooks(items);
                const cats = [...new Set<string>(items.map((b: any) => b.category).filter(Boolean))];
                setCategories(cats);
            })
            .finally(() => setLoading(false));
    }, []);

    const openPreview = async (book: any) => {
        setPreviewBook(book);
        setLoadingPdf(true);
        setPdfBlob(null);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        try {
            const res = await api.get(`/books/${book._id}/preview`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            setPdfBlob(res.data);
            setPdfUrl(url);
        } catch {
            setPdfUrl(null);
        } finally {
            setLoadingPdf(false);
        }
    };

    const closePreview = () => {
        setPreviewBook(null);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setPdfBlob(null);
    };

    const filteredBooks = books.filter(b => {
        const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.author || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !selectedCategory || b.category === selectedCategory;
        return matchSearch && matchCat;
    });

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* HEADER */}
            <header className="bg-[#1a2e4a] text-white sticky top-0 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-base tracking-tight">E-Library</span>
                            <span className="text-slate-400 text-xs ml-2 hidden sm:inline">Thư viện điện tử</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                            <LogIn size={15} /> Đăng nhập
                        </Link>
                        <Link href="/register" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold rounded-lg transition-colors shadow">
                            <UserPlus size={15} /> Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <div className="bg-[#1a2e4a] pb-12 pt-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
                        Khám phá <span className="text-amber-400">kho tàng tri thức</span>
                    </h1>
                    <p className="text-slate-400 mb-8 text-base">Đăng nhập để đọc toàn bộ nội dung và lưu sách vào tủ cá nhân</p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input type="text" placeholder="Tìm kiếm theo tên sách, tác giả..."
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-lg outline-none focus:ring-4 focus:ring-amber-400/30 text-stone-800 font-medium"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* CATEGORY FILTER */}
                {categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-8">
                        <button onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!selectedCategory ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'}`}>
                            Tất cả
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* BOOK GRID */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-amber-500">
                        <Loader2 size={40} className="animate-spin mb-4" />
                        <p className="font-semibold text-stone-400 text-sm">Đang tải thư viện...</p>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-24 text-stone-400">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">Không tìm thấy sách phù hợp</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {filteredBooks.map(book => (
                            <div key={book._id} onClick={() => openPreview(book)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group border border-stone-100">
                                <div className="h-52 bg-stone-100 relative overflow-hidden">
                                    <div className="absolute inset-0 [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover [&_iframe]:!w-full [&_iframe]:!h-full">
                                        <PdfThumbnail bookId={book._id} token="" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                            Xem thử
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        {book.isFree
                                            ? <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">MIỄN PHÍ</span>
                                            : <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">{formatCurrency(book.price)}</span>}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-stone-800 text-sm line-clamp-2 leading-tight mb-1 group-hover:text-amber-600 transition-colors">{book.title}</h3>
                                    <p className="text-stone-400 text-xs truncate">{book.author || 'Chưa rõ tác giả'}</p>
                                    {book.category && (
                                        <span className="inline-block mt-2 bg-stone-100 text-stone-500 text-[10px] font-semibold px-2 py-0.5 rounded-md">{book.category}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-stone-400 text-sm mt-8">
                    Hiển thị {filteredBooks.length} / {books.length} tài liệu
                </p>
            </div>

            {/* MODAL XEM THỬ */}
            {previewBook && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col">
                    <div className="bg-[#1a2e4a] h-14 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <BookOpen size={16} className="text-amber-400" />
                            <div>
                                <p className="text-white font-bold text-sm line-clamp-1">{previewBook.title}</p>
                                <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-widest">Bản xem thử · 1 trang</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors">
                                <LogIn size={13} /> Đăng nhập để đọc full
                            </Link>
                            <button onClick={closePreview} className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-stone-800 relative overflow-hidden">
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <Loader2 size={36} className="animate-spin mb-3 text-amber-400" />
                                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Đang tải tài liệu...</p>
                            </div>
                        ) : pdfUrl ? (
                            <iframe src={`${pdfUrl}#toolbar=0&navpanes=0`} className="w-full h-full" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-semibold">Không thể tải bản xem thử</div>
                        )}
                    </div>

                    <div className="bg-white border-t border-stone-100 p-4 flex items-center justify-between">
                        <p className="text-stone-600 text-sm font-medium">
                            {previewBook.isFree ? '📗 Sách miễn phí — Đăng nhập để đọc đầy đủ' : `📕 Sách trả phí — ${formatCurrency(previewBook.price)}`}
                        </p>
                        <div className="flex gap-3">
                            <Link href="/register" className="flex items-center gap-2 px-4 py-2 border-2 border-amber-500 text-amber-600 text-sm font-bold rounded-lg hover:bg-amber-50 transition-colors">
                                <UserPlus size={14}/> Đăng ký miễn phí
                            </Link>
                            <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors shadow">
                                <ChevronRight size={14}/> Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
