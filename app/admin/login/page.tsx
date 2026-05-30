'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Cross = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setErrorMsg('');
        try {
            const res = await api.post('/admin/login', { email, password });
            document.cookie = `token=${res.data.data.accessToken}; path=/; max-age=604800; samesite=lax`;
            router.push('/admin/dashboard');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Thông tin đăng nhập không đúng');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={{ background: '#0D0407' }}>
            {/* Background pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 50px)' }}/>

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                         style={{ border: '2px solid #C9A227', color: '#C9A227', boxShadow: '0 0 30px rgba(201,162,39,0.2)' }}>
                        <Cross size={28}/>
                    </div>
                    <h1 className="font-black text-white text-lg">Thư Viện Công Giáo</h1>
                    <p className="text-xs mt-1 italic" style={{ color: '#C9A227' }}>Bibliotheca Catholica</p>
                    <div className="flex items-center gap-2 mt-3" style={{ color: 'rgba(201,162,39,0.4)' }}>
                        <span className="text-xs">✦</span>
                        <div className="h-px w-16" style={{ background: 'rgba(201,162,39,0.3)' }}/>
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: '#7a3a46' }}>Admin Panel</span>
                        <div className="h-px w-16" style={{ background: 'rgba(201,162,39,0.3)' }}/>
                        <span className="text-xs">✦</span>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                         style={{ background: 'rgba(123,26,26,0.4)', border: '1px solid rgba(180,60,60,0.3)', color: '#f4a0a0' }}>
                        ✕ {errorMsg}
                    </div>
                )}

                <div className="rounded-2xl p-6" style={{ background: 'rgba(59,14,30,0.6)', border: '1px solid rgba(201,162,39,0.2)', backdropFilter: 'blur(10px)' }}>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C9A227' }}>Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,162,39,0.2)', color: 'white' }}
                                onFocus={e => { e.target.style.borderColor = 'rgba(201,162,39,0.6)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(201,162,39,0.2)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C9A227' }}>Mật khẩu</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-11 rounded-xl outline-none text-sm transition-all"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,162,39,0.2)', color: 'white' }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(201,162,39,0.6)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(201,162,39,0.2)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#7a3a46' }}>
                                    {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-2"
                            style={{ background: '#C9A227', color: '#3B0E1E', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 20px rgba(201,162,39,0.3)' }}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-2 mt-5 text-xs" style={{ color: '#5a2a3a' }}>
                    <ShieldCheck size={12}/> Khu vực quản trị bảo mật
                </div>
            </div>
        </div>
    );
}
