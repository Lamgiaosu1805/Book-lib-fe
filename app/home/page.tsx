'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BookOpen, Search, LogOut, UserCircle, Library, Compass, X, Loader2, ShoppingCart, CheckCircle2, ChevronRight, Tag } from 'lucide-react';
import PdfThumbnail from './admin/dashboard/components/PdfThumbnail';

const SecurePdfViewerNoSSR = dynamic(
    () => import('./admin/dashboard/components/SecurePdfViewer'),
    { ssr: false }
);

export default function HomePage() {
    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [myLibrary, setMyLibrary] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'explore' | 'library'>('explore');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [readingBook, setReadingBook] = useState<any>(null);
    const [readMode, setReadMode] = useState<'preview' | 'full'>('preview');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [userName, setUserName] = useState('');

    const getToken = () => {
        if (typeof document === 'undefined') return '';
        const match = document.cookie.match(new RegExp('(^| )user_token=([^;]+)'));
        return match ? match[2] : '';
    };

    const logout = () => {
        document.cookie = 'user_token=; path=/; max-age=0';
        router.push('/login');
    };

    const fetchData = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) { router.push('/login'); return; }
        try {
            const [resBooks, resLib, resProfile] = await Promise.all([
                api.get('/books?limit=200', { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/user/library', { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const items = resBooks.data.items || [];
            setBooks(items);
            setMyLibrary(resLib.data || []);
            setUserName(resProfile.data.displayName || resProfile.data.email?.split('@')[0] || '');
            const cats = [...new Set<string>(items.map((b: any) => b.category).filter(Boolean))];
            setCategories(cats);
        } catch {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const isOwned = (bookId: string) => myLibrary.some((b: any) => b._id === bookId);

    const handleAddToLibrary = async (e: React.MouseEvent, bookId: string, isFree: boolean) => {
        e.stopPropagation();
        if (!confirm(isFree ? 'Thêm sách vào tủ của bạn?' : 'Xác nhận mua cuốn sách này?')) return;
        try {
            await api.post(`/user/library/add/${bookId}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openReader = async (book: any, mode: 'preview' | 'full') => {
        setReadingBook(book); setReadMode(mode); setLoadingPdf(true); setPdfBlob(null);
        try {
            const endpoint = mode === 'preview' ? 'preview' : 'view';
            const res = await api.get(`/books/${book._id}/${endpoint}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                responseType: 'blob',
            });
            setPdfBlob(res.data);
        } catch {
            alert('Không thể tải sách!');
            setReadingBook(null);
        } finally {
            setLoadingPdf(false);
        }
    };

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const displayBooks = activeTab === 'explore' ? books : myLibrary;
    const filteredBooks = displayBooks.filter(b => {
        const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.author || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !selectedCategory || b.category === selectedCategory;
        return matchSearch && matchCat;
    });

    return (
        <div className="flex min-h-screen bg-stone-50 font-sans">
            {/* SIDEBAR */}
            <aside className="w-60 bg-[#1a2e4a] text-white flex flex-col sticky top-0 h-screen shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                            <BookOpen size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm tracking-tight leading-none">E-Library</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">Thư viện điện tử</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    <button onClick={() => { setActiveTab('explore'); setSelectedCategory(''); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'explore' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        <Compass size={16} /> Khám phá
                    </button>
                    <button onClick={() => { setActiveTab('library'); setSelectedCategory(''); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'library' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        <Library size={16} /> Tủ sách của tôi
                        {myLibrary.length > 0 && (
                            <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{myLibrary.length}</span>
                        )}
                    </button>
                </nav>

                {/* Categories */}
                {categories.length > 0 && activeTab === 'explore' && (
                    <div className="px-3 mt-2">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 px-1">Danh mục</p>
                        <div className="space-y-0.5 max-h-64 overflow-y-auto">
                            <button onClick={() => setSelectedCategory('')}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${!selectedCategory ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                <Tag size={12} /> Tất cả
                            </button>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${selectedCategory === cat ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                    <Tag size={12} className="shrink-0" />
                                    <span className="truncate">{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* User section */}
                <div className="mt-auto p-3 border-t border-white/10 space-y-1">
                    <button onClick={() => router.push('/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all">
                        <UserCircle size={16} />
                        <span className="truncate">{userName || 'Hồ sơ'}</span>
                    </button>
                    <button onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold text-sm transition-all">
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* TOP BAR */}
                <header className="bg-white border-b border-stone-100 sticky top-0 z-30 px-8 h-14 flex items-center gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input type="text" placeholder="Tìm kiếm sách, tác giả..."
                            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 text-stone-700 text-sm transition-all"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="text-sm text-stone-400 ml-auto shrink-0">
                        <span className="font-semibold text-stone-600">{filteredBooks.length}</span> tài liệu
                    </div>
                </header>

                {/* PAGE TITLE */}
                <div className="px-8 pt-7 pb-4">
                    <h1 className="text-xl font-black text-stone-800">
                        {activeTab === 'explore' ? (selectedCategory || 'Tất cả tài liệu') : 'Tủ sách của tôi'}
                    </h1>
                    <p className="text-stone-400 text-sm mt-0.5">
                        {activeTab === 'explore' ? `${filteredBooks.length} tài liệu` : `${myLibrary.length} cuốn sách`}
                    </p>
                </div>

                {/* BOOK GRID */}
                <main className="flex-1 px-8 pb-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-amber-500">
                            <Loader2 size={36} className="animate-spin mb-3" />
                            <p className="text-stone-400 text-sm font-semibold">Đang tải thư viện...</p>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                            <BookOpen size={48} className="opacity-20 mb-4" />
                            <p className="font-semibold">{activeTab === 'library' ? 'Tủ sách trống — hãy thêm sách vào!' : 'Không tìm thấy tài liệu'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filteredBooks.map(book => {
                                const owned = isOwned(book._id);
                                return (
                                    <div key={book._id}
                                        onClick={() => openReader(book, (owned || book.isFree) ? 'full' : 'preview')}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md border border-stone-100 overflow-hidden cursor-pointer group transition-all duration-200">
                                        {/* Cover */}
                                        <div className="h-52 bg-stone-100 relative overflow-hidden">
                                            <div className="absolute inset-0 [&_canvas]:!w-full [&_canvas]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full">
                                                <PdfThumbnail bookId={book._id} token={getToken()} />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                                {owned && (
                                                    <span className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                                                        <CheckCircle2 size={9}/> Đã có
                                                    </span>
                                                )}
                                                <div className="ml-auto">
                                                    {book.isFree
                                                        ? <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">FREE</span>
                                                        : <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">{formatCurrency(book.price)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-bold text-stone-800 text-sm line-clamp-2 leading-snug mb-1 group-hover:text-amber-600 transition-colors">{book.title}</h3>
                                            <p className="text-stone-400 text-xs truncate mb-2">{book.author || 'Chưa rõ tác giả'}</p>
                                            {!owned && (
                                                <button
                                                    onClick={e => handleAddToLibrary(e, book._id, book.isFree)}
                                                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${book.isFree ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                                    <ShoppingCart size={11}/>
                                                    {book.isFree ? 'Thêm vào tủ' : 'Mua ngay'}
                                                </button>
                                            )}
                                            {owned && (
                                                <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-stone-50 text-stone-500 rounded-lg text-xs font-semibold">
                                                    <ChevronRight size={11}/> Đọc ngay
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* READER MODAL */}
            {readingBook && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
                    <div className="bg-[#1a2e4a] h-14 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <BookOpen size={16} className="text-amber-400" />
                            <div>
                                <p className="text-white font-bold text-sm line-clamp-1">{readingBook.title}</p>
                                <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                                    {readMode === 'preview' ? 'Bản xem thử' : 'Đọc đầy đủ'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { setReadingBook(null); setPdfBlob(null); }}
                            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 bg-stone-800 relative">
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <Loader2 size={36} className="animate-spin mb-3 text-amber-400" />
                                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Đang tải tài liệu...</p>
                            </div>
                        ) : pdfBlob ? (
                            <div className="w-full h-full relative">
                                <SecurePdfViewerNoSSR pdfUrl={pdfBlob} />
                                {readMode === 'preview' && !isOwned(readingBook._id) && !readingBook.isFree && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-2xl text-center border border-stone-200">
                                        <p className="font-bold text-stone-800 mb-3 text-sm">Bạn đang xem bản thử nghiệm</p>
                                        <button onClick={() => { handleAddToLibrary({ stopPropagation: () => {} } as any, readingBook._id, false); }}
                                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow transition-all text-sm">
                                            Mua ngay — {formatCurrency(readingBook.price)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
