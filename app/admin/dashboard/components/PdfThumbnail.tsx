'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

// 1. Định nghĩa Props
interface PdfThumbnailProps {
    bookId: string;
    token: string;
}

const thumbnailCache: Record<string, string> = {};

// 2. Ép kiểu rõ ràng với React.FC<PdfThumbnailProps>
const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ bookId, token }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(thumbnailCache[bookId] || null);
    const [loading, setLoading] = useState(!thumbnailCache[bookId]);

    useEffect(() => {
        if (!token || !bookId) return;

        if (thumbnailCache[bookId]) {
            return;
        }

        axios.get(`http://localhost:3001/books/${bookId}/preview`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            const url = URL.createObjectURL(res.data);
            thumbnailCache[bookId] = url;
            setPdfUrl(url);
            setLoading(false);
        }).catch(err => {
            console.error("Lỗi load ảnh demo:", err);
            setLoading(false);
        });

    }, [bookId, token]);

    if (loading) {
        return <div className="w-full h-full bg-slate-100 animate-pulse"></div>;
    }

    if (!pdfUrl) {
        return (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                <ImageIcon size={32} />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden relative group bg-white">
            <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                className="w-full h-full pointer-events-none object-cover scale-[1.02]"
            />
        </div>
    );
};

export default PdfThumbnail;