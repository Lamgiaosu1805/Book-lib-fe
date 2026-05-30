'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, LogIn, UserPlus, Loader2, X, ChevronRight } from 'lucide-react';
import PdfThumbnail from '../admin/dashboard/components/PdfThumbnail';

const Cross = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

export default function BrowsePage() {
    const [books, setBooks] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewBook, setPreviewBook] = useState<any>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        api.get('/books?limit=200').then(res => {
            const items = res.data.items || [];
            setBooks(items);
            const cats = [...new Set<string>(items.map((b: any) => b.category).filter(Boolean))];
            setCategories(cats);
        }).finally(() => setLoading(false));
    }, []);

    const openPreview = async (book: any) => {
        setPreviewBook(book); setLoadingPdf(true);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        try {
            const res = await api.get(`/books/${book._id}/preview`, { responseType: 'blob' });
            setPdfUrl(URL.createObjectURL(res.data));
        } finally { setLoadingPdf(false); }
    };

    const closePreview = () => {
        setPreviewBook(null);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    };

    const filteredBooks = books.filter(b =>
        (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (b.author || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedCategory || b.category === selectedCategory)
    );

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    return (
        <div className="min-h-screen font-sans" style={{ background: '#F9F5EE' }}>
            {/* HEADER */}
            <header className="sticky top-0 z-40 shadow-md" style={{ background: '#3B0E1E' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                             style={{ borderColor: '#C9A227', color: '#C9A227' }}>
                            <Cross size={14}/>
                        </div>
                        <div>
                            <p className="font-black text-white text-sm leading-none">Thư Viện Công Giáo</p>
                            <p className="text-[10px]" style={{ color: '#C9A227' }}>Bibliotheca Catholica</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/login"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                            style={{ color: '#d4a0a8' }}>
                            <LogIn size={14}/> Đăng nhập
                        </Link>
                        <Link href="/register"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all"
                            style={{ background: '#C9A227', color: '#3B0E1E' }}>
                            <UserPlus size={14}/> Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <div className="py-12 text-center relative overflow-hidden" style={{ background: '#3B0E1E' }}>
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                     style={{ backgroundImage: 'repeating-linear-gradient(0deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 40px)' }}/>
                <div className="relative z-10 max-w-2xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-3 mb-4" style={{ color: '#C9A227' }}>
                        <span className="text-sm">✦</span>
                        <Cross size={18}/>
                        <span className="text-sm">✦</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Kho Tàng Tri Thức Công Giáo
                    </h1>
                    <p className="text-sm mb-2 italic" style={{ color: '#C9A227' }}>
                        "Sự thật sẽ giải phóng anh em" — Ga 8,32
                    </p>
                    <p className="mb-8 text-sm" style={{ color: '#d4a0a8' }}>
                        Đăng nhập để đọc đầy đủ và lưu sách vào tủ cá nhân
                    </p>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9a7070' }}/>
                        <input type="text" placeholder="Tìm kiếm sách, tác giả, chủ đề..."
                            className="w-full pl-11 pr-4 py-4 rounded-xl outline-none text-sm"
                            style={{ background: '#FFFDF8', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    </div>
                </div>
            </div>

            {/* Gold divider */}
            <div className="h-1" style={{ background: 'linear-gradient(to right, transparent, #C9A227, transparent)' }}/>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* CATEGORY FILTER */}
                {categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-8">
                        {['Tất cả', ...categories].map(cat => {
                            const isActive = cat === 'Tất cả' ? !selectedCategory : selectedCategory === cat;
                            return (
                                <button key={cat} onClick={() => setSelectedCategory(cat === 'Tất cả' ? '' : (cat === selectedCategory ? '' : cat))}
                                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                                    style={{
                                        background: isActive ? '#3B0E1E' : '#FFFDF8',
                                        borderColor: isActive ? '#3B0E1E' : '#E5D5B5',
                                        color: isActive ? '#C9A227' : '#7a3a46',
                                    }}>
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* GRID */}
                {loading ? (
                    <div className="flex flex-col items-center py-32" style={{ color: '#C9A227' }}>
                        <Loader2 size={36} className="animate-spin mb-3"/>
                        <p className="text-sm" style={{ color: '#9a7070' }}>Đang tải thư viện...</p>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-24" style={{ color: '#9a7070' }}>
                        <div style={{ margin: '0 auto 12px', opacity: 0.2, width: 'fit-content' }}><Cross size={40}/></div>
                        <p className="font-semibold">Không tìm thấy tài liệu phù hợp</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {filteredBooks.map(book => (
                            <div key={book._id} onClick={() => openPreview(book)}
                                className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1"
                                style={{ background: '#FFFDF8', border: '1px solid #E5D5B5', boxShadow: '0 2px 8px rgba(59,14,30,0.06)' }}>
                                <div className="h-52 relative overflow-hidden" style={{ background: '#F5EDD8' }}>
                                    <div className="absolute inset-0 [&_canvas]:!w-full [&_canvas]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full">
                                        <PdfThumbnail bookId={book._id} token=""/>
                                    </div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                         style={{ background: 'rgba(59,14,30,0.5)' }}>
                                        <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                                            Xem thử
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        {book.isFree
                                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: '#3B0E1E', color: '#C9A227' }}>MIỄN PHÍ</span>
                                            : <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: '#C9A227', color: '#3B0E1E' }}>{formatCurrency(book.price)}</span>}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm line-clamp-2 leading-snug mb-1 transition-colors group-hover:underline"
                                        style={{ color: '#3B0E1E' }}>{book.title}</h3>
                                    <p className="text-xs truncate" style={{ color: '#9a7070' }}>{book.author || 'Chưa rõ tác giả'}</p>
                                    {book.category && (
                                        <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded"
                                              style={{ background: '#F5EDD8', color: '#7a3a46', border: '1px solid #E5D5B5' }}>
                                            {book.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 justify-center mt-10">
                    <div className="h-px flex-1" style={{ background: '#E5D5B5' }}/>
                    <span className="text-xs" style={{ color: '#9a7070' }}>{filteredBooks.length} / {books.length} tài liệu</span>
                    <div className="h-px flex-1" style={{ background: '#E5D5B5' }}/>
                </div>
            </div>

            {/* MODAL */}
            {previewBook && (
                <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(30,5,12,0.85)' }}>
                    <div className="h-14 flex items-center justify-between px-6 shrink-0"
                         style={{ background: '#3B0E1E', borderBottom: '1px solid rgba(201,162,39,0.3)' }}>
                        <div className="flex items-center gap-3">
                            <span style={{ color: '#C9A227' }}><Cross size={14}/></span>
                            <div>
                                <p className="text-white font-bold text-sm line-clamp-1">{previewBook.title}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#C9A227' }}>Bản xem thử · 1 trang</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/login"
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all"
                                style={{ background: '#C9A227', color: '#3B0E1E' }}>
                                <LogIn size={12}/> Đăng nhập để đọc full
                            </Link>
                            <button onClick={closePreview} className="p-1.5 rounded-lg transition-all"
                                    style={{ color: '#d4a0a8' }}>
                                <X size={18}/>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden" style={{ background: '#1a0a10' }}>
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#C9A227' }}/>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7a3a46' }}>Đang tải...</p>
                            </div>
                        ) : pdfUrl ? (
                            <iframe src={`${pdfUrl}#toolbar=0&navpanes=0`} className="w-full h-full"/>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{ color: '#7a3a46' }}>
                                Không thể tải bản xem thử
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between px-6 py-3 shrink-0"
                         style={{ background: '#FFFDF8', borderTop: '1px solid #E5D5B5' }}>
                        <p className="text-sm font-medium" style={{ color: '#7a3a46' }}>
                            {previewBook.isFree ? '✝ Tài liệu miễn phí' : `✝ Tài liệu có phí — ${formatCurrency(previewBook.price)}`}
                        </p>
                        <div className="flex gap-2">
                            <Link href="/register"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border transition-all"
                                style={{ borderColor: '#3B0E1E', color: '#3B0E1E', background: 'transparent' }}>
                                <UserPlus size={13}/> Đăng ký miễn phí
                            </Link>
                            <Link href="/login"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                style={{ background: '#3B0E1E', color: '#C9A227' }}>
                                <ChevronRight size={13}/> Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
