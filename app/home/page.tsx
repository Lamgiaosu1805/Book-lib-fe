'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LogOut, BookOpen, Library, Search, ShoppingCart, CheckCircle2, X, Loader2 } from 'lucide-react';

// Import Thumbnail
import PdfThumbnail from '../admin/dashboard/components/PdfThumbnail';

// ✅ TÍCH HỢP TRÌNH ĐỌC BẢO MẬT (Tắt SSR để tránh lỗi render của Canvas)
const SecurePdfViewerNoSSR = dynamic(
    () => import('../admin/dashboard/components/SecurePdfViewer'),
    { ssr: false }
);

export default function HomePage() {
    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [myLibrary, setMyLibrary] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'explore' | 'library'>('explore');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [readingBook, setReadingBook] = useState<any>(null);
    const [readMode, setReadMode] = useState<'preview' | 'full'>('preview');

    // ✅ ĐỔI THÀNH pdfBlob để truyền thẳng vào SecurePdfViewer (giống bên Admin)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const getToken = () => {
        if (typeof document === 'undefined') return "";
        const match = document.cookie.match(new RegExp('(^| )user_token=([^;]+)'));
        return match ? match[2] : "";
    };

    const logout = () => {
        document.cookie = "user_token=; path=/; max-age=0";
        router.push('/login');
    };

    const fetchData = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const resBooks = await axios.get('http://localhost:3000/books?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBooks(resBooks.data.items || []);

            const resLib = await axios.get('http://localhost:3000/user/library', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMyLibrary(resLib.data || []);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddToLibrary = async (bookId: string, isFree: boolean) => {
        const confirmMsg = isFree
            ? "Thêm sách này vào tủ sách của bạn?"
            : "Xác nhận mua cuốn sách này?";
        if (!confirm(confirmMsg)) return;

        try {
            await axios.post(`http://localhost:3000/user/library/add/${bookId}`, {}, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            alert(isFree ? 'Đã thêm vào tủ sách!' : 'Thanh toán thành công!');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openReader = async (book: any, mode: 'preview' | 'full') => {
        setReadingBook(book);
        setReadMode(mode);
        setLoadingPdf(true);
        setPdfBlob(null); // Xóa dữ liệu cũ

        const token = getToken();
        try {
            const endpoint = mode === 'preview' ? 'preview' : 'view';
            const res = await axios.get(`http://localhost:3000/books/${book._id}/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });

            // ✅ Lưu thẳng Blob nhị phân, không cần dùng URL.createObjectURL nữa
            setPdfBlob(res.data);
        } catch (err) {
            console.error("Lỗi tải PDF:", err);
            alert("Không thể tải sách!");
            setReadingBook(null);
        } finally {
            setLoadingPdf(false);
        }
    };

    const closeReader = () => {
        setReadingBook(null);
        setPdfBlob(null); // Giải phóng RAM
    };

    const isOwned = (bookId: string) => {
        return myLibrary.some((b: any) => b._id === bookId);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const displayBooks = activeTab === 'explore' ? books : myLibrary;
    const filteredBooks = displayBooks.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
            <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">E-LIBRARY</h1>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 mt-10">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'explore' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Search size={18} /> Khám phá
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'library' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Library size={18} /> Tủ sách
                        </button>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên sách..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/60 shadow-sm rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        {filteredBooks.map((book) => {
                            const owned = isOwned(book._id);
                            return (
                                <div key={book._id} className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
                                    <div className="h-72 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden 
                                            [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover 
                                            [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover">
                                            <PdfThumbnail bookId={book._id} token={getToken()} />
                                        </div>

                                        <div className="absolute top-4 right-4 z-20">
                                            {book.isFree ? (
                                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">Miễn Phí</span>
                                            ) : (
                                                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">{formatCurrency(book.price)}</span>
                                            )}
                                        </div>
                                        {owned && (
                                            <div className="absolute top-4 left-4 z-20 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                                                <CheckCircle2 size={12} /> Đã sở hữu
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col flex-1 bg-white">
                                        <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-2 mb-1 uppercase">{book.title}</h3>
                                        <p className="text-slate-500 text-xs font-bold mb-4">{book.author || 'Tác giả ẩn danh'}</p>

                                        <div className="mt-auto space-y-2">
                                            {owned || book.isFree ? (
                                                <button onClick={() => openReader(book, 'full')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95">
                                                    Đọc sách ngay
                                                </button>
                                            ) : (
                                                <button onClick={() => openReader(book, 'preview')} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95">
                                                    Đọc thử 1 trang
                                                </button>
                                            )}

                                            {!owned && (
                                                <button onClick={() => handleAddToLibrary(book._id, book.isFree)} className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 border-2 ${book.isFree ? 'border-indigo-100 text-indigo-600 hover:bg-indigo-50' : 'border-amber-100 text-amber-600 hover:bg-amber-50'}`}>
                                                    <ShoppingCart size={16} />
                                                    {book.isFree ? 'Thêm vào tủ' : 'Mua ngay'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODAL TRÌNH ĐỌC BẢO MẬT */}
            {readingBook && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
                    <div className="h-16 bg-white flex items-center justify-between px-6 shrink-0">
                        <div>
                            <h3 className="font-black text-slate-800">{readingBook.title}</h3>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                {readMode === 'preview' ? 'Bản xem thử' : 'Bản đầy đủ'}
                            </p>
                        </div>
                        <button onClick={closeReader} className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-800 relative p-4 md:p-8 overflow-hidden">
                        {loadingPdf ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <Loader2 size={40} className="animate-spin mb-4 text-indigo-400" />
                                <p className="text-xs font-bold uppercase tracking-widest">Đang tải PDF...</p>
                            </div>
                        ) : (
                            pdfBlob && (
                                <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl">

                                    {/* BẢNG THÔNG BÁO MUA SÁCH (DÀNH CHO CHẾ ĐỘ PREVIEW) */}
                                    {readMode === 'preview' && !isOwned(readingBook._id) && !readingBook.isFree && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur px-8 py-5 rounded-2xl shadow-2xl text-center border border-slate-200 animate-in slide-in-from-bottom-10">
                                            <p className="font-bold text-slate-800 mb-3">Bạn đang xem bản đọc thử.</p>
                                            <button
                                                onClick={() => {
                                                    closeReader();
                                                    handleAddToLibrary(readingBook._id, false);
                                                }}
                                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                                            >
                                                Mua ngay để đọc Full ({formatCurrency(readingBook.price)})
                                            </button>
                                        </div>
                                    )}

                                    {/* ✅ GỌI COMPONENT SECURE PDF VIEWER */}
                                    <SecurePdfViewerNoSSR pdfUrl={pdfBlob} />
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}