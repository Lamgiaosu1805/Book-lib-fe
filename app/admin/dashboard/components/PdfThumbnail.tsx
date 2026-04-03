'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

export default function PdfThumbnail({ bookId, token }: { bookId: string, token: string }) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !bookId) return;

        axios.get(`http://localhost:3000/books/${bookId}/preview`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            const url = URL.createObjectURL(res.data);
            setPdfUrl(url);
            setLoading(false);
        }).catch(err => {
            console.error("Lỗi load ảnh demo:", err);
            setLoading(false);
        });

        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [bookId, token]);

    if (loading) {
        return <div className="w-14 h-20 bg-slate-100 rounded-lg animate-pulse border border-slate-200"></div>;
    }

    if (!pdfUrl) {
        return (
            <div className="w-14 h-20 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300">
                <ImageIcon size={20} />
            </div>
        );
    }

    return (
        <div className="w-14 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group bg-white">
            <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none object-cover"
            />
        </div>
    );
}