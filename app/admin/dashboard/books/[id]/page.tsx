'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Upload, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const SecurePdfViewerNoSSR = dynamic(() => import('../../components/SecurePdfViewer'), { ssr: false });

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;

    const [book, setBook] = useState<any>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(true);

    // Form edit
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [publishedYear, setPublishedYear] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState('true');
    const [price, setPrice] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const getToken = () => {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        return match ? match[2] : '';
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const loadBook = () => {
        const token = getToken();
        api.get(`/books/${bookId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const b = res.data;
                setBook(b);
                setTitle(b.title || '');
                setAuthor(b.author || '');
                setCategory(b.category || '');
                setPublishedYear(String(b.publishedYear || ''));
                setDescription(b.description || '');
                setIsFree(b.isFree ? 'true' : 'false');
                setPrice(b.isFree ? '' : String(b.price || ''));
            });

        api.get(`/books/${bookId}/view`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
            .then(res => setPdfBlob(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadBook(); }, [bookId]);

    const handleSaveInfo = async () => {
        setSaving(true);
        try {
            await api.patch(`/books/${bookId}`, {
                title,
                author,
                category,
                publishedYear: Number(publishedYear),
                description,
                isFree: isFree === 'true',
                price: isFree === 'true' ? 0 : Number(price),
            }, { headers: { Authorization: `Bearer ${getToken()}` } });
            showToast('success', 'Cập nhật thông tin thành công!');
            loadBook();
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadFile = async () => {
        if (!newFile) return;
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', newFile);
        try {
            await api.patch(`/books/${bookId}/file`, formData, {
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
            });
            showToast('success', 'Tải lại file PDF thành công!');
            setNewFile(null);
            setPdfBlob(null);
            // Reload PDF
            api.get(`/books/${bookId}/view`, { headers: { Authorization: `Bearer ${getToken()}` }, responseType: 'blob' })
                .then(res => setPdfBlob(res.data));
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Lỗi upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Xác nhận xóa vĩnh viễn sách "${book?.title}"?\nHành động này không thể hoàn tác!`)) return;
        try {
            await api.delete(`/books/${bookId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            router.push('/admin/dashboard');
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Lỗi xóa sách');
        }
    };

    if (!book) return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
            {/* TOAST */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg font-bold text-sm animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-indigo-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-black text-slate-800 truncate max-w-xs">{book.title}</h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                    >
                        <Trash2 size={16} /> Xóa sách
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CỘT TRÁI: FORM CHỈNH SỬA */}
                <div className="space-y-6">
                    {/* THÔNG TIN CƠ BẢN */}
                    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-8">
                        <h2 className="font-black text-slate-800 text-lg mb-6">Thông tin sách</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tiêu đề *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tác giả</label>
                                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Năm xuất bản</label>
                                    <input type="number" value={publishedYear} onChange={e => setPublishedYear(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Danh mục</label>
                                <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Mô tả</label>
                                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none" />
                            </div>

                            {/* GIÁ */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Chế độ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => { setIsFree('true'); setPrice(''); }}
                                        className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${isFree === 'true' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                        Miễn phí
                                    </button>
                                    <button type="button" onClick={() => setIsFree('false')}
                                        className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${isFree === 'false' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                        Trả phí
                                    </button>
                                </div>
                                {isFree === 'false' && (
                                    <div className="mt-3 relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-500">₫</span>
                                        <input type="text" value={price ? new Intl.NumberFormat('vi-VN').format(Number(price)) : ''} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Nhập giá..." className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50/30 focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none font-bold" />
                                    </div>
                                )}
                            </div>

                            <button onClick={handleSaveInfo} disabled={saving}
                                className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${saving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}>
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>

                    {/* TẢI LẠI FILE PDF */}
                    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-8">
                        <h2 className="font-black text-slate-800 text-lg mb-6">Tải lại file PDF</h2>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/20 group transition-all">
                            <input type="file" accept="application/pdf"
                                onChange={e => { const f = e.target.files?.[0]; if (f) setNewFile(f); }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <Upload size={28} className={`mx-auto mb-3 ${newFile ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-400'} transition-colors`} />
                            <p className="font-bold text-slate-600 text-sm">{newFile ? newFile.name : 'Chọn file PDF mới'}</p>
                            <p className="text-xs text-slate-400 mt-1">File mới sẽ thay thế file hiện tại</p>
                        </div>
                        {newFile && (
                            <button onClick={handleUploadFile} disabled={uploadingFile}
                                className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${uploadingFile ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'}`}>
                                {uploadingFile ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                {uploadingFile ? 'Đang tải lên...' : 'Xác nhận tải lên'}
                            </button>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: XEM PDF */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden h-[800px] sticky top-24">
                    {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                            <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải PDF...</p>
                        </div>
                    ) : pdfBlob ? (
                        <SecurePdfViewerNoSSR pdfUrl={pdfBlob} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Không thể tải PDF</div>
                    )}
                </div>
            </div>
        </div>
    );
}
