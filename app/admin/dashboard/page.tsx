'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookPlus, Library, LogOut,
    Upload, CheckCircle2, AlertTriangle, Trash2, FileText,
    ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
    // 1. Mặc định là 'list' để vừa vào là thấy danh sách ngay
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [isFree, setIsFree] = useState('true');
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- State Phân Trang ---
    const [books, setBooks] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const router = useRouter();

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

    // ✅ Hàm lấy danh sách sách từ API
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

            // Gán dữ liệu từ cấu trúc { items, meta }
            setBooks(res.data.items || []);
            setTotalPages(res.data.meta?.totalPages || 1);
            setCurrentPage(res.data.meta?.currentPage || 1);
        } catch (err: any) {
            console.error("Lỗi lấy danh sách:", err);
        } finally {
            setFetching(false);
        }
    };

    // Load data khi tab là 'list' hoặc đổi trang
    useEffect(() => {
        if (activeTab === 'list') {
            fetchBooks(currentPage);
        }
    }, [activeTab, currentPage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            alert('Chỉ chấp nhận định dạng PDF!');
            e.target.value = '';
        }
    };

    const handleUpload = async () => {
        if (!file || !title) {
            alert('Vui lòng nhập đầy đủ tiêu đề và chọn file PDF!');
            return;
        }
        const token = getToken();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('isFree', isFree);

            await axios.post('http://localhost:3000/books/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Thêm sách thành công!');
            setTitle('');
            setFile(null);
            setCurrentPage(1);
            setActiveTab('list');
        } catch (err: any) {
            alert('Có lỗi xảy ra khi upload sách');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FB] antialiased text-slate-900 font-sans">
            {/* MODAL ĐĂNG XUẤT */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white rounded-2xl p-8 max-sm w-full shadow-xl border border-slate-100 text-center">
                        <div className="flex justify-center text-amber-500 mb-4"><AlertTriangle size={40} /></div>
                        <h3 className="text-lg font-bold">Xác nhận đăng xuất?</h3>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Hủy</button>
                            <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all">Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0F172A] text-white flex flex-col sticky top-0 h-screen shadow-2xl">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20"><LayoutDashboard size={20} className="text-white" /></div>
                    <span className="font-bold tracking-tight text-lg uppercase leading-none mt-1">Admin Panel</span>
                </div>
                <nav className="flex-1 p-4 space-y-1 mt-4">
                    <button onClick={() => { setActiveTab('list'); setCurrentPage(1); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                        <Library size={18} /> Danh sách sách
                    </button>
                    <button onClick={() => setActiveTab('add')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                        <BookPlus size={18} /> Thêm sách mới
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800/50">
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-400/10 transition-all"><LogOut size={18} /> Đăng xuất</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-10 flex justify-between items-start">
                    <div>
                        <p className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Quản lý kho</p>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeTab === 'list' ? 'Danh sách sách hiện có' : 'Tải lên tài liệu PDF mới'}</h2>
                    </div>
                </header>

                {/* --- TAB DANH SÁCH --- */}
                {activeTab === 'list' && (
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề sách</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Chế độ</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {fetching ? (
                                        <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải dữ liệu...</td></tr>
                                    ) : books.length > 0 ? (
                                        books.map((book: any, index: number) => (
                                            <tr key={book._id || index} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-5"><div className="flex items-center gap-3 font-bold text-slate-700"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={16} /></div>{book.title}</div></td>
                                                <td className="px-10 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${book.isFree ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{book.isFree ? 'Miễn phí' : 'VIP'}</span></td>
                                                <td className="px-10 py-5 text-right"><button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} className="px-10 py-24 text-center text-slate-300 italic font-medium tracking-widest uppercase">Kho dữ liệu trống</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- BỘ ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION) --- */}
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
                    </div>
                )}

                {/* --- TAB THÊM SÁCH --- */}
                {activeTab === 'add' && (
                    <div className="max-w-3xl bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-10">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tiêu đề sách</label>
                                <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-bold" placeholder="Nhập tiêu đề..." value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Chế độ hiển thị</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setIsFree('true')} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isFree === 'true' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}>Miễn phí</button>
                                    <button onClick={() => setIsFree('false')} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isFree === 'false' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}>Trả phí (VIP)</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Tải lên File PDF</label>
                                <div className="relative border-2 border-dashed border-slate-200 rounded-[20px] p-12 transition-all text-center hover:border-blue-400 hover:bg-blue-50/30 group">
                                    <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="space-y-3">
                                        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${file ? 'bg-green-500 text-white' : 'bg-slate-50 text-blue-500'}`}>{file ? <CheckCircle2 size={28} /> : <Upload size={28} />}</div>
                                        <div><p className="text-base font-bold text-slate-700 leading-tight">{file ? file.name : 'Chọn tập tin PDF'}</p><p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Dung lượng tối đa 50MB</p></div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleUpload} disabled={loading} className={`w-full py-4.5 rounded-2xl font-black text-white text-base shadow-xl transition-all active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>{loading ? 'ĐANG XỬ LÝ...' : 'THÊM SÁCH VÀO KHO'}</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}