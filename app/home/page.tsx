'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Search, LogOut, UserCircle, Library, Compass, X, Loader2, ShoppingCart, CheckCircle2, ChevronRight } from 'lucide-react';
import PdfThumbnail from '../admin/dashboard/components/PdfThumbnail';
import { useDialog } from '../components/Dialog';

const SecurePdfViewerNoSSR = dynamic(() => import('../admin/dashboard/components/SecurePdfViewer'), { ssr: false });

const Cross = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
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
    const { confirm, alert, error, dialog } = useDialog();

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
        } catch { router.push('/login'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const isOwned = (id: string) => myLibrary.some((b: any) => b._id === id);

    const handleAddToLibrary = async (e: React.MouseEvent, bookId: string, isFree: boolean) => {
        e.stopPropagation();
        const ok = await confirm(
            isFree ? 'Thêm sách vào tủ của bạn?' : 'Xác nhận mua cuốn sách này?',
            { confirmText: isFree ? 'Thêm vào tủ' : 'Xác nhận mua' },
        );
        if (!ok) return;
        try {
            await api.post(`/user/library/add/${bookId}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchData();
        } catch (err: any) { error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const openReader = async (book: any, mode: 'preview' | 'full') => {
        setReadingBook(book); setReadMode(mode); setLoadingPdf(true); setPdfBlob(null);
        try {
            const res = await api.get(`/books/${book._id}/${mode === 'preview' ? 'preview' : 'view'}`, {
                headers: { Authorization: `Bearer ${getToken()}` }, responseType: 'blob',
            });
            setPdfBlob(res.data);
        } catch { error('Không thể tải sách!'); setReadingBook(null); }
        finally { setLoadingPdf(false); }
    };

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const displayBooks = activeTab === 'explore' ? books : myLibrary;
    const filteredBooks = displayBooks.filter(b =>
        (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || (b.author || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedCategory || b.category === selectedCategory)
    );

    return (
        <>
        {dialog}
        <div className="flex min-h-screen font-sans" style={{ background: '#F9F5EE' }}>
            {/* SIDEBAR */}
            <aside className="w-56 flex flex-col sticky top-0 h-screen shrink-0" style={{ background: '#250A13' }}>
                {/* Logo */}
                <div className="p-5" style={{ borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                             style={{ borderColor: '#C9A227', color: '#C9A227' }}>
                            <Cross size={13}/>
                        </div>
                        <div>
                            <p className="font-black text-white text-xs leading-tight">Thư Viện Công Giáo</p>
                            <p className="text-[9px] mt-0.5" style={{ color: '#C9A227' }}>Bibliotheca Catholica</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-3 space-y-1 mt-1">
                    {[
                        { key: 'explore', icon: <Compass size={15}/>, label: 'Khám phá' },
                        { key: 'library', icon: <Library size={15}/>, label: 'Tủ sách của tôi', badge: myLibrary.length },
                    ].map(({ key, icon, label, badge }) => (
                        <button key={key}
                            onClick={() => { setActiveTab(key as any); setSelectedCategory(''); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                            style={{
                                background: activeTab === key ? '#3B0E1E' : 'transparent',
                                color: activeTab === key ? '#C9A227' : '#9a6070',
                                border: activeTab === key ? '1px solid rgba(201,162,39,0.3)' : '1px solid transparent',
                            }}>
                            <span className="shrink-0">{icon}</span>
                            <span className="flex-1 min-w-0 text-left truncate">{label}</span>
                            {typeof badge === 'number' && badge > 0 && (
                                <span className="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                      style={{ background: '#C9A227', color: '#3B0E1E' }}>{badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Categories */}
                {categories.length > 0 && activeTab === 'explore' && (
                    <div className="px-3 mt-3 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.2)' }}/>
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C9A227' }}>Danh mục</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.2)' }}/>
                        </div>
                        <div className="space-y-0.5 overflow-y-auto">
                            {[{ label: 'Tất cả', val: '' }, ...categories.map(c => ({ label: c, val: c }))].map(({ label, val }) => (
                                <button key={val} onClick={() => setSelectedCategory(val)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all truncate"
                                    style={{
                                        background: selectedCategory === val ? 'rgba(201,162,39,0.15)' : 'transparent',
                                        color: selectedCategory === val ? '#C9A227' : '#7a4a58',
                                    }}>
                                    {!val && <span className="mr-1.5">✦</span>}{label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* User */}
                <div className="p-3 mt-auto" style={{ borderTop: '1px solid rgba(201,162,39,0.15)' }}>
                    <button onClick={() => router.push('/profile')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all mb-1"
                        style={{ color: '#9a6070' }}>
                        <UserCircle size={15}/> <span className="truncate">{userName || 'Hồ sơ'}</span>
                    </button>
                    <button onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ color: '#c0504a' }}>
                        <LogOut size={15}/> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 px-8 h-14 flex items-center gap-4"
                        style={{ background: '#FFFDF8', borderBottom: '1px solid #E5D5B5' }}>
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: '#b08080' }}/>
                        <input type="text" placeholder="Tìm kiếm sách, tác giả..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                            style={{ background: '#F9F5EE', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            onFocus={e => { e.target.style.borderColor = '#C9A227'; e.target.style.background = '#FFFDF8'; }}
                            onBlur={e => { e.target.style.borderColor = '#E5D5B5'; e.target.style.background = '#F9F5EE'; }}/>
                    </div>
                    <span className="text-xs ml-auto shrink-0" style={{ color: '#b08080' }}>
                        <span className="font-bold" style={{ color: '#3B0E1E' }}>{filteredBooks.length}</span> tài liệu
                    </span>
                </header>

                {/* Page title */}
                <div className="px-8 pt-7 pb-4">
                    <h1 className="text-lg font-black" style={{ color: '#3B0E1E' }}>
                        {activeTab === 'explore' ? (selectedCategory || 'Tất cả tài liệu') : 'Tủ sách của tôi'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-0.5" style={{ background: '#C9A227' }}/>
                        <p className="text-xs" style={{ color: '#9a7070' }}>
                            {activeTab === 'explore' ? `${filteredBooks.length} tài liệu` : `${myLibrary.length} cuốn sách`}
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <main className="flex-1 px-8 pb-10">
                    {loading ? (
                        <div className="flex flex-col items-center py-32" style={{ color: '#C9A227' }}>
                            <Loader2 size={32} className="animate-spin mb-3"/>
                            <p className="text-sm" style={{ color: '#9a7070' }}>Đang tải thư viện...</p>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="flex flex-col items-center py-24" style={{ color: '#9a7070' }}>
                            <Cross size={40}/>
                            <p className="font-semibold mt-4 text-sm">
                                {activeTab === 'library' ? 'Tủ sách trống — hãy thêm sách vào!' : 'Không tìm thấy tài liệu'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filteredBooks.map(book => {
                                const owned = isOwned(book._id);
                                return (
                                    <div key={book._id}
                                        onClick={() => openReader(book, (owned || book.isFree) ? 'full' : 'preview')}
                                        className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1"
                                        style={{ background: '#FFFDF8', border: '1px solid #E5D5B5', boxShadow: '0 2px 8px rgba(59,14,30,0.06)' }}>
                                        <div className="h-52 relative overflow-hidden" style={{ background: '#F5EDD8' }}>
                                            <div className="absolute inset-0 [&_canvas]:!w-full [&_canvas]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full">
                                                <PdfThumbnail bookId={book._id} token={getToken()}/>
                                            </div>
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                                 style={{ background: 'rgba(59,14,30,0.4)' }}>
                                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                                                    {owned || book.isFree ? '✝ Đọc ngay' : 'Xem thử'}
                                                </span>
                                            </div>
                                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                                {owned && (
                                                    <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded"
                                                          style={{ background: '#3B0E1E', color: '#C9A227' }}>
                                                        <CheckCircle2 size={8}/> Đã có
                                                    </span>
                                                )}
                                                <div className="ml-auto">
                                                    {book.isFree
                                                        ? <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#3B0E1E', color: '#C9A227' }}>FREE</span>
                                                        : <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#C9A227', color: '#3B0E1E' }}>{formatCurrency(book.price)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-sm line-clamp-2 leading-snug mb-1"
                                                style={{ color: '#3B0E1E' }}>{book.title}</h3>
                                            <p className="text-xs truncate mb-2" style={{ color: '#9a7070' }}>
                                                {book.author || 'Chưa rõ tác giả'}
                                            </p>
                                            {!owned ? (
                                                <button onClick={e => handleAddToLibrary(e, book._id, book.isFree)}
                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all border"
                                                    style={{ borderColor: '#E5D5B5', color: '#7a3a46', background: '#F9F5EE' }}>
                                                    <ShoppingCart size={11}/>
                                                    {book.isFree ? 'Thêm vào tủ' : 'Mua ngay'}
                                                </button>
                                            ) : (
                                                <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold"
                                                     style={{ background: '#F5EDD8', color: '#7a3a46' }}>
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
                <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(20,5,10,0.95)' }}>
                    <div className="h-14 flex items-center justify-between px-6 shrink-0"
                         style={{ background: '#250A13', borderBottom: '1px solid rgba(201,162,39,0.3)' }}>
                        <div className="flex items-center gap-3">
                            <span style={{ color: '#C9A227' }}><Cross size={13}/></span>
                            <div>
                                <p className="text-white font-bold text-sm line-clamp-1">{readingBook.title}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#C9A227' }}>
                                    {readMode === 'preview' ? 'Bản xem thử' : 'Đọc đầy đủ'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { setReadingBook(null); setPdfBlob(null); }}
                            className="p-1.5 rounded-lg transition-all" style={{ color: '#9a6070' }}>
                            <X size={18}/>
                        </button>
                    </div>
                    <div className="flex-1 relative" style={{ background: '#1a0a10' }}>
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#C9A227' }}/>
                                <p className="text-xs uppercase tracking-widest" style={{ color: '#7a3a46' }}>Đang tải tài liệu...</p>
                            </div>
                        ) : pdfBlob ? (
                            <div className="w-full h-full relative">
                                <SecurePdfViewerNoSSR pdfUrl={pdfBlob}/>
                                {readMode === 'preview' && !isOwned(readingBook._id) && !readingBook.isFree && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-5 rounded-2xl shadow-2xl text-center"
                                         style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                                        <p className="font-bold text-sm mb-3" style={{ color: '#3B0E1E' }}>
                                            ✝ Bạn đang xem bản thử nghiệm
                                        </p>
                                        <button onClick={() => handleAddToLibrary({ stopPropagation: () => {} } as any, readingBook._id, false)}
                                            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                                            style={{ background: '#3B0E1E', color: '#C9A227' }}>
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
        </>
    );
}
