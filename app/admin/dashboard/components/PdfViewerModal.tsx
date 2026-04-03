'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

interface PdfViewerModalProps {
    bookId: string;
    token: string;
    onClose: () => void;
}

export default function PdfViewerModal({ bookId, token, onClose }: PdfViewerModalProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:3000/books/${bookId}/view`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            const url = URL.createObjectURL(res.data);
            setPdfUrl(url);
            setLoading(false);
        }).catch(err => {
            console.error("Lỗi load PDF:", err);
            setLoading(false);
        });

        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [bookId, token]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-full flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm">Trình Đọc Tài Liệu</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 bg-slate-200/50 relative flex justify-center items-center p-2 md:p-4">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                            <span className="font-bold text-sm tracking-widest uppercase">Đang tải nội dung...</span>
                        </div>
                    ) : pdfUrl ? (
                        <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full rounded-xl bg-white shadow-sm border border-slate-200" />
                    ) : (
                        <p className="text-slate-500 font-bold">Không thể tải tài liệu</p>
                    )}
                </div>
            </div>
        </div>
    );
}