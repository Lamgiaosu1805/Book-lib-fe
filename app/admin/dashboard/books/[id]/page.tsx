'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, User, Folder, Clock, FileText, Tag, Info, ShieldCheck } from 'lucide-react';

const SecurePdfViewerNoSSR = dynamic(() => import('../../components/SecurePdfViewer'), { ssr: false });

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [book, setBook] = useState<any>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => {
        const name = "token=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "";
    };

    useEffect(() => {
        const token = getToken();
        const bookId = params.id;

        // Lấy thông tin text
        axios.get(`https://elib.tgphanoi.org/api/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => setBook(res.data));

        // Lấy file PDF
        axios.get(`https://elib.tgphanoi.org/api/books/${bookId}/view`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            setPdfBlob(res.data);
            setLoading(false);
        });
    }, [params.id]);

    if (!book) return <div className="p-20 text-center font-bold text-slate-400">Đang tải dữ liệu sách...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-bold text-slate-500 hover:text-blue-600 transition-all">
                    <ArrowLeft size={20} /> Quay lại
                </button>

                {/* THÔNG TIN CHI TIẾT */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                        <h1 className="text-4xl font-black text-slate-800 leading-tight">{book.title}</h1>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm">
                                <User size={16} /> {book.author}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm">
                                <Folder size={16} /> {book.category}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm">
                                <Clock size={16} /> {book.publishedYear}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest">
                                <Info size={14} className="text-blue-500" /> Tóm tắt nội dung
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {book.description || "Cuốn sách này chưa có mô tả chi tiết."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-blue-200">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Giá sở hữu</p>
                            <h2 className="text-3xl font-black italic">
                                {book.isFree ? "MIỄN PHÍ" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                            </h2>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 bg-white border border-green-100 rounded-2xl text-green-600 font-bold text-xs uppercase tracking-widest shadow-sm">
                            <ShieldCheck size={16} /> Tài liệu đã bảo mật
                        </div>
                    </div>
                </div>

                {/* TRÌNH XEM PDF */}
                <div className="h-[900px] rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-sm relative">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 font-black text-slate-400 text-xs uppercase tracking-widest">Đang giải mã PDF...</p>
                        </div>
                    ) : (
                        <SecurePdfViewerNoSSR pdfUrl={pdfBlob} />
                    )}
                </div>
            </div>
        </div>
    );
}