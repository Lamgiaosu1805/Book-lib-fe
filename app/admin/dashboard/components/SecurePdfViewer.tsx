'use client';

import { useState, useEffect, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Loader2, ZoomIn, ZoomOut, Bookmark } from 'lucide-react';

// Cấu hình Worker cho react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePdfViewerProps {
    pdfUrl: string | Blob | null;
}

export default function SecurePdfViewer({ pdfUrl }: SecurePdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [activePage, setActivePage] = useState<number>(1); // ✅ Lưu trang đang xem
    const [scale, setScale] = useState<number>(1.2);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // ✅ LOGIC: Nhận diện trang khi cuộn
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Nếu trang đó chiếm hơn 50% diện tích hiển thị
                    if (entry.isIntersecting) {
                        const pageNum = Number(entry.target.getAttribute('data-page-number'));
                        setActivePage(pageNum);
                    }
                });
            },
            {
                root: containerRef.current, // Theo dõi bên trong khung cuộn
                threshold: 0.5, // Ngưỡng 50% diện tích trang xuất hiện
            }
        );

        // Lấy tất cả các thẻ bao quanh trang để theo dõi
        const pageElements = document.querySelectorAll('.pdf-page-wrapper');
        pageElements.forEach((el) => observer.observe(el));

        return () => {
            pageElements.forEach((el) => observer.unobserve(el));
        };
    }, [numPages, loading]); // Chạy lại khi nạp xong số trang

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const changeScale = (offset: number) => {
        setScale(prevScale => {
            const newScale = prevScale + offset;
            return (newScale >= 0.5 && newScale <= 3) ? newScale : prevScale;
        });
    };

    if (!pdfUrl) return <p className="p-10 text-slate-500 font-bold">Đang nạp file...</p>;

    return (
        <div className="w-full h-full flex flex-col relative bg-slate-200/50 rounded-2xl overflow-hidden">

            {/* THANH ĐIỀU KHIỂN CỐ ĐỊNH */}
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">

                {/* Hiển thị trang đang xem */}
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100">
                    <Bookmark size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">
                        Đang xem: <span className="text-blue-600 text-base">{activePage}</span> / {numPages || '...'}
                    </span>
                </div>

                {/* Bộ thu phóng */}
                <div className="flex items-center gap-2">
                    <button onClick={() => changeScale(-0.2)} disabled={scale <= 0.5} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-all">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-500 w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                    <button onClick={() => changeScale(0.2)} disabled={scale >= 3} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-all">
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {/* KHU VỰC CUỘN SÁCH */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
            >
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-100/80 z-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                        <span className="font-bold text-sm tracking-widest uppercase">Đang nạp dữ liệu...</span>
                    </div>
                )}

                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(err) => console.error(err)}
                    loading={null}
                    className="flex flex-col items-center gap-8 w-full"
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        // ✅ Bọc Page trong một div để Intersection Observer theo dõi
                        <div
                            key={`page_${index + 1}`}
                            className="pdf-page-wrapper"
                            data-page-number={index + 1}
                        >
                            <Page
                                pageNumber={index + 1}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={`shadow-2xl rounded-lg overflow-hidden border-4 transition-all duration-500 ${activePage === index + 1 ? 'border-blue-400' : 'border-transparent'}`}
                                loading={<div className="w-[600px] h-[800px] bg-white animate-pulse rounded-lg" />}
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}