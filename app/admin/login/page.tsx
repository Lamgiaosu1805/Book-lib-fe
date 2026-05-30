'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.post('/admin/login', { email, password });
            const token = res.data.data.accessToken;
            document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;
            router.push('/admin/dashboard');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Thông tin đăng nhập không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4">
                        <BookOpen size={28} className="text-white" />
                    </div>
                    <h1 className="text-white font-black text-xl tracking-tight">E-Library Admin</h1>
                    <p className="text-slate-500 text-sm mt-1">Bảng quản trị thư viện điện tử</p>
                </div>

                {errorMsg && (
                    <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                        <span>✕</span> {errorMsg}
                    </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] mt-2 ${loading ? 'bg-amber-400/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20'}`}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
                    <ShieldCheck size={13}/> Khu vực quản trị bảo mật
                </div>
            </div>
        </div>
    );
}
