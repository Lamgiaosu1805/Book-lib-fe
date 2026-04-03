'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

// =========================================================
// ✅ BỘ NHỚ TẠM (CACHE GLOBAL)
// Lưu trữ các Blob URL theo bookId. Vì nó nằm ngoài component 
// nên khi bạn chuyển tab, dữ liệu này KHÔNG bị mất.
// =========================================================
const thumbnailCache: Record<string, string> = {};

export default function PdfThumbnail({ bookId, token }: { bookId: string, token: string }) {
    // Nếu trong cache đã có URL của sách này, thì lấy luôn dùng, không cần loading
    const [pdfUrl, setPdfUrl] = useState<string | null>(thumbnailCache[bookId] || null);
    const [loading, setLoading] = useState(!thumbnailCache[bookId]);

    useEffect(() => {
        if (!token || !bookId) return;

        // ✅ Nếu ảnh đã nằm trong cache thì dừng luôn, không gọi API nữa
        if (thumbnailCache[bookId]) {
            return;
        }

        // Nếu chưa có thì mới tiến hành gọi API tải Blob về
        axios.get(`http://localhost:3000/books/${bookId}/preview`, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            const url = URL.createObjectURL(res.data);

            // Lưu URL vừa tạo vào biến Cache Global
            thumbnailCache[bookId] = url;

            setPdfUrl(url);
            setLoading(false);
        }).catch(err => {
            console.error("Lỗi load ảnh demo:", err);
            setLoading(false);
        });

        // ❌ LƯU Ý QUAN TRỌNG: Không dùng URL.revokeObjectURL(url) ở đây nữa!
        // Vì nếu bạn revoke, khi chuyển lại tab danh sách, cái link trong Cache sẽ trở thành link chết.
        // Trình duyệt sẽ tự dọn dẹp các Blob URL này khi người dùng tắt hẳn tab trình duyệt.

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