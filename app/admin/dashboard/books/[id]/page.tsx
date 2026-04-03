'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Calendar, FileText, Loader2, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';

// =====================================================================
// ✅ DYNAMIC IMPORT: Đã sửa lại đường dẫn tương đối chuẩn xác
// =====================================================================
const SecurePdfViewerNoSSR = dynamic(
    () => import('../../components/SecurePdfViewer'), // 👈 Đã sửa thành ../../components
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="font-bold text-sm tracking-widest uppercase">Đang khởi động trình xem...</span>
            </div>
        )
    }
);
// =====================================================================

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;

    const [bookInfo, setBookInfo] = useState<any>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [loadingPdf, setLoadingPdf] = useState(true);

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

    // Chặn phím tắt in (Ctrl+P, Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                alert('⛔ Hành động này đã bị vô hiệu hóa!');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!bookId) return;

        const token = getToken();
        if (!token) return router.push('/admin/login');

        // 1. Fetch thông tin sách (JSON)
        axios.get(`http://localhost:3000/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            setBookInfo(res.data);
            setLoadingInfo(false);
        }).catch(err => {
            console.error("Lỗi lấy thông tin sách:", err);
            setLoadingInfo(false);
        });

        // 2. Fetch nội dung PDF sách (Blob Stream)
        axios.get(`http://localhost:3000/books/${bookId}/view`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            setPdfBlob(res.data);
            setLoadingPdf(false);
        }).catch(err => {
            console.error("Lỗi lấy file PDF:", err);
            setLoadingPdf(false);
        });

    }, [bookId]);

    const formatVNTime = (dateString: string) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] antialiased text-slate-900 font-sans p-6 md:p-10 flex flex-col items-center">

            {/* CSS chặn in trang */}
            <style jsx global>{`
                @media print {
                    body { display: none !important; }
                }
            `}</style>

            <div className="w-full max-w-6xl">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all mb-8 shadow-sm w-fit"
                >
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>

                {/* KHU VỰC THÔNG TIN SÁCH */}
                {loadingInfo ? (
                    <div className="bg-white rounded-3xl p-10 flex justify-center shadow-sm border border-slate-200">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : bookInfo ? (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 mb-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                            <div className="flex-1 space-y-4">
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                                    {bookInfo.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <Calendar size={16} className="text-slate-400" />
                                        Ngày đăng: {formatVNTime(bookInfo.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <CheckCircle2 size={16} className={bookInfo.isFree ? "text-green-500" : "text-amber-500"} />
                                        Loại: {bookInfo.isFree ? "Miễn phí" : "VIP"}
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 text-green-700">
                                        <ShieldCheck size={16} className="text-green-500" />
                                        Đã bảo mật nội dung
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[200px] flex flex-col items-center justify-center text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Tag size={12} /> Giá Bán
                                </p>
                                {bookInfo.isFree ? (
                                    <span className="text-2xl font-black text-green-500 uppercase">Miễn phí</span>
                                ) : (
                                    <span className="text-3xl font-black text-amber-500">{formatCurrency(bookInfo.price || 0)}</span>
                                )}
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 font-bold p-10">Không tìm thấy thông tin sách</div>
                )}

                {/* KHU VỰC HIỂN THỊ SÁCH BẢO MẬT */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 h-[850px] flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-b border-slate-100 mb-4 bg-white z-10">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="ml-2 text-xs font-black text-slate-300 uppercase tracking-widest">Trình đọc sách bảo mật</span>
                    </div>

                    <div className="flex-1 rounded-2xl relative flex justify-center items-center overflow-hidden bg-slate-100/50">
                        {loadingPdf ? (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Loader2 className="animate-spin text-blue-500" size={40} />
                                <span className="font-bold text-sm tracking-widest uppercase">Đang nạp dữ liệu sách...</span>
                            </div>
                        ) : pdfBlob ? (
                            <SecurePdfViewerNoSSR pdfUrl={pdfBlob} />
                        ) : (
                            <p className="text-slate-500 font-bold">Lỗi: Không thể hiển thị tài liệu này</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}