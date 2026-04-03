'use client';

import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function AddBook({ onSuccess }: { onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [isFree, setIsFree] = useState('true');
    const [loading, setLoading] = useState(false);

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

            // Gọi callback để báo cho thẻ cha chuyển sang tab Danh sách
            onSuccess();
        } catch (err: any) {
            alert('Có lỗi xảy ra khi upload sách');
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}