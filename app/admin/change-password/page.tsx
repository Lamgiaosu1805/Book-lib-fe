'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

type ApiError = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

export default function AdminChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const getToken = () => {
        const ca = document.cookie.split(';');
        for (const c of ca) {
            const t = c.trim();
            if (t.startsWith('token=')) return t.substring(6);
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (newPassword !== confirmPassword) {
            setErrorMsg('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const res = await api.patch('/admin/change-password',
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${getToken()}` } },
            );
            document.cookie = `token=${res.data.data.accessToken}; path=/; max-age=604800; samesite=lax`;
            router.push('/admin/dashboard');
        } catch (err: unknown) {
            setErrorMsg((err as ApiError).response?.data?.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(201,162,39,0.2)',
        color: 'white',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={{ background: '#0D0407' }}>
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 50px)' }}/>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                         style={{ border: '2px solid #C9A227', color: '#C9A227', boxShadow: '0 0 30px rgba(201,162,39,0.2)' }}>
                        <KeyRound size={28}/>
                    </div>
                    <h1 className="font-black text-white text-lg">Đổi mật khẩu</h1>
                    <p className="text-xs mt-1" style={{ color: '#C9A227' }}>Yêu cầu cho lần đăng nhập đầu tiên</p>
                </div>

                {errorMsg && (
                    <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                         style={{ background: 'rgba(123,26,26,0.4)', border: '1px solid rgba(180,60,60,0.3)', color: '#f4a0a0' }}>
                        {errorMsg}
                    </div>
                )}

                <div className="rounded-2xl p-6" style={{ background: 'rgba(59,14,30,0.6)', border: '1px solid rgba(201,162,39,0.2)', backdropFilter: 'blur(10px)' }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'Mật khẩu tạm', value: oldPassword, setter: setOldPassword },
                            { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword },
                            { label: 'Xác nhận mật khẩu mới', value: confirmPassword, setter: setConfirmPassword },
                        ].map(({ label, value, setter }) => (
                            <div key={label}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C9A227' }}>{label}</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} required value={value}
                                        onChange={e => setter(e.target.value)}
                                        className="input-dark w-full px-4 py-3 pr-11 rounded-xl outline-none text-sm transition-all"
                                        style={inputStyle}/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#7a3a46' }}>
                                        {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                            style={{ background: '#C9A227', color: '#3B0E1E', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 20px rgba(201,162,39,0.3)' }}>
                            {loading && <Loader2 size={15} className="animate-spin"/>}
                            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
